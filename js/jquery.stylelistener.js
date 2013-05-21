/*!
 * jQuery Style Listener
 * http://techfoobar.com/jquery-style-listener/
 *
 * Copyright (c) 2013 Vijayakrishnan Krishnan
 * Released under the MIT License
 * http://techfoobar.com/jquery-style-listener/LICENSE.MIT
 */
 (function($) {
    $.fn.styleListener = function(options) {
        if(typeof options == 'object') {
            var styles = (options.styles != undefined && $.isArray(options.styles)) ? options.styles : [],
                    callback = (options.changed != undefined && typeof options.changed == 'function') ? options.changed : function() {},
                    interval = options.interval != undefined ? options.interval : 250;
            this.each(function() {
                var element = $(this);
                initStyles(element, styles);
                pollStyles(element, styles, callback, interval);
            });
        }
        else if(typeof options == 'string') {
            switch(options) {
            case 'destroy':
                this.each(function() {
                    var element = $(this);
                    if(element.data('stlI') != undefined) {
                        element.removeData('stlI');
                    }
                    if(element.data('stliT') != undefined) {
                        clearInterval(element.data('stliT'));
                        element.removeData('stliT');
                    }
                });
                break;
            }
        }
    };
    function initStyles(element, styles) {
        var listener = {}, i;
        for(i = 0; i < styles.length; i++) {
            listener[styles[i]] = getCurrentStyle(element.get(0))[styles[i]];
        }
        element.data('stlI', listener);
    }
    function pollStyles(element, styles, callback, interval) {
        var poller = setInterval(function() {
            var currentStyle = 'not-set', i, prevStyle = '';
            for(i = 0; i < styles.length; i++) {
                prevStyle = element.data('stlI')[styles[i]];
                currentStyle = getCurrentStyle(element.get(0))[styles[i]];
                if(prevStyle !== currentStyle) {
                    callback(styles[i], currentStyle, prevStyle, element);
                }
                element.data('stlI')[styles[i]] = currentStyle;
            }
        }, interval);
        element.data('stliT', poller);
    }
    function getCurrentStyle(element) {
        var styles = null;
        if(window.getComputedStyle && typeof window.getComputedStyle == 'function') {
            styles = window.getComputedStyle(element);
        }
        else if(element.currentStyle) {
            styles = element.currentStyle;
        }
        return styles;
    }
})(jQuery);