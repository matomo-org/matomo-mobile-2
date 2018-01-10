<?php
/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 * @category Piwik_Plugins
 * @package MobileMessaging
 */
namespace Piwik\Plugins\PiwikMobile;

use Piwik\Menu\MenuTop;
use Piwik\Piwik;
use Piwik\Session\SessionNamespace;
use UserAgentParserEnhanced;

require_once PIWIK_INCLUDE_PATH . "/plugins/DevicesDetection/UserAgentParserEnhanced/UserAgentParserEnhanced.php";
require_once PIWIK_INCLUDE_PATH . '/plugins/DevicesDetection/functions.php';

/**
 *
 * @package PiwikMobile
 */
class PiwikMobile extends \Piwik\Plugin
{

    /**
     * @see Piwik_Plugin::getListHooksRegistered
     */
    public function getListHooksRegistered()
    {
        return array(
            'Request.dispatch'  => 'redirectToPiwikMobileIfNeeded',
            'Menu.Top.addItems' => 'addTopMenuItems'
        );
    }

    public function addTopMenuItems()
    {
        $urlParams = array('module' => 'PiwikMobile', 'action' => 'index');
        MenuTop::getInstance()->addEntry('Mobile App', $urlParams, $displayedForCurrentUser = true, $order = 1);
    }

    public function redirectToPiwikMobileIfNeeded($module, $action)
    {
        $session = new SessionNamespace('PiwikMobile');

        if ($this->hasRequestedDesktopVersion()) {
            // make sure he won't be redirected to mobile version in the future
            $session->alreadyRedirected = true;
        }

        if ('CoreHome' != $module) {
            // we only check for redirect on CoreHome and preferably only once after login
            return;
        }

        if ($this->hasRequestedPiwikMobile()) {
            $session->alreadyRedirected = true;
            $this->redirectToPiwikMobile();
        }

        if ($session->alreadyRedirected) {

            return;
        }

        if ($this->shouldAutoRedirect()) {

            $session->alreadyRedirected = true;
            $this->redirectToPiwikMobile();
        }
    }

    private function hasRequestedDesktopVersion()
    {
        return (array_key_exists('desktop', $_GET) && '' === $_GET['desktop']);
    }

    private function hasRequestedPiwikMobile()
    {
        return (array_key_exists('mobile', $_GET) && '' === $_GET['mobile']);
    }

    private function shouldAutoRedirect()
    {
        if (Piwik::isUserIsAnonymous()) {
            return false;
        }

        $deviceDetection = new UserAgentParserEnhanced($_SERVER['HTTP_USER_AGENT']);
        $deviceDetection->parse();

        $deviceId = $deviceDetection->getDevice();

        if (!isset($deviceId) || '' === $deviceId || !array_key_exists($deviceId, UserAgentParserEnhanced::$deviceTypes)) {
            return false;
        }

        $device   = UserAgentParserEnhanced::$deviceTypes[$deviceId];
        $settings = new Settings('PiwikMobile');

        if ($settings->redirectIfSmartphone->getValue() && 'smartphone' == $device) {
            return true;
        } elseif ($settings->redirectIfTablet->getValue() && 'tablet' == $device) {
            return true;
        }

        return false;
    }

    private function redirectToPiwikMobile()
    {
        header('Location: /plugins/PiwikMobile');
        exit;
    }
}
