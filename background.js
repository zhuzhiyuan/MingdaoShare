"use strict";
var DOMAIN = "huaban.com";
var imgHosts = {
    hbimg: "img.hb.aicdn.com"
};
var Utils = {
    getUserUrl: function (a) {
        return "http://" + DOMAIN + "/" + a.urlname
    },
    getImgUrl: function (a, b) {
        return "http://" + imgHosts[a.bucket] + "/" + a.key + (b ? "_" + b : "")
    },
    i18nReplace: function (b, a) {
        return $(b).innerHTML = chrome.i18n.getMessage(a)
    },
    isThisPlatform: function (a) {
        return navigator.userAgent.toLowerCase().indexOf(a) > -1
    },
    isRetinaDisplay: function () {
        if (window.matchMedia) {
            var a = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
            if (a && a.matches || (window.devicePixelRatio > 1)) {
                return true
            } else {
                return false
            }
        }
    },
    asyncMap: function (g, e, f) {
        if (g.length === 0) {
            return f()
        }
        var d = 0;
        var a = g.length;
        var b = [];
        for (var c = 0; c < a; c++) {
            e(g[c],
            function (i, h) {
                if (i) {
                    return f(i)
                }
                d++;
                b.push(h);
                if (d === a) {
                    return f(null, b)
                }
            })
        }
    }
};
function $(a) {
    return document.getElementById(a)
}
function $$(a) {
    return document.querySelectorAll(a)
}
function isHighVersion() {
    var a = navigator.userAgent.match(/Chrome\/(\d+)/)[1];
    return a > 9
};