+++
date = '2026-11-09T16:13:39+06:30'
draft = false
title = 'Headache'
events = ['Reversing Tracks'] # Example: ['eCTF 2026']
cover = '/images/covers/11.jpg'
difficulty = 'medium'
tags = ['rev'] # Example: ['rev', 'your-custom-tag']
+++

### Challenge File

[headache](/challenges/headache/headache)

## Analyzing

ဒါကတော့ dumps ထားတဲ့ dynamic functions offsets တွေပါ စတုန်းကတော့ dump တာမပြတော့မလို့ ဒါပေမဲ့ ဖတ်ရတာအဆင်ပြေအောင် dumps တာတွေလည်းပြပေးထားတာပါ 

```
pwndbg> tele 0x555555554000+0x5018 21
00:0000│     0x555555559018 —▸ 0x7ffff7ca8e50 (free) ◂— endbr64
01:0008│     0x555555559020 —▸ 0x7ffff7c85e40 (putchar) ◂— endbr64
02:0010│     0x555555559028 —▸ 0x555555555056 ◂— push 2
03:0018│     0x555555559030 —▸ 0x7ffff7d79100 (__strlen_avx2) ◂— endbr64
04:0020│     0x555555559038 —▸ 0x555555555076 ◂— push 4
05:0028│     0x555555559040 —▸ 0x7ffff7c5b8b0 (printf) ◂— endbr64
06:0030│     0x555555559048 —▸ 0x555555555096 ◂— push 6
07:0038│     0x555555559050 —▸ 0x7ffff7c81ad0 (fgets) ◂— endbr64
08:0040│     0x555555559058 —▸ 0x5555555550b6 ◂— push 8
09:0048│     0x555555559060 —▸ 0x7ffff7ca8960 (malloc) ◂— endbr64
0a:0050│     0x555555559068 —▸ 0x7ffff7c81740 (fflush) ◂— endbr64
0b:0058│     0x555555559070 —▸ 0x5555555550e6 ◂— push 0xb /* 'h\x0b' */
0c:0060│     0x555555559078 —▸ 0x7ffff7d1d1b0 (ptrace) ◂— endbr64
0d:0068│     0x555555559080 —▸ 0x555555555106 ◂— push 0xd /* 'h\r' */
0e:0070│     0x555555559088 —▸ 0x555555555116 ◂— push 0xe
0f:0078│     0x555555559090 —▸ 0x555555555126 ◂— push 0xf
10:0080│     0x555555559098 —▸ 0x555555555136 ◂— push {pd}
11:0088│     0x5555555590a0 —▸ 0x555555555146 ◂— push {pd+0x1}
12:0090│     0x5555555590a8 —▸ 0x555555555156 ◂— push {pd+0x2}
13:0098│     0x5555555590b0 —▸ 0x7ffff7caf320 (strdup) ◂— endbr64
14:00a0│     0x5555555590b8 —▸ 0x7ffff7d038b0 (sleep) ◂— endbr64
```

```bash
readelf -r --use-dynamic ./headache

readelf: Error: no .dynamic section in the dynamic segment

'RELA' relocation section at offset 0x760 contains 264 bytes:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000004de0  000000000008 R_X86_64_RELATIVE                    1275
000000004de8  000000000008 R_X86_64_RELATIVE                    1270
000000004df0  000000000008 R_X86_64_RELATIVE                    1230
0000000050c8  000000000008 R_X86_64_RELATIVE                    50c8
000000004fd8  000300000006 R_X86_64_GLOB_DAT 0000000000000000 _ITM_deregisterTM[...] + 0
000000004fe0  000900000006 R_X86_64_GLOB_DAT 0000000000000000 __libc_start_main@GLIBC_2.2.5 + 0
000000004fe8  000c00000006 R_X86_64_GLOB_DAT 0000000000000000 __gmon_start__ + 0
000000004ff0  001700000006 R_X86_64_GLOB_DAT 0000000000000000 _ITM_registerTMCl[...] + 0
000000004ff8  001b00000006 R_X86_64_GLOB_DAT 0000000000000000 __cxa_finalize@GLIBC_2.2.5 + 0
000000005150  001a00000005 R_X86_64_COPY     0000000000005150 stdout@GLIBC_2.2.5 + 0
000000005160  001c00000005 R_X86_64_COPY     0000000000005160 stdin@GLIBC_2.2.5 + 0

'PLT' relocation section at offset 0x868 contains 504 bytes:
  Offset          Info           Type           Sym. Value    Sym. Name + Addend
000000005018  000100000007 R_X86_64_JUMP_SLO 0000000000000000 free@GLIBC_2.2.5 + 0
000000005020  000200000007 R_X86_64_JUMP_SLO 0000000000000000 putchar@GLIBC_2.2.5 + 0
000000005028  000400000007 R_X86_64_JUMP_SLO 0000000000000000 puts@GLIBC_2.2.5 + 0
000000005030  000500000007 R_X86_64_JUMP_SLO 0000000000000000 strlen@GLIBC_2.2.5 + 0
000000005038  000600000007 R_X86_64_JUMP_SLO 0000000000000000 mmap@GLIBC_2.2.5 + 0
000000005040  000700000007 R_X86_64_JUMP_SLO 0000000000000000 printf@GLIBC_2.2.5 + 0
000000005048  000800000007 R_X86_64_JUMP_SLO 0000000000000000 close@GLIBC_2.2.5 + 0
000000005050  000a00000007 R_X86_64_JUMP_SLO 0000000000000000 fgets@GLIBC_2.2.5 + 0
000000005058  000b00000007 R_X86_64_JUMP_SLO 0000000000000000 strcmp@GLIBC_2.2.5 + 0
000000005060  000d00000007 R_X86_64_JUMP_SLO 0000000000000000 malloc@GLIBC_2.2.5 + 0
000000005068  000e00000007 R_X86_64_JUMP_SLO 0000000000000000 fflush@GLIBC_2.2.5 + 0
000000005070  000f00000007 R_X86_64_JUMP_SLO 0000000000000000 __fxstat@GLIBC_2.2.5 + 0
000000005078  001000000007 R_X86_64_JUMP_SLO 0000000000000000 ptrace@GLIBC_2.2.5 + 0
000000005080  001100000007 R_X86_64_JUMP_SLO 0000000000000000 mprotect@GLIBC_2.2.5 + 0
000000005088  001200000007 R_X86_64_JUMP_SLO 0000000000000000 open@GLIBC_2.2.5 + 0
000000005090  001300000007 R_X86_64_JUMP_SLO 0000000000000000 perror@GLIBC_2.2.5 + 0
000000005098  001400000007 R_X86_64_JUMP_SLO 0000000000000000 strtok@GLIBC_2.2.5 + 0
0000000050a0  001500000007 R_X86_64_JUMP_SLO 0000000000000000 sysconf@GLIBC_2.2.5 + 0
0000000050a8  001600000007 R_X86_64_JUMP_SLO 0000000000000000 exit@GLIBC_2.2.5 + 0
0000000050b0  001800000007 R_X86_64_JUMP_SLO 0000000000000000 strdup@GLIBC_2.2.5 + 0
0000000050b8  001900000007 R_X86_64_JUMP_SLO 0000000000000000 sleep@GLIBC_2.2.5 + 0
```

| PLT Stub Offset | Function Name in IDA | GOT Pointer Offset | Real Libc Function |
| :--- | :--- | :--- | :--- |
| `+0x1030` | `sub_1030` | `+0x5018` | `free` |
| `+0x1040` | `sub_1040` | `+0x5020` | `putchar` |
| `+0x1050` | `sub_1050` | `+0x5028` | `puts` |
| `+0x1060` | `sub_1060` | `+0x5030` | `strlen` |
| `+0x1070` | `sub_1070` | `+0x5038` | `mmap` |
| `+0x1080` | `sub_1080` | `+0x5040` | `printf` |
| `+0x1090` | `sub_1090` | `+0x5048` | `close` |
| `+0x10A0` | `sub_10A0` | `+0x5050` | `fgets` |
| `+0x10B0` | `sub_10B0` | `+0x5058` | `strcmp` |
| `+0x10C0` | `sub_10C0` | `+0x5060` | `malloc` |
| `+0x10D0` | `sub_10D0` | `+0x5068` | `fflush` |
| `+0x10E0` | `sub_10E0` | `+0x5070` | `__fxstat` |
| `+0x10F0` | `sub_10F0` | `+0x5078` | `ptrace` |
| `+0x1100` | `sub_1100` | `+0x5080` | `mprotect` |
| `+0x1110` | `sub_1110` | `+0x5088` | `open` |
| `+0x1120` | `sub_1120` | `+0x5090` | `perror` |
| `+0x1130` | `sub_1130` | `+0x5098` | `strtok` |
| `+0x1140` | `sub_1140` | `+0x50A0` | `sysconf` |
| `+0x1150` | `sub_1150` | `+0x50A8` | `exit` |
| `+0x1160` | `sub_1160` | `+0x50B0` | `strdup` |
| `+0x1170` | `sub_1170` | `+0x50B8` | `sleep` |


```bash
./headache
Initialising.....
Enter the key: blahblah
Login Failed!
```

အဲ့ဒီတော့က run လိုက်တဲ့အခါ key တောင်းတာပေါ့ key က ဘာ key လဲမသိတော့ ida နဲ့ disassemble လုပ်ပြီးကြည့်လိုက်ရအောင် 

![image](/images/headache/1.jpg)

အဲ့ဒီတော့က ဒီမှာဆိုရင် main functions ကို decompile လိုက်တာပေါ့ ကျနော်ဘာတွေမှန်းမသိလို့ shift+f12 နဲ့ string view နဲ့ကြည့်လိုက်တော့ "Enter the key:" ဒီလို strings လေးတွေ တွေ့တာပေါ့ xref နဲ့ ကြည့်လိုက်တော့ ဒီ function လေးကိုတွေ့ပါလိမ့်မယ် sub_13C1()

```c
unsigned __int64 sub_13C1()
{
  __int64 v0; // rcx
  __int64 v1; // rsi
  __int64 v2; // r8
  __int64 v3; // r9
  __int64 v4; // rdx
  __int64 v5; // rcx
  __int64 v6; // rsi
  __int64 v7; // r8
  __int64 v8; // r9
  __int64 v9; // rdi
  unsigned __int64 v10; // rbx
  unsigned __int64 result; // rax
  __int64 v12; // [rsp-38h] [rbp-88h]
  __int64 v13; // [rsp-30h] [rbp-80h]
  __int64 v14; // [rsp-28h] [rbp-78h]
  __int64 v15; // [rsp+0h] [rbp-50h] BYREF
  __int64 v16; // [rsp+10h] [rbp-40h]
  _BYTE v17[8]; // [rsp+20h] [rbp-30h] BYREF
  __int64 v18; // [rsp+28h] [rbp-28h]
  int k; // [rsp+3Ch] [rbp-14h]
  int v20; // [rsp+44h] [rbp-Ch]
  int j; // [rsp+48h] [rbp-8h]
  int i; // [rsp+4Ch] [rbp-4h]

  v20 = sub_10F0(a1: 0, a2: 0, a3: 1, a4: 0);
  sub_1080(a1: "Initialising");
  sub_10D0(a1: stdout);
  for ( i = 0; i <= 4; ++i )
  {
    sub_1170(a1: 1);
    sub_1040(a1: 46);
    sub_10D0(a1: stdout);
  }
  sub_1040(a1: 10);
  sub_1080(a1: "Enter the key: ");
  sub_10A0(a1: v17, a2: 30, a3: stdin);
  sub_1130(a1: v17, a2: "\n");
  LODWORD(v16) = 420764753;
  BYTE4(v16) = 0;
  if ( sub_1060(
         a1: v17,
         a2: v1,
         a3: 0x55112D1C12460D02LL,
         a4: v0,
         a5: v2,
         a6: v3,
         a7: 0x3A0E551C0F31312ALL,
         a8: 0x55112D1C12460D02LL,
         a9: v16) != 20 )
  {
    sub_1050(a1: "Login Failed!");
    sub_1150(a1: 1);
  }
  for ( j = 0; j <= 19; ++j )
  {
    sub_135F(a1: &v15, a2: (unsigned int)j);
    if ( *((_BYTE *)&v15 + j) != v17[j] )
    {
      sub_1050(a1: "Login Failed!");
      sub_1150(a1: 1);
    }
  }
  sub_1050(a1: "Login success!");
  sub_1150(a1: 0);
  v18 = v9;
  for ( k = 0; ; ++k )
  {
    v10 = k;
    result = sub_1060(a1: v18, a2: v6, a3: v4, a4: v5, a5: v7, a6: v8, a7: v12, a8: v13, a9: v14);
    if ( v10 >= result )
      break;
    v5 = *(unsigned __int8 *)(k + v18) ^ 0x61u;
    v4 = v5;
    *(_BYTE *)(k + v18) ^= 0x61u;
  }
  return result;
}
```

အဲ့လိုနဲ့ ကျနော်လည်း ဒီ function ကို flag function ထင်လိုက်တာပေါ့ အဲ့ဒီတော့က သူက functions တွေကို offset pointer နဲ့ခေါ်ထားတာပါ functions တွေကို သိချင်ရင်တော့ gdb မှာ dump ရပါတယ် dynamic ကျနော်ကတော့ dump တာမပြတော့ပါဘူး အဲ့ဒီတော့က 

```c
 for ( j = 0; j <= 19; ++j )
  {
    sub_135F(a1: &v15, a2: (unsigned int)j);
    if ( *((_BYTE *)&v15 + j) != v17[j] )
    {
      sub_1050(a1: "Login Failed!");
      sub_1150(a1: 1);
    }
  }
  sub_1050(a1: "Login success!");
```

ဒီ code မှာဆိုရင် flag check တာပေါ့ v17 က ကျနော်တို့ရဲ့ input ဖြစ်ပြီးတော့ v15 ကတော့ နှိုင်းယှဥ်မဲ့ဟာပေါ့ ဒီ function ကိုတစ်ချက်ကြည့်ရအောင် `sub_135F(a1: &v15, a2: (unsigned int)j);`

```c
_BYTE *__fastcall sub_135F(__int64 a1, int a2)
{
  _BYTE *result; // rax
  char v3[32]; // [rsp+Ch] [rbp-20h] BYREF

  strcpy(v3, "bestkeyeverforrealxd");
  result = (_BYTE *)(a2 + a1);
  *result ^= v3[a2];
  return result;
}
``` 

အဲဒီတော့က v15 ကို "bestkeyeverforrealxd" ဒီ xor key နဲ့ xor ပြီး check တာပေါ့ အဲ့လိုနဲ့ ကျနော်လည်း v15 value ကိုလိုက်ရှာတော့ text view ကနေ

```c
.data:00000000000014E3 loc_14E3:                               ; CODE XREF: sub_13C1+169↓j
.data:00000000000014E3                 mov     edx, [rbp+var_8]
.data:00000000000014E6                 lea     rax, [rbp+var_50]
.data:00000000000014EA                 mov     esi, edx
.data:00000000000014EC                 mov     rdi, rax
.data:00000000000014EF                 call    sub_135F
```

`rax, [rbp+var_50]` အဲ့ဒီတော့ ဒါက  v15 ပေါ့ အပေါ်နည်းနည်းဆွဲကြည့်တော့ 

```c
.data:000000000000148B                 mov     rax, 3A0E551C0F31312Ah
.data:0000000000001495                 mov     rdx, 55112D1C12460D02h
.data:000000000000149F                 mov     [rbp+var_50], rax
.data:00000000000014A3                 mov     [rbp+var_48], rdx
.data:00000000000014A7                 mov     [rbp+var_40], 19145C51h
``` 

အဲ့ဒီတော့က script လေးရေးလိုက်ရအောင် extract ဖို့ xor logic ကိုသိပြီးသားဖြစ်မှာပေါ့ အဲ့တော့ little endian လုပ်ပြီး key နဲ့ xor လုပ်ပြီး extract လိုက်ရအောင် 

```python
part1 = ["3A0E551C0F31312A"[i:i+2] for i in range(0, len("3A0E551C0F31312A"), 2)][::-1]
part2 = ["55112D1C12460D02"[i:i+2] for i in range(0, len("55112D1C12460D02"), 2)][::-1]
part3 = ["19145C51"[i:i+2] for i in range(0, len("19145C51"), 2)][::-1]
key = b"bestkeyeverforrealxd"
flag = part1 + part2 + part3
real_flag = ""
for i in range(len(flag)):
	real_flag += chr(int(flag[i], 16) ^ key[i % len(key)])

print(real_flag)

HTB{w0w_th4ts_c000l}
```

အဲ့လိုနဲ့ ကျနော် flag ထည့်ကြည့်လိုက်တော့ flag ကမှန်မနေဘူး အဲ့လိုနဲ့ ဘာဖြစ်တာလဲပေါ့ လိုက်ရှာရင်းနဲ့ sub_13C1 xref နဲ့ကြည့်လိုက်တော့ 

```c
.data:0000000000001275 loc_1275:                               ; DATA XREF: LOAD:off_4DE0↓o
.data:0000000000001275                 push    rbp
.data:0000000000001276                 mov     rbp, rsp
.data:0000000000001279                 sub     rsp, 40h
.data:000000000000127D                 mov     rax, 1
.data:0000000000001284                 mov     rdi, 1
.data:000000000000128B                 mov     rdx, 64h ; 'd'
.data:0000000000001292                 xor     rax, rdx
.data:0000000000001295                 xor     rdi, rdi
.data:0000000000001298                 xor     rdx, rdx
.data:000000000000129B                 syscall                 ; LINUX - sys_ptrace
.data:000000000000129D                 mov     [rbp-4], eax
.data:00000000000012A0                 mov     rax, 68686A4D6C5A575Ah
.data:00000000000012AA                 mov     rdx, 784D575A79636A4Eh
.data:00000000000012B4                 mov     [rbp-40h], rax
.data:00000000000012B8                 mov     [rbp-38h], rdx
.data:00000000000012BC                 mov     rax, 6D563259306B6A4Dh
.data:00000000000012C6                 mov     rdx, 6B686A5930553259h
.data:00000000000012D0                 mov     [rbp-30h], rax
.data:00000000000012D4                 mov     [rbp-28h], rdx
.data:00000000000012D8                 mov     rax, 6B4657597A41545Ah
.data:00000000000012E2                 mov     [rbp-20h], rax
.data:00000000000012E6                 mov     dword ptr [rbp-18h], 3D497A59h
.data:00000000000012ED                 mov     byte ptr [rbp-14h], 0
.data:00000000000012F1                 lea     rax, [rbp-40h]
.data:00000000000012F5                 mov     edx, 0Ah
.data:00000000000012FA                 mov     esi, 2Dh ; '-'
.data:00000000000012FF                 mov     rdi, rax
.data:0000000000001302                 call    sub_17E2
.data:0000000000001307                 mov     [rbp-10h], rax
.data:000000000000130B                 lea     rdi, aA15abe90c112d0 ; "a15abe90c112d09369d9f9da9a8c046e"
.data:0000000000001312                 call    sub_1ED2
.data:0000000000001317                 cmp     dword ptr [rbp-4], 0
.data:000000000000131B                 jnz     short loc_1352
.data:000000000000131D                 mov     rax, cs:stdout
.data:0000000000001324                 mov     rdi, rax
.data:0000000000001327                 call    sub_10D0
.data:000000000000132C                 lea     rsi, unk_2684
.data:0000000000001333                 lea     rdi, loc_1FAF
.data:000000000000133A                 call    sub_1E33
.data:000000000000133F                 mov     rdx, [rbp-10h]
.data:0000000000001343                 mov     eax, [rbp-4]
.data:0000000000001346                 mov     rsi, rdx
.data:0000000000001349                 mov     edi, eax
.data:000000000000134B                 call    loc_1FAF
.data:0000000000001350                 jmp     short locret_135D
.data:0000000000001352 ; ---------------------------------------------------------------------------
.data:0000000000001352
.data:0000000000001352 loc_1352:                               ; CODE XREF: .data:000000000000131B↑j
.data:0000000000001352                 mov     eax, 0
.data:0000000000001357                 call    sub_13C1 -> ဒီမှာပါ call ထားတာက 
.data:000000000000135C                 nop
.data:000000000000135D
.data:000000000000135D locret_135D:                            ; CODE XREF: .data:0000000000001350↑j
.data:000000000000135D                 leave
.data:000000000000135E                 retn
.data:000000000000135F
```

ဒီ text view ကိုတွေ့ပါလိမ့်မယ် အဲ့လိုနဲ့ အပေါ်နည်းနည်းကြည့်လိုက်တော့ ptrace ကို syscall နဲ့ခေါ်ထားတာပါ အဲ့ကြောင်း functions view ထဲမှာ loc_1275 ဒီ function ကိုမတွေ့ရတာပါ define ပေးလိုက်ရအောင် 0000000000001275 ကို cursor ထောက်လိုက်ပါ ပြီးရင် P ကိုနှိပ်လိုက်ပါ auto function define လုပ်ပေးပါလိမ့်မယ် အဲ့လိုနဲ့ sub_1275 function လေးကို ရလာပါလိမ့်မယ် pseudo view F5 နဲ့ကြည့်လိုက်ရအောင် 

```c
__int64 sub_1275()
{
  char v1[48]; // [rsp+0h] [rbp-40h] BYREF
  __int64 v2; // [rsp+30h] [rbp-10h]
  unsigned int v3; // [rsp+3Ch] [rbp-4h]

  __asm { syscall; LINUX - sys_ptrace }
  v3 = 101;
  strcpy(v1, "ZWZlMjhhNjcyZWMxMjk0Y2VmY2U0YjhkZTAzYWFkYzI=");
  v2 = ((__int64 (__fastcall *)(char *, __int64, __int64))sub_17E2)(a1: v1, a2: 45, a3: 10);
  sub_1ED2(a1: "a15abe90c112d09369d9f9da9a8c046e");
  if ( v3 != 0 )
    return sub_13C1(); -> our previous flag checker function 
  sub_10D0(a1: stdout);
  sub_1E33(a1: &loc_1FAF, a2: &unk_2684);
  return ((__int64 (__fastcall *)(_QWORD, __int64))loc_1FAF)(a1: v3, a2: v2);
}
``` 

ptrace က gdb attach ရင်ကြ -1 ဖြစ်ပြီး gdb not attach ကြ 0 ဖြစ်ပါတယ် အဲ့ဒီတော့က ကျနော်တို့ ရလာတဲ့ flag က fake trap flag ပေါ့ ပြပါမယ် ဟုတ်မဟုတ်လေးဆိုတာ 

```
./headache
Initialising.....
Enter the key: HTB{w0w_th4ts_c000l}
Login Failed!

pwndbg ./headache

pwndbg> r
Starting program: /mnt/c/Users/gh0st69/Downloads/a12c733c-a2f8-432f-b945-2eb597b4a97e/headache
Downloading separate debug info for system-supplied DSO at 0x7ffff7fbc000
[Thread debugging using libthread_db enabled]
Using host libthread_db library "/usr/lib/libthread_db.so.1".
Initialising.....
Enter the key: HTB{w0w_th4ts_c000l}
Login success!
```

အဲ့ဒိတော့က gdb attach လိုက်တယ်ဆိုရင် sub_13C1() fake flag checker function ကိုခေါ်ပြီး gdb not attach ဆိုရင် 
```c
sub_10D0(a1: stdout);
sub_1E33(a1: &loc_1FAF, a2: &unk_2684);
return ((__int64 (__fastcall *)(_QWORD, __int64))loc_1FAF)(a1: v3, a2: v2);
```

ဒီ function တွေကိုအလုပ်ဆက်လုပ်ပါလိမ့်မယ် အဲ့ဒီတော့ loc_1FAF သတိထားမိမလားတော့မသိပေမဲ့ ကျနော်တို့ရဲ့ စစချင်း start ဆိုတဲ့ entry မှာရှိတဲ့ function လေးပါ 

```c
// positive sp value has been detected, the output may be wrong!
void __fastcall __noreturn start(__int64 a1, __int64 a2, __int64 a3)
{
  __int64 v3; // rax
  __int64 v4; // rsi
  __int64 v5; // [rsp-8h] [rbp-8h] BYREF
  _UNKNOWN *retaddr; // [rsp+0h] [rbp+0h] BYREF

  v4 = v5;
  v5 = v3;
  ((void (__fastcall *)(void *, __int64, _UNKNOWN **, void *, void *, __int64, __int64 *))qword_4FE0)(
    a1: &loc_1FAF,
    a2: v4,
    a3: &retaddr,
    a4: &unk_1F30,
    a5: &unk_1F90,
    a6: a3,
    a7: &v5);
  __halt();
}
```

အဲ့ဒီတော့က `sub_1E33(a1: &loc_1FAF, a2: &unk_2684);` ဒီ function လေးကို တစ်ချက်ကြည့်လိုက်ရအောင် ဘာတွေလုပ်ထားတာလဲဆိုရင် 
```
__int64 __fastcall sub_1E33(__int64 a1, int a2)
{
  __int64 v5; // [rsp+28h] [rbp-8h]

  v5 = sub_1140(a1: 30);
  if ( qword_5178 == 0 )
    sub_1150(a1: 1);
  if ( (int)sub_1100(a1: -v5 & a1, a2: (int)(a2 - (-(int)v5 & a1)), a3: 7) < 0 )
    sub_1120(a1: "mprotect:");
  return sub_1D07(a1, a2: (unsigned int)(a2 - a1));
}
```

`sub_1D07(a1, a2: (unsigned int)(a2 - a1));` ဒီ function တွေထဲကို ၀င်ကြည့်လိုက်တဲ့အခါမှာ 

```c
__int64 __fastcall sub_1D07(__int64 a1, signed int a2)
{
  __int64 result; // rax
  signed int i; // [rsp+18h] [rbp-4h]

  for ( i = 0; ; ++i )
  {
    result = (unsigned int)i;
    if ( i >= a2 )
      break;
    *(_BYTE *)(i + a1) ^= *(_BYTE *)(qword_5178 + i % dword_5180);
  }
  return result;
}
```
qword_5178 နဲ့ dword_5180 ဆိုတဲ့ဟာကို ကျနော်တို့က လိုက်ရှာလိုက်တဲ့အခါမှာ 

```c
sub_1ED2(a1: "a15abe90c112d09369d9f9da9a8c046e");

__int64 __fastcall sub_1ED2(__int64 a1)
{
  __int64 result; // rax

  if ( qword_5178 == 0 )
    sub_1030(a1: 0);
  qword_5178 = sub_1160(a1);
  result = sub_1060(a1);
  dword_5180 = result;
  return result;
}
```

အဲ့ဒီတော့က အပေါ်ယံအားဖြင့်ခန့်မှန်လို့ရပြီပေါ့ `qword_5178 = sub_1160(a1); a15abe90c112d09369d9f9da9a8c046e` က ဒါဖြစ်ပြီးတော့ `dword_5180 = strlen(a1)` ဖြစ်မှာပေါ့ အဲ့ဒီတော့က `i % dword_5180` ပုံစံဆိုတော့ ဒါက key value ဖြစ်ပါလိမ့်မယ် အဲ့ဒီတော့က 

`sub_1D07(a1, a2: (unsigned int)(a2 - a1));` ဒီ function ကိုတစ်ချက်ပြန်ကြည့်လိုက်ရအောင် a1 = loc_1FAF ကျနော်တို့ရဲ့ main address ဖြစ်ပြီးတော့ a2 = &unk_2684 end address  ဖြစ်ပါလိမ့်မယ် -> ဘယ်လိုသိလဲဆိုရင် unk_2684 - loc_1FAF end ထဲကနေ start ကိုနှုတ်လိုက်ပြီး length ရလာပြီး အဲ့ length နဲ့ loop ပတ်ပြီး  self-decrypting လုပ်ပါတယ် အဲ့ဒီတော့က ကျနော်တို့ ida နဲ့ decrypt လိုက်ရအောင် 

```python
import ida_bytes, idc, ida_funcs, ida_auto

key = b"a15abe90c112d09369d9f9da9a8c046e"
start = 0x1FAF
end = 0x2684
length = end - start

orig = ida_bytes.get_bytes(start, length)
decrypted = bytes([orig[i] ^ key[i % len(key)] for i in range(length)])
ida_bytes.patch_bytes(start, decrypted)

ida_funcs.del_func(start)
idc.del_items(start, idc.DELIT_SIMPLE, length)

ida_auto.auto_make_code(start)

ida_auto.auto_wait()

ida_funcs.add_func(start, end)

idc.set_name(start, "main_real", idc.SN_CHECK)

print("Done! Resolved 'main_real' functions -- Time To View main_real")
```

အဲ့ဒီ execute ပြီးနောက်ပိုင်း boom! ကျနော်တို့ main_real function ဆိုတဲ့ဟာကြီးရလာပါလိမ့်မယ် 

```c
void __fastcall main_real(int a1, __int64 a2)
{
  __int64 v2; // rcx
  __int64 v3; // r8
  __int64 v4; // r9
  _BYTE v7[32]; // [rsp+10h] [rbp-C0h]
  _QWORD v8[2]; // [rsp+30h] [rbp-A0h] BYREF
  __int16 v9; // [rsp+40h] [rbp-90h]
  char v10; // [rsp+42h] [rbp-8Eh]
  char v11[32]; // [rsp+50h] [rbp-80h] BYREF
  _BYTE v12[32]; // [rsp+70h] [rbp-60h] BYREF
  _BYTE v13[39]; // [rsp+90h] [rbp-40h] BYREF
  unsigned __int8 v14; // [rsp+B7h] [rbp-19h]
  __int64 v15; // [rsp+B8h] [rbp-18h]
  int v16; // [rsp+C0h] [rbp-10h]
  int v17; // [rsp+C4h] [rbp-Ch]
  unsigned int j; // [rsp+C8h] [rbp-8h]
  int i; // [rsp+CCh] [rbp-4h]

  v17 = sub_10F0(a1: 0, a2: 0, a3: 1, a4: 0);
  sub_1080(a1: "Initialising");
  sub_10D0(a1: stdout);
  for ( i = 0; i <= 4; ++i )
  {
    sub_1170(a1: 1);
    sub_1040(a1: 46);
    sub_10D0(a1: stdout);
  }
  sub_1040(a1: 10);
  sub_1080(a1: "Enter the key: ");
  sub_10A0(a1: v13, a2: 30, a3: stdin);
  sub_1130(a1: v13, a2: "\n");
  qmemcpy(v12, "HTB{w0w_th4ts_c000l}", 20);
  if ( sub_1060(a1: v13) != 20 )
  {
    sub_1050(a1: "Login Failed!");
    sub_1150(a1: 1);
  }
  strcpy(v11, "SFRCe3RoMXNfMXNfdGgzX2ZsNGd9");
  sub_17E2(a1: v11, a2: 10, a3: 10, a4: v2, a5: v3, a6: v4, a7: a2);
  v8[0] = 0x155509151A233529LL;
  v8[1] = 0x1355093E1255163ELL;
  v9 = 7173;
  v10 = 0;
  ((void (__fastcall *)(_QWORD *))loc_1542)(a1: v8);
  if ( 100 * (a1 + 2) == 100 )
  {
    if ( (unsigned int)sub_10B0(a1: v13, a2: v12) == 0 )
    {
      sub_1050(a1: "Login success!");
      sub_1150(a1: 0);
    }
    sub_1050(a1: "Login Failed!");
    sub_1150(a1: 1);
  }
  v16 = a1;
  if ( 100 * (a1 + 2) == 100 )
  {
    v15 = 0;
    dword_0 = 2131;
  }
  v7[0] = 7;
  v7[1] = -2;
  v7[2] = -115;
  v7[3] = 13;
  v7[4] = -46;
  v7[5] = -28;
  v7[6] = -2;
  v7[7] = 8;
  v7[8] = -17;
  v7[9] = 87;
  v7[10] = 71;
  v7[11] = -37;
  v7[12] = 77;
  v7[13] = -106;
  v7[14] = 47;
  v7[15] = 59;
  v7[16] = -88;
  v7[17] = -69;
  v7[18] = 112;
  v7[19] = 17;
  v7[20] = -83;
  for ( j = 0; j <= 0x14; ++j )
  {
    v14 = v7[j];
    v14 = (v14 >> 5) | (8 * v14);
    v14 = ~v14;
    v14 += 47;
    v14 ^= 0x26u;
    v14 = (v14 >> 5) | (8 * v14);
    v14 -= 2;
    v14 = -v14;
    v14 = (v14 >> 2) | (v14 << 6);
    v14 = ~v14;
    v14 += 71;
    v14 = ~v14;
    v14 ^= 0x43u;
    v14 -= 123;
    v14 = (v14 >> 5) | (8 * v14);
    v14 = ~v14;
    v14 += 81;
    v14 = (v14 >> 3) | (32 * v14);
    v14 += 116;
    v14 = (v14 >> 2) | (v14 << 6);
    v14 -= 38;
    v14 = (v14 >> 6) | (4 * v14);
    v14 += j;
    v14 ^= j;
    v14 = -v14;
    v14 ^= j;
    v14 += 121;
    v14 = (v14 >> 7) | (2 * v14);
    v14 -= 73;
    v14 ^= j;
    v14 -= 117;
    v14 = ~v14;
    v14 += 101;
    v14 = -v14;
    v14 += 8;
    v14 = ~v14;
    v14 = -v14;
    v14 ^= j;
    v14 -= j;
    v14 = ~v14;
    v14 += 97;
    v14 ^= 0x81u;
    v14 -= j;
    v14 ^= j;
    v14 += j;
    v14 = ~v14;
    v14 += j;
    v14 = -v14;
    v14 += j;
    v14 = ~v14;
    v14 -= 5;
    v14 = -v14;
    v14 ^= j;
    v14 = -v14;
    v14 ^= 0x15u;
    v14 += j;
    v14 = -v14;
    v14 -= j;
    v14 ^= 0x22u;
    v14 += 114;
    v14 = ~v14;
    v14 = -v14;
    v14 -= 102;
    v14 ^= 0x61u;
    v14 -= j;
    v14 ^= 0x2Cu;
    v14 += j;
    v14 ^= 1u;
    v14 -= 77;
    v14 = ~v14;
    v14 ^= 0x3Cu;
    v14 = -v14;
    v14 ^= 0x19u;
    v14 = ~v14;
    v14 += 113;
    v14 = (v14 >> 7) | (2 * v14);
    v14 += j;
    v14 ^= 0x40u;
    v14 = (v14 >> 7) | (2 * v14);
    v14 += 92;
    v14 ^= 0x6Du;
    v14 = (v14 >> 6) | (4 * v14);
    v14 = -v14;
    v14 ^= j;
    v14 += j;
    v14 = (v14 >> 5) | (8 * v14);
    v14 -= 27;
    v14 = ~v14;
    v14 = -v14;
    v14 -= j;
    v14 = ~v14;
    v14 += j;
    v14 = ~v14;
    v14 ^= 0x37u;
    v14 -= 22;
    v14 = -v14;
    v14 -= j;
    v14 = -v14;
    v14 ^= j;
    v14 += 99;
    v14 ^= 0xD9u;
    v14 = ~v14;
    v14 ^= 0x3Fu;
    v14 = ~v14;
    v14 += j;
    v14 ^= 0x39u;
    v14 -= j;
    v14 = ~v14;
    v14 -= j;
    v14 = -v14;
    v14 = ~v14;
    v14 -= 72;
    v14 = (v14 >> 1) | (v14 << 7);
    v14 ^= j;
    v14 = -v14;
    v14 ^= j;
    v14 += j;
    v14 = ~v14;
    v14 += j;
    v14 ^= 0x58u;
    v14 += 99;
    v14 = (v14 >> 2) | (v14 << 6);
    v14 = -v14;
    v14 += 10;
    v14 = ~v14;
    v14 -= j;
    v14 = ~v14;
    v14 = (v14 >> 3) | (32 * v14);
    v14 ^= j;
    v14 += j;
    v14 = -v14;
    v14 -= 120;
    v14 = ~v14;
    v14 ^= 0x59u;
    v14 = -v14;
    v14 = ~v14;
    v14 += 42;
    v14 = -v14;
    v14 += j;
    v14 ^= 0x15u;
    v14 -= 47;
    v14 = ~v14;
    v14 += 30;
    v14 ^= 0x17u;
    v14 -= j;
    v14 = ~v14;
    v14 -= 30;
    v14 ^= j;
    v14 = (v14 >> 6) | (4 * v14);
    v14 -= 70;
    v14 = -v14;
    if ( v14 != (char)v13[j] )
    {
      sub_1050(a1: "Login Failed!");
      sub_1150(a1: 1);
    }
  }
  sub_1050(a1: "Login success!");
  sub_1150(a1: 0);
  JUMPOUT(0x2684);
}
```

အဲ့ဒီတော့က first trap function ကတော့ 
```c
if ( (unsigned int)sub_10B0(a1: v13, a2: v12) == 0 )
    {
      sub_1050(a1: "Login success!");
      sub_1150(a1: 0);
    }
    sub_1050(a1: "Login Failed!");
    sub_1150(a1: 1);
```

တကယ့် real flag function ကိုကြည့်လိုက်ရအောင်

```
if ( v14 != (char)v13[j] )
    {
      sub_1050(a1: "Login Failed!");
      sub_1150(a1: 1);
    }
  }
  sub_1050(a1: "Login success!");
```

ဒီမှာဆိုရင် `v13[j]` က ကျနော်တို့ရဲ့ input ဖြစ်ပြီးတော့ v14 ကတော့ ကျနော်တို့ရဲ့ input နဲ့ check တဲ့ကောင်ပေါ့ obfuscation မပါဘူးဆိုတော့ မြန်မာလိုလေးပဲ copy paste ပြီးတော့ run လိုက်ရုံပါပဲ & 0xFF ထည့်ပြီး ဘာလို့ဆို unsigned __int8 v14 ဆိုတော့ ထည့်ပေးဖို့လိုတာပါ
v7 ရဲ့ value တွေကို v14 က ချိန်းပြီးတော့ v14 နဲ့နှိုင်းယှဥ်တာဆိုတော့ script လေးကတော့ 

```python 
v2 = [
    7, -2, -115, 13, -46, -28, -2, 8, -17, 87, 71, -37, 77, -106, 47, 59, -88, -69, 112, 17, -83
]

flag_chars = []
for j in range(len(v2)):
    v9 = v2[j] & 0xFF
    v9 = ((v9 >> 5) | (8 * v9)) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + 47) & 0xFF
    v9 ^= 0x26
    v9 = ((v9 >> 5) | (8 * v9)) & 0xFF
    v9 = (v9 - 2) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = ((v9 >> 2) | (v9 << 6)) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + 71) & 0xFF
    v9 = (~v9) & 0xFF
    v9 ^= 0x43
    v9 = (v9 - 123) & 0xFF
    v9 = ((v9 >> 5) | (8 * v9)) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + 81) & 0xFF
    v9 = ((v9 >> 3) | (32 * v9)) & 0xFF
    v9 = (v9 + 116) & 0xFF
    v9 = ((v9 >> 2) | (v9 << 6)) & 0xFF
    v9 = (v9 - 38) & 0xFF
    v9 = ((v9 >> 6) | (4 * v9)) & 0xFF
    v9 = (v9 + j) & 0xFF
    v9 ^= j
    v9 = (-v9) & 0xFF
    v9 ^= j
    v9 = (v9 + 121) & 0xFF
    v9 = ((v9 >> 7) | (2 * v9)) & 0xFF
    v9 = (v9 - 73) & 0xFF
    v9 ^= j
    v9 = (v9 - 117) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + 101) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 + 8) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (-v9) & 0xFF
    v9 ^= j
    v9 = (v9 - j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + 97) & 0xFF
    v9 ^= 0x81
    v9 = (v9 - j) & 0xFF
    v9 ^= j
    v9 = (v9 + j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + j) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 + j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 - 5) & 0xFF
    v9 = (-v9) & 0xFF
    v9 ^= j
    v9 = (-v9) & 0xFF
    v9 ^= 0x15
    v9 = (v9 + j) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 - j) & 0xFF
    v9 ^= 0x22
    v9 = (v9 + 114) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 - 102) & 0xFF
    v9 ^= 0x61
    v9 = (v9 - j) & 0xFF
    v9 ^= 0x2C
    v9 = (v9 + j) & 0xFF
    v9 ^= 1
    v9 = (v9 - 77) & 0xFF
    v9 = (~v9) & 0xFF
    v9 ^= 0x3C
    v9 = (-v9) & 0xFF
    v9 ^= 0x19
    v9 = (~v9) & 0xFF
    v9 = (v9 + 113) & 0xFF
    v9 = ((v9 >> 7) | (2 * v9)) & 0xFF
    v9 = (v9 + j) & 0xFF
    v9 ^= 0x40
    v9 = ((v9 >> 7) | (2 * v9)) & 0xFF
    v9 = (v9 + 92) & 0xFF
    v9 ^= 0x6D
    v9 = ((v9 >> 6) | (4 * v9)) & 0xFF
    v9 = (-v9) & 0xFF
    v9 ^= j
    v9 = (v9 + j) & 0xFF
    v9 = ((v9 >> 5) | (8 * v9)) & 0xFF
    v9 = (v9 - 27) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 - j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 ^= 0x37
    v9 = (v9 - 22) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 - j) & 0xFF
    v9 = (-v9) & 0xFF
    v9 ^= j
    v9 = (v9 + 99) & 0xFF
    v9 ^= 0xD9
    v9 = (~v9) & 0xFF
    v9 ^= 0x3F
    v9 = (~v9) & 0xFF
    v9 = (v9 + j) & 0xFF
    v9 ^= 0x39
    v9 = (v9 - j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 - j) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 - 72) & 0xFF
    v9 = ((v9 >> 1) | (v9 << 7)) & 0xFF
    v9 ^= j
    v9 = (-v9) & 0xFF
    v9 ^= j
    v9 = (v9 + j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + j) & 0xFF
    v9 ^= 0x58
    v9 = (v9 + 99) & 0xFF
    v9 = ((v9 >> 2) | (v9 << 6)) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 + 10) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 - j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = ((v9 >> 3) | (32 * v9)) & 0xFF
    v9 ^= j
    v9 = (v9 + j) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 - 120) & 0xFF
    v9 = (~v9) & 0xFF
    v9 ^= 0x59
    v9 = (-v9) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + 42) & 0xFF
    v9 = (-v9) & 0xFF
    v9 = (v9 + j) & 0xFF
    v9 ^= 0x15
    v9 = (v9 - 47) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 + 30) & 0xFF
    v9 ^= 0x17
    v9 = (v9 - j) & 0xFF
    v9 = (~v9) & 0xFF
    v9 = (v9 - 30) & 0xFF
    v9 ^= j
    v9 = ((v9 >> 6) | (4 * v9)) & 0xFF
    v9 = (v9 - 70) & 0xFF
    v9 = (-v9) & 0xFF
    flag_chars.append(v9)

print(bytes(flag_chars[:20]).decode('ascii'))

HTB{l4yl3_w4s_h3r3!}
```

ကျနော်တို့ရဲ့ final flag လေးကိုရရှိလာပါပြီ အဆုံးထိဖတ်ပေးတဲ့အတွက်ကျေးဇူးတင်ပါတယ်ဗျ :3

