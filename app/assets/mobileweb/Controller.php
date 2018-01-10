<?php
/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html GPL v3 or later
 *
 * @category Piwik_Plugins
 * @package MobileApp
 */
namespace Piwik\Plugins\PiwikMobile;

use Piwik\View;

/**
 *
 * @package PiwikMobile
 */
class Controller extends \Piwik\Plugin\Controller
{
    public function index()
    {
        header('Location: /plugins/PiwikMobile');
        exit;
    }
}
