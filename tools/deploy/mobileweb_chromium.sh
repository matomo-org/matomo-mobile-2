export PATH=/opt/local/bin:/opt/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/local/MacGPG2/bin

titanium build -p mobileweb
open /Applications/Chromium.app --args --disable-web-security -–allow-file-access-from-files "http://127.0.0.1:8060"