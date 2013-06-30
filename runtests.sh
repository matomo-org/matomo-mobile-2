export PATH=/opt/local/bin:/opt/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/local/MacGPG2/bin

titanium build -p mobileweb --log-level warn
cd tools/mobilewebserver
npm install .
node app.js 8061 &
SERVERPID=$!
cd ../../
phantomjs --web-security=no --local-to-remote-url-access=yes testrunner.js
kill $SERVERPID