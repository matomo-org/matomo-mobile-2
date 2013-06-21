export PATH=/opt/local/bin:/opt/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/local/MacGPG2/bin

alloy compile -n --config platform=iphone
titanium build --platform ios --deploy-type test --ios-version 6.1 
