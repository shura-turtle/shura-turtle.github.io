+++
date = '2026-11-04T19:40:29+06:30'
draft = false
title = 'Bombs Landed'
events = ['Reversing Tracks'] # Example: ['eCTF 2026']
cover = '/images/covers/15.png'
difficulty = 'medium'
tags = ['rev'] # Example: ['rev', 'your-custom-tag']
+++


### Challenge Files  

[BombsLanded](/challenges/BombsLanded/BombsLanded)
[BombsLanded.c](/challenges/BombsLanded/BombsLanded.c)

## Analyzing

![image](/images/bombslanded/1.jpg)

ဒီမှာဆိုရင် ida နဲ့ run လိုက်တဲ့အချိန်မှာ သူက main functions ကို သေချာ decompile မလုပ်နိုင်ပဲ ဖြစ်နေတာပေါ့ 

![image](/images/bombslanded/2.jpg)

ခုလိုမျိုး error တက်တာတွေ့ပါလိမ့်မယ် အဲ့တော့ broken main functions ကို fix ဖို့ ida script နဲ့ fix ကြရအောင် 

```python
import idc, ida_funcs, ida_auto
main_start = 0x08048937
main_end   = 0x08048AE7

idc.set_name(main_start, "main", idc.SN_NOWARN)

ida_funcs.del_func(main_start)

ida_funcs.add_func(main_start, main_end)
ida_auto.auto_wait()
print("[+] Resolved Main Functions")
```
အဲ့ဒီတော့ main functions ကို fix ပြီးသွားရင် F5 နဲ့ pseudo view ကို ကြည့်လို့ရပါပြီ 

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int v4; // [esp-6h] [ebp-38h]
  int v5; // [esp-2h] [ebp-34h]
  _DWORD *s; // [esp+2h] [ebp-30h]
  void *sa; // [esp+2h] [ebp-30h]
  unsigned int i; // [esp+16h] [ebp-1Ch]
  int v9; // [esp+1Ah] [ebp-18h]
  int v10; // [esp+1Eh] [ebp-14h]
  int v11; // [esp+26h] [ebp-Ch]
  int v12; // [esp+2Ah] [ebp-8h]
  int v13; // [esp+2Eh] [ebp-4h]

  dword_8049348 = (int)&off_8049130;
  ++dword_804934C;
  --dword_8049338;
  ++dword_804933C;
  --dword_8049340;
  if ( (unsigned int)dword_804934C > dword_804933C || argc <= 4 )
  {
    if ( argc > 3 )
    {
      printf(format: "input password: ");
      if ( (unsigned __int8)getchar() == 88 )
      {
        MEMORY[0xC3]();
        _isoc99_scanf(a1: "Correct password:");
      }
    }
    puts(s: "Bad luck dude.");
    JUMPOUT(0x8048A13);
  }
  s = mmap(addr: nullptr, len: 0x1000u, prot: 7, flags: 34, fd: -1, offset: 0);
  memset(s, c: 195, n: 0x1000u);
  *s = dword_80491A0[0];
  *(_DWORD *)((char *)s + 403) = *(_DWORD *)((char *)&dword_80491A0[100] + 3);
  qmemcpy(
    (void *)((unsigned int)(s + 1) & 0xFFFFFFFC),
    (const void *)((char *)dword_80491A0 - ((char *)s - ((unsigned int)(s + 1) & 0xFFFFFFFC))),
    4 * ((((unsigned int)s - ((unsigned int)(s + 1) & 0xFFFFFFFC) + 407) & 0xFFFFFFFC) >> 2));
  for ( i = 0; i <= 0x196; ++i )
    *((_BYTE *)s + i) ^= 0x63u;
  ((void (__stdcall *)(int, int, _DWORD *, _DWORD *, _DWORD *, _DWORD *, int *, unsigned int, int, int, int *, int, int, int))s)(
    a1: v4,
    a2: v5,
    a3: s,
    a4: &dword_8049340,
    a5: &dword_804933C,
    a6: &dword_8049338,
    a7: &dword_804934C,
    a8: i,
    a9: v9,
    a10: v10,
    a11: &argc,
    a12: v11,
    a13: v12,
    a14: v13);
  memset(s: sa, c: 0, n: 0x197u);
  exit(status: 0);
}
```

ဒီမှာဆိုရင် `s = mmap(blah, blah ....)` ကိုတွေ့ပါလိမ့်မယ် အဲ့ဒီတော့ s က mmap က 4kb ရှိတဲ့ memory address ကို create နေတာပါ အဲ့လိုနဲ့ အောက်ကိုဆက်ပြီးနည်းနည်းဖတ်ကြည့်ရင် 

```c
  for ( i = 0; i <= 0x196; ++i )
    *((_BYTE *)s + i) ^= 0x63u;
``` 

ဒါကို တွေ့ပါလိမ့်မယ် self-decrypting ပါ အဲ့ဒီတော့ s ရဲ့ value တွေကို တစ်ချက်သွားကြည့်ရအောင် `*s = dword_80491A0[0];`

```c
LOAD:080491A0 dword_80491A0   dd 3086EA36h, 63E78FE2h, 26A46363h, 5050178Fh, 0C726A40Fh
LOAD:080491A0                                         ; DATA XREF: main+11A↑o
LOAD:080491B4                 dd 71C0610h, 0CCB26A4h, 0A41B0C1Fh, 60ECF26h, 26A40700h
LOAD:080491C8                 dd 61D0ED3h, 0D726A40Fh, 40D0700h, 0DB26A405h, 26A4630Ch
LOAD:080491DC                 dd 7191EF0h, 0F426A402h, 16075703h, 4F826A4h, 0A4180004h
LOAD:080491F0                 dd 1305FC26h, 26A5574Dh, 26A463C0h, 63636397h, 0EE7D8863h
LOAD:08049204                 dd 26E8F036h, 6CB36297h, 93E063D5h, 0EEA2EA77h, 26E8F036h
LOAD:08049218                 dd 0EBB36297h, 9726E06Bh, 6F8FE062h, 33F026EEh, 67E443DBh
LOAD:0804922C                 dd 0E0B39C6Bh, 0A1EA73A7h, 5A9726E8h, 5AB14A1h, 46F326A4h
LOAD:08049240                 dd 0F126A510h, 6B8FE063h, 33F026EEh, 33F326EEh, 67E5D3DBh
LOAD:08049254                 dd 0E0B39C6Bh, 8FE073A7h, 9720967h, 0F026EE63h, 0E433DB33h
LOAD:08049268                 dd 0B39C6B67h, 0E073A7E0h, 26EE6B8Fh, 26EE33D9h, 3DB33F3h
LOAD:0804927C                 dd 9C6B67E4h, 73A7E0B3h, 5E8F26E8h, 0F505017h, 8FE06F17h
LOAD:08049290                 dd 0DB63096Fh, 6B67E463h, 8FE0B39Ch, 0EE690967h, 0EE33C726h
LOAD:080492A4                 dd 0DB33D926h, 6B67E984h, 0A7E0B39Ch, 16A3E673h, 0E426A41Dh
LOAD:080492B8                 dd 5702180Eh, 0E826A4h, 0A559191Eh, 0A463EC26h, 63639326h
LOAD:080492CC                 dd 7D886363h, 0E8E436EEh, 0B3629326h, 0E063D56Ch, 0A2EA7793h
LOAD:080492E0                 dd 0E8E436EEh, 0B3629326h, 26E06BEBh, 8FE06293h, 0E426EE6Fh
LOAD:080492F4                 dd 0E443DB33h, 0B39C6B67h, 0EA73A7E0h, 9326E8A1h, 0AB14A15Ah
LOAD:08049308                 dd 0EE6B8FE0h, 0EE33E426h, 0DB33F326h, 6B67E5D3h, 0A7E0B39Ch
LOAD:0804931C                 dd 678FE073h, 63096A09h, 33E426EEh, 67E433DBh, 0E0B39C6Bh
LOAD:08049330                 dd 0F3F373A7h, 0A0AAh
```
## Solving 

အဲ့ဒီတော့ အဲ့ s ရဲ့ memory address က values တွေကို  decrypt ပြီး function တစ်ခုဆောက်လိုက်ရအောင် ida ထဲမှာပဲ 

```
import ida_bytes, ida_segment, ida_auto, ida_funcs, idc
src_addr = 0x080491A0
length   = 407       
xor_key  = 0x63
dest_addr = 0x0804D000

encrypted_bytes = ida_bytes.get_bytes(src_addr, length)
decrypted_bytes = bytes([b ^ xor_key for b in encrypted_bytes])

seg = ida_segment.get_segm_by_name("shellcode")
if not seg:
    ida_segment.add_segm(0, dest_addr, dest_addr + 0x1000, "shellcode", "CODE")
    seg = ida_segment.get_segm_by_name("shellcode")
    seg.bitness = 1    # 1 = 32-bit x86
    seg.perm = 7       # 7 = Read + Write + Execute (RWX)
    seg.update()

ida_bytes.patch_bytes(dest_addr, decrypted_bytes)

ida_auto.auto_make_code(dest_addr)
ida_auto.auto_wait()
ida_funcs.add_func(dest_addr, dest_addr + length)
idc.set_name(dest_addr, "decrypted_shellcode", idc.SN_CHECK)
print("[+] Done!")
```

ida script ကို run လိုက်တဲ့အချိန်မှာ 0x0804D000 မှာ ကိုယ် decrypt လိုက်တဲ့ functions လေးကပေါ်သွားပါလိမ့်မယ် "G" and search 0x0804D000

```
shellcode:0804D000 ; ===========================================================================
shellcode:0804D000
shellcode:0804D000 ; Segment type: Pure code
shellcode:0804D000 ; Segment permissions: Read/Write/Execute
shellcode:0804D000 shellcode       segment byte public 'CODE' use32
shellcode:0804D000                 assume cs:shellcode
shellcode:0804D000                 ;org 804D000h
shellcode:0804D000                 assume es:nothing, ss:nothing, ds:shellcode, fs:nothing, gs:nothing
shellcode:0804D000
shellcode:0804D000 ; =============== S U B R O U T I N E =======================================
shellcode:0804D000
shellcode:0804D000 ; Attributes: bp-based frame
shellcode:0804D000
shellcode:0804D000 ; void *decrypted_shellcode()
shellcode:0804D000 decrypted_shellcode proc near
shellcode:0804D000
shellcode:0804D000 var_79          = byte ptr -79h
shellcode:0804D000 s               = byte ptr -6Dh
shellcode:0804D000 var_69          = dword ptr -69h
shellcode:0804D000 var_65          = dword ptr -65h
shellcode:0804D000 var_61          = dword ptr -61h
shellcode:0804D000 var_5D          = byte ptr -5Dh
shellcode:0804D000 var_5C          = byte ptr -5Ch
shellcode:0804D000 var_58          = dword ptr -58h
shellcode:0804D000 var_46          = dword ptr -46h
shellcode:0804D000 var_14          = dword ptr -14h
shellcode:0804D000 var_10          = dword ptr -10h
shellcode:0804D000 var_C           = dword ptr -0Ch
shellcode:0804D000
shellcode:0804D000                 push    ebp
shellcode:0804D001                 mov     ebp, esp
shellcode:0804D003                 push    ebx
shellcode:0804D004                 sub     esp, 84h
shellcode:0804D00A                 mov     [ebp+var_14], 6C333374h
shellcode:0804D011                 mov     dword ptr [ebp+var_5C], 647F6573h
shellcode:0804D018                 mov     [ebp+var_58], 786F7C6Fh ; "o|oxmecdm~elcdngo"
shellcode:0804D01F                 mov     dword ptr [ebp-54h], 6463656Dh
shellcode:0804D026                 mov     dword ptr [ebp-50h], 6C657E6Dh
shellcode:0804D02D                 mov     dword ptr [ebp-4Ch], 676E6463h
shellcode:0804D034                 mov     word ptr [ebp-48h], 6Fh ; 'o'
shellcode:0804D03A                 mov     dword ptr [ebp+s], 61647A7Dh ; "}zda`4duggc{fp.4"
shellcode:0804D041                 mov     [ebp+var_69], 75643460h
shellcode:0804D048                 mov     [ebp+var_65], 7B636767h
shellcode:0804D04F                 mov     [ebp+var_61], 342E7066h
shellcode:0804D056                 mov     [ebp+var_5D], 0
shellcode:0804D05A                 mov     [ebp+var_C], 0
shellcode:0804D061                 jmp     short loc_804D081
shellcode:0804D063 ; ---------------------------------------------------------------------------
```

ပေါ်သွားတဲ့ဟာလေးကို pseudo code view နဲ့ကြည့်လိုက်တဲ့အခါ F5

```c
void *decrypted_shellcode()
{
  size_t v0; // eax
  void *result; // eax
  size_t v2; // eax
  char v3[9]; // [esp+Fh] [ebp-79h] BYREF
  char v4[3]; // [esp+18h] [ebp-70h] BYREF
  char s[17]; // [esp+1Bh] [ebp-6Dh] BYREF
  _BYTE v6[22]; // [esp+2Ch] [ebp-5Ch] BYREF
  int v7[12]; // [esp+42h] [ebp-46h] BYREF
  int v8; // [esp+74h] [ebp-14h]
  size_t j; // [esp+78h] [ebp-10h]
  size_t i; // [esp+7Ch] [ebp-Ch]

  v8 = 1815294836;
  *(_DWORD *)v6 = 1686070643;
  strcpy(&v6[4], "o|oxmecdm~elcdngo");
  strcpy(s, "}zda`4duggc{fp.4");
  for ( i = 0; ; ++i )
  {
    v0 = strlen(s);
    if ( v0 <= i )
      break;
    s[i] ^= 0x14u;
  }
  strcpy(v4, "%s");
  printf(format: v4, s);
  memset(s, c: 0, n: sizeof(s));
  __isoc99_scanf(a1: v4);
  if ( v8 != 1815294836 )
    exit(status: 0);
  result = (void *)strncmp(a1: (int)v7, s: v6, a3: 10);
  if ( result == nullptr )
  {
    strcpy(v3, "m{a4c}z:");
    for ( j = 0; ; ++j )
    {
      v2 = strlen(s: v3);
      if ( v2 <= j )
        break;
      v3[j] ^= 0x14u;
    }
    printf(format: v4, v3);
    return memset(s: v3, c: 0, n: sizeof(v3));
  }
  return result;
}
```

ဒီမှာဆိုရင် functions လေးတွေက ရှင်းသွားပြီ အဲ့ဒီတော့ decode ကြည့်လိုက်ရအောင် 

```c
  for ( i = 0; ; ++i )
  {
    v0 = strlen(s);
    if ( v0 <= i )
      break;
    s[i] ^= 0x14u;
  }
```

ဒါကိုကျနော် decode လိုက်တော့ 

```python
"".join(chr(ord(s) ^ 0x14) for s in '}zda`4duggc{fp.4')
'input password: '
```
ဒါလေးရလာပါတယ် input password: ပေါ့ အဲ့ဒီတော့ နောက်တစ်ခုထပ်သွားရအောင် 

```c
result = (void *)strncmp(a1: (int)v7, s: v6, a3: 10);
```
ဒါလေးကို စိတ်၀င်စားဖို့ကောင်းပါတယ် v7 က ကျနော်တို့ရဲ့ input value ဖြစ်ပြီးတော့ v6 က ကျနော်တို့ နှိုင်းယှဥ်ရမဲ့ value ပေါ့အဲ့ဒီတော့က strncmp ကဒီတိုင်းကြည့်တော့ ဘာမှမထူးခြားပေမဲ့ တစ်ချက်သတိထားပါ imports and exports မှာ 

![image](/images/bombslanded/4.png)

exports မှာရှိနေတယ် အဲ့တော့ strncmp က ကိုယ်တိုင်ရေးထားတဲ့ functions ဖြစ်နေတာပေါ့ libc.so.6 ကနေတန်းယူထားတာ မဟုတ်ပဲနဲ့ 

```c
int __cdecl strncmp(int a1, char *s, int a3)
{
  size_t v3; // eax
  size_t v4; // eax
  size_t v5; // eax
  int v7; // [esp+0h] [ebp-18h]
  char *v8; // [esp+4h] [ebp-14h]
  int (__cdecl *v9)(int, char *, int); // [esp+8h] [ebp-10h]
  size_t i; // [esp+Ch] [ebp-Ch]

  v9 = (int (__cdecl *)(int, char *, int))dlsym(handle: (void *)0xFFFFFFFF, name: "strncmp");
  if ( a3 != 10 )
    return v9(a1, a2: s, a3);
  v3 = strlen(s);
  v8 = (char *)malloc(size: v3 + 1);
  for ( i = 0; strlen(s) > i; ++i )
    v8[i] = s[i] ^ 0xA;
  v8[strlen(s)] = 0;
  v4 = strlen(s: v8);
  v7 = v9(a1, a2: v8, a3: v4);
  v5 = strlen(s: v8);
  memset(s: v8, c: 0, n: v5);
  free(ptr: v8);
  return v7;
}
```

custom strncmp ရဲ့  functions ကိုကြည့်လိုက်တော့ ကျနော်တို့နဲ့နှိုင်းယှဥ်မဲ့ value ကို xor လုပ်ထားတာပေါ့ အဲ့တော့ အဖြေကရှင်းရှင်းလေးပါပဲ xor logic အရ `a ^ b = c` <-> `a ^ c = b` ပေါ့ အဲ့တော့ ကျနော်တို့ နှိုင်းယှဥ်မဲ့ value ကို xor နဲ့ လုပ်လိုက်ရုံပါပဲ 

```c
  *(_DWORD *)v6 = 1686070643;
  strcpy(&v6[4], "o|oxmecdm~elcdngo");
``` 
အဲ့ဒီတော့ v6 ကို decrypt လိုက်ရအောင် 

```python
v6 = struct.pack("<I", 1686070643) + b"o|oxmecdm~elcdngo"
password = bytes([b ^ 0x0A for b in v6]).decode('ascii')
print("Password: ", password)

Password: younevergoingtofindme
```

damn!!! we got the flag {younevergoingtofindme} အဲ့ဒီတော့က challenge လေးကတော့ ဒီထိပဲပေါ့နော် အဆုံးထိဖတ်ပေးတဲ့အတွက် ကျေးဇူးပါဗျ 
