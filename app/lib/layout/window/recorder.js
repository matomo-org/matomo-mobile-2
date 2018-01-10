/**
 * Matomo - Open source web analytics
 *
 * @link https://matomo.org
 * @license http://www.gnu.org/licenses/gpl-3.0.html Gpl v3 or later
 */

function WindowRecorder() {

    var recordWindows    = OS_ANDROID;
    var recordedWindows  = [];

    this.on('open', recordWindowIfEnabled);

    function recordWindowIfEnabled(win)
    {
        if (recordWindows && win) {
            if (OS_ANDROID && recordedWindows.length) {
                recordedWindows[recordedWindows.length - 1].fireEvent('blur', {});
                // as we no longer use events the new top view will no longer receive a blur event
            }

            recordedWindows.push(win);
            win.addEventListener('close', removeWindowFromRecordedWindows);
        }
        
        win = null;
    }

    function removeWindowFromRecordedWindows()
    {
        var _     = require('alloy')._;
        var index = _.indexOf(recordedWindows, this);

        if (-1 != index) {
            recordedWindows.splice(index, 1);
        }

        if (OS_ANDROID && recordedWindows.length) {
            recordedWindows[recordedWindows.length - 1].fireEvent('focus', {});
            // as we no longer use events the new top view will no longer receive a focus event
        }

        this.removeEventListener('close', removeWindowFromRecordedWindows);
    }

    this.startRecordingWindows = function () {
        recordWindows = true;
    };

    this.closeRecordedWindows = function () {
        while (recordedWindows.length) {
            this.close(recordedWindows.shift());
        }
    };

    this.getNumRecordedWindows = function () {
        return recordedWindows.length;
    };

    this.closeCurrentWindow = function () {
        if (recordedWindows.length) {
            this.close(recordedWindows.pop());
        }
    };
}

module.exports = WindowRecorder;