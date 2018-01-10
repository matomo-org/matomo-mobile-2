# Matomo Mobile Plugin

## Description

This plugins provides a UI optimized for smartphones and tablets. It works for most mobile devices.

### Limitations

There is currently only one limitation due to the Same Origin Policy. You can add only Piwik accounts that belong to the same protocol and some host under which the mobile app is running. For instance if Piwik Mobile is running under “http://piwik.example.com/mobileweb”, you can only add Piwik accounts from “http://piwik.example.com/” and not accounts from let’s say “http://demo.matomo.org”.

## Installation

Install via Piwik Marketplace: Open Settings -> Marketplace -> Plugins. Search for "PiwikMobile"

## FAQ

__How can I access the mobile UI?__

There are three different ways to access the mobile app:

1. Tap the "Mobile App" link in the top menu bar
2. Append "?mobile" to your Piwik instance URL. For instance 'http://piwik.example.com?mobile'
3. We can automatically redirect you to the mobile app after logging in. You have to enable this behavior in Piwik under "Settings -> Plugin Settings -> Piwik Mobile". Note: The detection of mobile devices is experimental and might not work for all devices.

__Can I go back from PiwikMobile to the desktop version?__

Yes, just open Piwik as usual.

## Changelog

__2.0.0__
* Initial release

## License

GPL v3 or later

## Support

* [mobile@matomo.org](mailto:mobile@matomo.org)
* [https://github.com/piwik/matomo-mobile-2](https://github.com/piwik/matomo-mobile-2)
* [https://www.twitter.com/piwik](https://www.twitter.com/piwik)
