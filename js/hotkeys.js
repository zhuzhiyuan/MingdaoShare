﻿"use strict";
var HotKey = (function () {
    return {
        setup: function () {
            if (!this.get("area")) {
                this.set("area", "R")
            }
            if (!this.get("viewport")) {
                this.set("viewport", "V")
            }
            if (!this.get("fullpage")) {
                this.set("fullpage", "H")
            }
            if (!this.get("screen")) {
                this.set("screen", "P")
            }
            var a = this.get("screen");
            if (this.isEnabled()) {
                this.set("screen", "@")
            }
        },
        set: function (b, c) {
            var a = b + "_capture_hotkey";
            localStorage.setItem(a, c)
        },
        get: function (a) {
            return localStorage.getItem(a + "_capture_hotkey")
        },
        getCharCode: function (a) {
            return this.get(a).charCodeAt(0)
        },
        enable: function () {
            localStorage.setItem("hotkey_enabled", true)
        },
        disable: function () {
            localStorage.setItem("hotkey_enabled", false)
        },
        isEnabled: function () {
            return localStorage.getItem("hotkey_enabled") == "true"
        }
    }
})();