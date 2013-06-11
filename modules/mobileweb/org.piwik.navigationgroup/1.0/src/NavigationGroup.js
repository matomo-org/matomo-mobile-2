define(['Ti/_/css', 'Ti/_/declare', 'Ti/UI/View', 'Ti/UI/MobileWeb/NavigationGroup', 'Ti/UI', 'Ti/_/lang'],
    function(css, declare, View, NavigationGroup, UI, lang) {

    return declare('org.piwik.NavigationGroup', NavigationGroup, {

        generateMyTitleLabel: function (title) {
            return UI.createLabel({
                    text: title,
                    width: '100%',
                    height: '100%', 
                    color: 'white',
                    font: {fontWeight: 'bold'},
                    textAlign: UI.TEXT_ALIGNMENT_CENTER
            });
        },

        _updateNavBar: function() {
            var _self = this;
            var windows = _self._windows;
            var len = windows.length;
            var activeWin = windows[len - 1];
              
            if (!activeWin) {
                return;
            }

            var previousTitle = '';
            if (activeWin._titleControl && activeWin._titleControl.text) {
                previousTitle = activeWin._titleControl.text;
            }

            var currentTitle = activeWin._getTitle() || '';

            if (previousTitle != currentTitle && activeWin._titleControl) {
                activeWin._titleControl.text = currentTitle;
            } else if (!activeWin._titleControl) {
                activeWin._titleControl = this.generateMyTitleLabel(currentTitle)
            }

            NavigationGroup.prototype._updateNavBar.apply(this, arguments);
        },

        close: function(win) {
            if (!win) {
                console.log('No window, cannot close it');
                return;
            }
            
            var windows = this._windows;
            var windowIdx = windows.indexOf(win);
                
            var self = this;
            windows.splice(windowIdx, 1);
            win.fireEvent('blur');
            self._contentContainer.remove(win);
            
            try {
                win.destroy();
            } catch (e) {
                console.error('Failed to destroy window', e);
            }

            this._updateNavBar();
            
            if (windows.length && windows[windows.length - 1]) {
                windows[windows.length - 1].fireEvent('focus');
            }
        }

    });

});