+++
date = '2026-11-15T14:06:10+06:30'
title = 'pivoting'
cover = '/images/covers/12.jpg'
+++

## Chisel

```bash
In Local Machine 
chisel server --reverse --port 8080

In Target Machine
./chisel client 10.10.17.213:8080 R:socks &

proxychains -q curl -X GET http://$pivot-ip
```