﻿"use strict";
var MIN_WIDTH = 200;
var global = "MINGDAO_GLOBAL";
var merge = function () {
    var b = {};
    for (var e = 0,
    c = arguments.length; e < c; e++) {
        var a = arguments[e] || {};
        for (var d in a) {
            b[d] = a[d]
        }
    }
    return b
};
var contains = function (a, b) {
    return a.some(function (c) {
        return b.indexOf(c) >= 0
    })
};
var $ = function (id) {
    return document.getElementById(id);
}
var isPageCapturable = function () {
    return !page.checkPageIsOnlyEmbedElement()
};
var page = {
    startX: 150,
    startY: 150,
    endX: 400,
    endY: 300,
    moveX: 0,
    moveY: 0,
    pageWidth: 0,
    pageHeight: 0,
    visibleWidth: 0,
    visibleHeight: 0,
    dragging: false,
    moving: false,
    resizing: false,
    isMouseDown: false,
    scrollXCount: 0,
    scrollYCount: 0,
    scrollX: 0,
    scrollY: 0,
    captureWidth: 0,
    captureHeight: 0,
    isSelectionAreaTurnOn: false,
    fixedElements_: [],
    marginTop: 0,
    marginLeft: 0,
    modifiedBottomRightFixedElements: [],
    originalViewPortWidth: document.documentElement.clientWidth,
    defaultScrollBarWidth: 17,
    hookBodyScrollValue: function (a) {
        document.documentElement.setAttribute("__mingdao_screen_capture_need_hook_scroll_value__", a);
        var b = document.createEvent("Event");
        b.initEvent("__mingdao_screen_capture_check_hook_status_event__", true, true);
        document.documentElement.dispatchEvent(b)
    },
    isScrollToPageEnd: function (c) {
        var a = document.body;
        var b = document.documentElement;
        if (c == "x") {
            return b.clientWidth + a.scrollLeft == a.scrollWidth
        } else {
            if (c == "y") {
                return b.clientHeight + a.scrollTop == a.scrollHeight
            }
        }
    },
    detectPagePosition: function () {
        var a = document.body;
        var c = a.scrollTop;
        var b = a.scrollLeft;
        if (c == 0 && b == 0) {
            return "top_left"
        } else {
            if (c == 0 && this.isScrollToPageEnd("x")) {
                return "top_right"
            } else {
                if (this.isScrollToPageEnd("y") && b == 0) {
                    return "bottom_left"
                } else {
                    if (this.isScrollToPageEnd("y") && this.isScrollToPageEnd("x")) {
                        return "bottom_right"
                    }
                }
            }
        }
        return null
    },
    detectCapturePositionOfFixedElement: function (d) {
        var e = document.documentElement;
        var h = e.clientWidth;
        var f = e.clientHeight;
        var g = d.offsetWidth;
        var b = d.offsetHeight;
        var a = d.offsetTop;
        var c = d.offsetLeft;
        var i = [];
        if (a <= f - a - b) {
            i.push("top")
        } else {
            if (a < f) {
                i.push("bottom")
            }
        }
        if (c <= h - c - g) {
            i.push("left")
        } else {
            if (c < h) {
                i.push("right")
            }
        }
        if (i.length != 2) {
            return null
        }
        return i.join("_")
    },
    restoreFixedElements: function () {
        this.fixedElements_.forEach(function (a) {
            a[1].style.visibility = "visible"
        });
        this.fixedElements_ = []
    },
    cacheVisibleFixedPositionedElements: function () {
        var d = document.createNodeIterator(document.documentElement, NodeFilter.SHOW_ELEMENT, null, false);
        var c;
        while (c = d.nextNode()) {
            var b = document.defaultView.getComputedStyle(c, "");
            if (!b) {
                continue
            }
            if (b.position == "fixed" && b.display != "none" && b.visibility != "hidden") {
                var a = this.detectCapturePositionOfFixedElement(c);
                if (a) {
                    this.fixedElements_.push([a, c])
                }
            }
        }
    },
    handleFixedElements: function (b) {
        var c = document.documentElement;
        var a = document.body;
        if (c.clientHeight == a.scrollHeight && c.clientWidth == a.scrollWidth) {
            return
        }
        if (!this.fixedElements_.length) {
            this.cacheVisibleFixedPositionedElements()
        }
        this.fixedElements_.forEach(function (d) {
            if (d[0] == b) {
                d[1].style.visibility = "visible"
            } else {
                d[1].style.visibility = "hidden"
            }
        })
    },
    handleSecondToLastCapture: function () {
        var b = document.documentElement;
        var a = document.body;
        var g = [];
        var c = [];
        var f = this;
        this.fixedElements_.forEach(function (i) {
            var h = i[0];
            if (h == "bottom_left" || h == "bottom_right") {
                g.push(i[1])
            } else {
                if (h == "bottom_right" || h == "top_right") {
                    c.push(i[1])
                }
            }
        });
        var e = a.scrollHeight - b.clientHeight - a.scrollTop;
        if (e > 0 && e < b.clientHeight) {
            g.forEach(function (h) {
                if (h.offsetHeight > e) {
                    h.style.visibility = "visible";
                    var i = window.getComputedStyle(h).bottom;
                    f.modifiedBottomRightFixedElements.push(["bottom", h, i]);
                    h.style.bottom = -e + "px"
                }
            })
        }
        var d = a.scrollWidth - b.clientWidth - a.scrollLeft;
        if (d > 0 && d < b.clientWidth) {
            c.forEach(function (h) {
                if (h.offsetWidth > d) {
                    h.style.visibility = "visible";
                    var i = window.getComputedStyle(h).right;
                    f.modifiedBottomRightFixedElements.push(["right", h, i]);
                    h.style.right = -d + "px"
                }
            })
        }
    },
    restoreBottomRightOfFixedPositionElements: function () {
        this.modifiedBottomRightFixedElements.forEach(function (d) {
            var c = d[0];
            var b = d[1];
            var a = d[2];
            b.style[c] = a
        });
        this.modifiedBottomRightFixedElements = []
    },
    hideAllFixedPositionedElements: function () {
        this.fixedElements_.forEach(function (a) {
            a[1].style.visibility = "hidden"
        })
    },
    hasScrollBar: function (c) {
        var a = document.body;
        var b = document.documentElement;
        if (c == "x") {
            if (window.getComputedStyle(a).overflowX == "scroll") {
                return true
            }
            return Math.abs(a.scrollWidth - b.clientWidth) >= page.defaultScrollBarWidth
        } else {
            if (c == "y") {
                if (window.getComputedStyle(a).overflowY == "scroll") {
                    return true
                }
                return Math.abs(a.scrollHeight - b.clientHeight) >= page.defaultScrollBarWidth
            }
        }
    },
    getOriginalViewPortWidth: function () {
        page.sendMessage({
            msg: "original_view_port_width"
        },
        function (a) {
            if (a) {
                page.originalViewPortWidth = page.hasScrollBar("y") ? a - page.defaultScrollBarWidth : a
            } else {
                page.originalViewPortWidth = document.documentElement.clientWidth
            }
        })
    },
    calculateSizeAfterZooming: function (b) {
        var a = page.originalViewPortWidth;
        var c = document.documentElement.clientWidth;
        if (a == c) {
            return b
        }
        return Math.round(a * b / c)
    },
    getZoomLevel: function () {
        return page.originalViewPortWidth / document.documentElement.clientWidth
    },
    handleRightFloatBoxInGmail: function () {
        var c = document.getElementById("canvas_frame");
        var a = document.querySelector("body > .dw");
        var b = c.contentDocument.body;
        if (b.clientHeight + b.scrollTop == b.scrollHeight) {
            a.style.display = "block"
        } else {
            a.style.display = "none"
        }
    },
    getViewPortSize: function () {
        var a = {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        };
        if (document.compatMode == "BackCompat") {
            a.width = document.body.clientWidth;
            a.height = document.body.clientHeight
        }
        return a
    },
    checkPageIsOnlyEmbedElement: function () {
        var d = document.body.children;
        var a = false;
        for (var c = 0; c < d.length; c++) {
            var b = d[c].tagName;
            if (b == "OBJECT" || b == "EMBED" || b == "VIDEO" || b == "SCRIPT" || b == "LINK") {
                a = true
            } else {
                if (d[c].style.display != "none") {
                    a = false;
                    break
                }
            }
        }
        return a
    },
    isGMailPage: function () {
        var a = window.location.hostname;
        if (a == "mail.google.com" && document.getElementById("canvas_frame")) {
            return true
        }
        return false
    },
    addMessageListener: function () {
        chrome.runtime.onMessage.addListener(function (e, b, a) {
            if (page.isSelectionAreaTurnOn) {
                page.removeSelectionArea()
            }
            var g = ("" + (window.getSelection ? window.getSelection() : document.getSelection ? document.getSelection() : document.selection.createRange().text)).replace(/(^\s+|\s+$)/g, "");
            var f = {
                href: document.location.href,
                text: g || document.title || ""
            };
            switch (e.msg) {
                case "shareDocumentUrl":
                    page.createFrame();
                    break;
                //case "auth_success":
                //    Mingdao.accessTokenCallback("success", Mingdao.getToken());
                //    break;
                case "capture_viewport":
                    a(merge(page.getViewportSize(), {
                        page_info: f
                    }));
                    break;
                case "show_selection_area":
                    page.showSelectionArea();
                    break;
                case "scroll_init":
                    a(merge(page.scrollInit(0, 0, document.body.scrollWidth, document.body.scrollHeight, "captureFullpage"), {
                        page_info: f
                    }));
                    break;
                case "scroll_next":
                    page.visibleWidth = e.visibleWidth;
                    page.visibleHeight = e.visibleHeight;
                    a(merge(page.scrollNext(), {
                        page_info: f
                    }));
                    break;
                case "capture_selected":
                    var d = page.calculateSizeAfterZooming(page.endX - page.startX);
                    var c = page.calculateSizeAfterZooming(page.endY - page.startY);
                    d = d < MIN_WIDTH ? MIN_WIDTH : d;
                    c = c < MIN_WIDTH ? MIN_WIDTH : c;
                    a(merge(page.scrollInit(page.startX, page.startY, d, c, "captureSelected"), {
                        page_info: f
                    }));
                    break
            }
        })
    },
    sendMessage: function (a) {
        chrome.runtime.sendMessage(a)
    },
    checkInViewPort: function (d, b, a, e) {
        var g = window.scrollX;
        var f = window.scrollY;
        var c = page.getViewPortSize();
        return (d >= g && b >= f && d + a <= g + c.width && b + e <= f + c.height)
    },
    scrollInit: function (f, d, c, e, h) {
        page.fixFixed();
        page.detachFloatingButton();
        this.hookBodyScrollValue(true);
        if (page.checkInViewPort(f, d, c, e)) {
            f = f - window.scrollX;
            d = d - window.scrollY;
            page.unfixFixed();
            page.attachFloatingButton();
            this.restoreFixedElements();
            return {
                msg: "capture_viewport_selected",
                startX: page.calculateSizeAfterZooming(f),
                startY: page.calculateSizeAfterZooming(d),
                canvasWidth: c,
                canvasHeight: e,
            }
        }
        page.captureHeight = e;
        page.captureWidth = c;
        var g = document.body.scrollWidth;
        var i = document.body.scrollHeight;
        window.scrollTo(f, d);
        this.handleFixedElements("top_left");
        this.handleSecondToLastCapture();
        if (page.isGMailPage() && h == "captureFullpage") {
            var b = document.getElementById("canvas_frame");
            i = page.captureHeight = e = b.contentDocument.height;
            g = page.captureWidth = c = b.contentDocument.width;
            b.contentDocument.body.scrollTop = 0;
            b.contentDocument.body.scrollLeft = 0;
            page.handleRightFloatBoxInGmail()
        }
        page.scrollXCount = 0;
        page.scrollYCount = 1;
        page.scrollX = window.scrollX;
        page.scrollY = window.scrollY;
        var a = page.getViewPortSize();
        return {
            msg: "scroll_init_done",
            startX: page.calculateSizeAfterZooming(f),
            startY: page.calculateSizeAfterZooming(d),
            scrollX: page.scrollX,
            scrollY: page.scrollY,
            docHeight: i,
            docWidth: g,
            visibleWidth: a.width,
            visibleHeight: a.height,
            canvasWidth: c,
            canvasHeight: e,
            scrollXCount: 0,
            scrollYCount: 0,
            zoom: page.getZoomLevel()
        }
    },
    scrollNext: function () {
        if (page.scrollYCount * page.visibleWidth >= page.captureWidth) {
            page.scrollXCount++;
            page.scrollYCount = 0
        }
        if (page.scrollXCount * page.visibleHeight < page.captureHeight) {
            this.restoreBottomRightOfFixedPositionElements();
            var b = page.getViewPortSize();
            window.scrollTo(page.scrollYCount * b.width + page.scrollX, page.scrollXCount * b.height + page.scrollY);
            var c = this.detectPagePosition();
            if (c) {
                this.handleFixedElements(c)
            } else {
                this.hideAllFixedPositionedElements()
            }
            this.handleSecondToLastCapture();
            if (page.isGMailPage()) {
                var d = document.getElementById("canvas_frame");
                d.contentDocument.body.scrollLeft = page.scrollYCount * b.width;
                d.contentDocument.body.scrollTop = page.scrollXCount * b.height;
                page.handleRightFloatBoxInGmail()
            }
            var a = page.scrollXCount;
            var e = page.scrollYCount;
            page.scrollYCount++;
            return {
                msg: "scroll_next_done",
                scrollXCount: a,
                scrollYCount: e
            }
        } else {
            window.scrollTo(page.startX, page.startY);
            page.unfixFixed();
            page.attachFloatingButton();
            this.restoreFixedElements();
            this.hookBodyScrollValue(false);
            return {
                msg: "scroll_finished"
            }
        }
    },
    showSelectionArea: function () {
        page.fixFixed();
        page.createFloatLayer();
        setTimeout(page.createSelectionArea, 100)
    },
    getViewportSize: function () {
        var b = document.documentElement.clientWidth;
        var a = document.documentElement.clientHeight;
        if (page.isGMailPage()) {
            var c = document.getElementById("canvas_frame");
            b = c.contentDocument.height;
            a = c.contentDocument.width
        }
        return {
            msg: "capture_viewport",
            visibleWidth: b,
            visibleHeight: a
        }
    },
    getSelectionSize: function () {
        page.removeSelectionArea();
        setTimeout(function () {
            page.sendMessage({
                msg: "capture_selected",
                x: page.startX,
                y: page.startY,
                width: page.endX - page.startX,
                height: page.endY - page.startY,
                visibleWidth: document.documentElement.clientWidth,
                visibleHeight: document.documentElement.clientHeight,
                docWidth: document.body.scrollWidth,
                docHeight: document.body.scrollHeight
            })
        },
        100)
    },
    createFloatLayer: function () {
        page.createDiv(document.body, "mingdao_collector_protector")
    },
    matchMarginValue: function (a) {
        return a.match(/\d+/)
    },
    fixFixed: function () {
        var c = document.querySelectorAll("*");
        this.fixed_els = this.fixed_els || [];
        if (!this.fixed_els.length && c && c.length) {
            for (var b = 0; b < c.length; b += 1) {
                var a = getComputedStyle(c[b]);
                if (a && a.getPropertyValue("position") == "fixed") {
                    this.fixed_els.push(c[b])
                }
            }
        }
        this.fixed_els.forEach(function (h) {
            for (var g = 0; g < h.classList.length; g++) {
                var j = ["iku-popup", "iku-mask"];
                if (j.indexOf(h.classList[g]) > -1) {
                    return false
                }
            }
            h.classList.add("__mingdao-fixed-position")
        });
        var f = "__mingdao_fix_fixed";
        if (!document.getElementById(f)) {
            var e = ".__mingdao-fixed-position {position: absolute !important;z-index:5000 !important;}";
            var d = document.createElement("style");
            d.id = f; (document.getElementsByTagName("head")[0] || document.body).appendChild(d);
            d.styleSheet ? d.styleSheet.cssText = e : d.appendChild(document.createTextNode(e))
        }
        page.fixedPosition()
    },
    unfixFixed: function () {
        if (this.fixed_els && this.fixed_els.length) {
            this.fixed_els.forEach(function (a) {
                a.classList.remove("__mingdao-fixed-position")
            })
        }
        page.unfixedPosition()
    },
    fixedPosition: function () {
        var b = window.location.hostname;
        if (contains(["taobao.com", "tmall.com"], b)) {
            document.getElementsByTagName("body")[0].style.setProperty("position", "relative")
        } else {
            if (contains(["behance.net"], b)) {
                document.getElementById("showcase-and-discover").classList.remove("__mingdao-fixed-position");
                document.getElementById("infinity-footer").style.display = "none";
                document.getElementById("sorts-container").style.display = "none"
            } else {
                if (contains(["mingdao.com"], b)) {
                    var a = document.getElementById("header");
                    a.classList.remove("__mingdao-fixed-position");
                    a.style.setProperty("position", "relative", "important")
                }
            }
        }
    },
    unfixedPosition: function () {
        var a = window.location.hostname;
        if (contains(["taobao.com", "tmall.com"], a)) {
            document.getElementsByTagName("body")[0].style.setProperty("position", "relative")
        } else {
            if (contains(["behance.net"], a)) {
                document.getElementById("infinity-footer").style.display = "block";
                document.getElementById("sorts-container").style.display = "block"
            } else {
                if (contains(["mingdao.com"], a)) {
                    document.getElementById("header").style.setProperty("position", "fixed")
                }
            }
        }
    },
    escKeyDown: function (a) {
        if (a.keyCode == 27) {
            page.removeSelectionArea()
        }
    },
    createSelectionArea: function () {
        var g = $("mingdao_collector_protector");
        var e = page.getZoomLevel();
        var a = window.getComputedStyle(document.body, null);
        if ("relative" == a.position) {
            page.marginTop = page.matchMarginValue(a.marginTop);
            page.marginLeft = page.matchMarginValue(a.marginLeft);
            g.style.top = -parseInt(page.marginTop) + "px";
            g.style.left = -parseInt(page.marginLeft) + "px"
        }
        g.style.width = Math.round((document.body.scrollWidth + parseInt(page.marginLeft)) / e) + "px";
        g.style.height = Math.round((document.body.scrollHeight + parseInt(page.marginTop)) / e) + "px";
        g.onclick = function () {
            event.stopPropagation();
            return false
        };
        g.addEventListener("mousedown", page.protectorMouseDown, false);
        page.createDiv(g, "hc_dragshadow_t", "hc-dragshadow");
        page.createDiv(g, "hc_dragshadow_b", "hc-dragshadow");
        page.createDiv(g, "hc_dragshadow_l", "hc-dragshadow");
        page.createDiv(g, "hc_dragshadow_r", "hc-dragshadow");
        var f = page.createDiv(g, "mingdao_collector_container");
        var b = page.createDiv(f, "mingdao_collector_boundary");
        page.createDiv(f, "hc_drag_size");
        page.createDiv(b, "hc_dragline_t", "hc-dragline");
        page.createDiv(b, "hc_dragline_d", "hc-dragline");
        page.createDiv(b, "hc_dragline_l", "hc-dragline");
        page.createDiv(b, "hc_dragline_r", "hc-dragline");
        var d = page.createDiv(f, "hc_drag_cancel");
        d.addEventListener("mousedown",
        function () {
            page.removeSelectionArea()
        },
        true);
        d.innerHTML = "取消";
        var c = page.createDiv(f, "hc_drag_crop");
        c.addEventListener("mousedown",
        function () {
            page.removeSelectionArea();
            page.sendMessage({
                msg: "capture_selected"
            })
        },
        false);
        c.innerHTML = "确定";
        document.addEventListener("keydown", page.escKeyDown, false);
        document.querySelector("body").classList.add("hb-no-user-select");
        page.detachFloatingButton()
    },
    protectorMouseDown: function (d) {
        if (d.button == 0 && !page.isMouseDown) {
            var g = function (k) {
                var h = k.pageX - b;
                var i = k.pageY - a;
                var j = (h > 0) ? b : b + h;
                var l = (i > 0) ? a : a + i;
                h = Math.abs(h);
                i = Math.abs(i);
                page.updateShadow(j, l, h, i);
                page.updateArea(j, l, h, i);
                page.updateSize(h, i);
                page.startX = j;
                page.startY = l;
                page.endX = j + h;
                page.endY = l + i
            };
            var c = function (i) {
                if ((i.pageX - b == 0 || i.pageY - a == 0) && $("mingdao_collector_container").offsetWidth == 0) {
                    var h = b - MIN_WIDTH / 2;
                    var j = a - MIN_WIDTH / 2;
                    page.updateShadow(h, j, MIN_WIDTH, MIN_WIDTH);
                    page.updateArea(h, j, MIN_WIDTH, MIN_WIDTH);
                    page.updateSize(MIN_WIDTH, MIN_WIDTH);
                    page.startX = h;
                    page.startY = j;
                    page.endX = h + MIN_WIDTH;
                    page.endY = j + MIN_WIDTH
                }
                f.removeEventListener("mousedown", page.protectorMouseDown, false);
                f.removeEventListener("mousemove", g, false);
                f.removeEventListener("mouseup", c, false);
                if (page.endY + 25 > document.documentElement.clientWidth + document.body.scrollTop) {
                    $("hc_drag_crop").style.bottom = "3px";
                    $("hc_drag_cancel").style.bottom = "3px"
                } else {
                    $("hc_drag_crop").style.bottom = "-28px";
                    $("hc_drag_cancel").style.bottom = "-28px"
                }
                if (page.startY < document.body.scrollTop + 22) {
                    $("hc_drag_size").style.top = "3px"
                } else {
                    $("hc_drag_size").style.top = "-22px"
                }
                $("hc_drag_size").style.display = "block";
                $("hc_drag_cancel").style.display = "block";
                $("hc_drag_crop").style.display = "block";
                page.bindDragResize();
                page.isSelectionAreaTurnOn = true;
                page.isMouseDown = false
            };
            page.isMouseDown = true;
            var b = d.pageX;
            var a = d.pageY;
            var e = $("mingdao_collector_container");
            var f = $("mingdao_collector_protector");
            page.pageHeight = f.clientHeight;
            page.pageWidth = f.clientWidth;
            page.updateShadow(b, a, 0, 0);
            f.style.backgroundColor = "rgba(0, 0, 0, 0)";
            f.addEventListener("mousemove", g, false);
            f.addEventListener("mouseup", c, false)
        }
    },
    bindDragResize: function () {
        var a = $("mingdao_collector_container");
        page.createDiv(a, "hc_dragdot_tl", "hc-dragdot").setAttribute("data-direct", "tl");
        page.createDiv(a, "hc_dragdot_tr", "hc-dragdot").setAttribute("data-direct", "tr");
        page.createDiv(a, "hc_dragdot_br", "hc-dragdot").setAttribute("data-direct", "br");
        page.createDiv(a, "hc_dragdot_bl", "hc-dragdot").setAttribute("data-direct", "bl");
        page.createDiv(a, "hc_dragdot_mt", "hc-dragdot").setAttribute("data-direct", "mt");
        page.createDiv(a, "hc_dragdot_mr", "hc-dragdot").setAttribute("data-direct", "mr");
        page.createDiv(a, "hc_dragdot_mb", "hc-dragdot").setAttribute("data-direct", "mb");
        page.createDiv(a, "hc_dragdot_ml", "hc-dragdot").setAttribute("data-direct", "ml");
        page.createDiv(a, "hc_dragbar_t", "hc-dragbar").setAttribute("data-direct", "mt");
        page.createDiv(a, "hc_dragbar_r", "hc-dragbar").setAttribute("data-direct", "mr");
        page.createDiv(a, "hc_dragbar_b", "hc-dragbar").setAttribute("data-direct", "mb");
        page.createDiv(a, "hc_dragbar_l", "hc-dragbar").setAttribute("data-direct", "ml");
        $("mingdao_collector_protector").addEventListener("mousedown", page.onMouseDown, false);
        document.addEventListener("mousemove", page.onMouseMove, false);
        document.addEventListener("mouseup", page.onMouseUp, false);
        $("mingdao_collector_boundary").addEventListener("dblclick",
        function () {
            page.removeSelectionArea();
            page.sendMessage({
                msg: "capture_selected"
            })
        },
        false)
    },
    onMouseDown: function () {
        if (event.button != 2) {
            var b = event.target;
            if (b) {
                var a = b.tagName;
                if (a && document) {
                    page.isMouseDown = true;
                    var e = $("mingdao_collector_container");
                    var d = event.pageX;
                    var c = event.pageY;
                    var f = page.direct = b.getAttribute("data-direct");
                    if (e) {
                        if (b == $("mingdao_collector_boundary")) {
                            page.moving = true;
                            page.moveX = d - e.offsetLeft;
                            page.moveY = c - e.offsetTop
                        } else {
                            if (f == "tr") {
                                page.resizing = true;
                                page.startX = e.offsetLeft;
                                page.startY = e.offsetTop + e.clientHeight
                            } else {
                                if (f == "tl") {
                                    page.resizing = true;
                                    page.startX = e.offsetLeft + e.clientWidth;
                                    page.startY = e.offsetTop + e.clientHeight
                                } else {
                                    if (f == "br") {
                                        page.resizing = true;
                                        page.startX = e.offsetLeft;
                                        page.startY = e.offsetTop
                                    } else {
                                        if (f == "bl") {
                                            page.resizing = true;
                                            page.startX = e.offsetLeft + e.clientWidth;
                                            page.startY = e.offsetTop
                                        } else {
                                            if (f == "mt") {
                                                page.resizing = true;
                                                page.startY = e.offsetTop + e.clientHeight
                                            } else {
                                                if (f == "mr") {
                                                    page.resizing = true;
                                                    page.startX = e.offsetLeft
                                                } else {
                                                    if (f == "mb") {
                                                        page.resizing = true;
                                                        page.startY = e.offsetTop
                                                    } else {
                                                        if (f == "ml") {
                                                            page.resizing = true;
                                                            page.startX = e.offsetLeft + e.clientWidth
                                                        } else {
                                                            page.dragging = true;
                                                            page.endX = page.startX = d;
                                                            page.endY = page.startY = c
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    event.preventDefault()
                }
            }
        }
    },
    onMouseMove: function () {
        var f = event.target;
        if (f && page.isMouseDown) {
            var j = $("mingdao_collector_container");
            if (j) {
                var b = event.pageX;
                var i = event.pageY;
                var d = 0;
                var e = 0;
                var n;
                var m;
                var k = page.direct || null;
                if (page.dragging || page.resizing) {
                    var l = page.getZoomLevel();
                    var h = Math.round(document.body.clientWidth / l);
                    var c = Math.round(document.body.clientHeight / l);
                    if (b > h) {
                        b = h
                    } else {
                        if (b < 0) {
                            b = 0
                        }
                    }
                    if (i > c) {
                        i = c
                    } else {
                        if (i < 0) {
                            i = 0
                        }
                    }
                    if (page.dragging || (page.resizing && ["tr", "tl", "br", "bl"].indexOf(k) != -1)) {
                        d = b - page.startX;
                        e = i - page.startY;
                        n = d > 0 ? page.startX : b;
                        m = e > 0 ? page.startY : i;
                        d = Math.abs(d);
                        e = Math.abs(e);
                        page.endX = b;
                        page.endY = i
                    } else {
                        if (page.resizing && ["mt", "mr", "mb", "ml"].indexOf(k) != -1) {
                            if (k == "mt" || k == "mb") {
                                e = i - page.startY;
                                n = page.startX;
                                m = e > 0 ? page.startY : i;
                                d = page.endX - page.startX;
                                e = Math.abs(e);
                                page.endY = i
                            } else {
                                if (k == "mr" || k == "ml") {
                                    d = b - page.startX;
                                    n = d > 0 ? page.startX : b;
                                    m = page.startY;
                                    d = Math.abs(d);
                                    e = page.endY - page.startY;
                                    page.endX = b
                                }
                            }
                        }
                    }
                    page.updateShadow(n, m, d, e);
                    page.updateArea(n, m, d, e);
                    page.updateSize(d, e);
                    if (window.innerWidth < b) {
                        document.body.scrollLeft = b - window.innerWidth
                    }
                    if (document.body.scrollTop + window.innerHeight < i + 25) {
                        document.body.scrollTop = i - window.innerHeight + 25
                    }
                    if (i < document.body.scrollTop) {
                        document.body.scrollTop -= 25
                    }
                } else {
                    if (page.moving) {
                        d = j.clientWidth;
                        e = j.clientHeight;
                        var a = b - page.moveX;
                        var g = i - page.moveY;
                        if (a < 0) {
                            a = 0
                        } else {
                            if (a + d > page.pageWidth) {
                                a = page.pageWidth - d
                            }
                        }
                        if (g < 0) {
                            g = 0
                        } else {
                            if (g + e > page.pageHeight) {
                                g = page.pageHeight - e
                            }
                        }
                        page.updateShadow(a, g, d, e);
                        page.updateArea(a, g, d, e);
                        page.startX = a;
                        page.endX = a + d;
                        m = page.startY = g;
                        page.endY = g + e
                    }
                }
                if (m + e + 25 > document.documentElement.clientHeight + document.body.scrollTop) {
                    $("hc_drag_crop").style.bottom = "3px";
                    $("hc_drag_cancel").style.bottom = "3px"
                } else {
                    $("hc_drag_crop").style.bottom = "-28px";
                    $("hc_drag_cancel").style.bottom = "-28px"
                }
                if (m < document.body.scrollTop + 22) {
                    $("hc_drag_size").style.top = "3px"
                } else {
                    $("hc_drag_size").style.top = "-22px"
                }
            }
            event.preventDefault()
        }
    },
    onMouseUp: function () {
        page.isMouseDown = false;
        if (event.button != 2) {
            page.resizing = false;
            page.dragging = false;
            page.moving = false;
            page.moveX = 0;
            page.moveY = 0;
            var a;
            if (page.endX < page.startX) {
                a = page.endX;
                page.endX = page.startX;
                page.startX = a
            }
            if (page.endY < page.startY) {
                a = page.endY;
                page.endY = page.startY;
                page.startY = a
            }
        }
    },
    updateShadow: function (h, g, d, b) {
        var e = page.getZoomLevel();
        var f = $("mingdao_collector_protector");
        f.style.width = Math.round((document.body.scrollWidth + parseInt(page.marginLeft)) / e) + "px";
        f.style.height = Math.round((document.body.scrollHeight + parseInt(page.marginTop)) / e) + "px";
        page.pageHeight = f.clientHeight;
        page.pageWidth = f.clientWidth;
        $("hc_dragshadow_t").style.height = g + "px";
        $("hc_dragshadow_t").style.width = h + d + "px";
        $("hc_dragshadow_l").style.height = page.pageHeight - g + "px";
        $("hc_dragshadow_l").style.width = h + "px";
        var c = g + b;
        c = c > 0 ? c : 0;
        var a = page.pageWidth - h - d;
        a = a > 0 ? a : 0;
        $("hc_dragshadow_r").style.height = c + "px";
        $("hc_dragshadow_r").style.width = a + "px";
        c = page.pageHeight - g - b;
        c = c > 0 ? c : 0;
        a = page.pageWidth - h;
        a = a > 0 ? a : 0;
        $("hc_dragshadow_b").style.height = c + "px";
        $("hc_dragshadow_b").style.width = a + "px"
    },
    updateArea: function (e, d, b, a) {
        var c = document.getElementById("mingdao_collector_container");
        c.style.left = e + "px";
        c.style.top = d + "px";
        c.style.width = Math.abs(b) + "px";
        c.style.height = Math.abs(a) + "px"
    },
    updateSize: function (b, a) {
        $("hc_drag_size").innerText = page.calculateSizeAfterZooming(b) + " x " + page.calculateSizeAfterZooming(a)
    },
    removeSelectionArea: function () {
        page.unfixFixed();
        page.attachFloatingButton();
        document.querySelector("body").classList.remove("hb-no-user-select");
        $("mingdao_collector_protector").removeEventListener("mousedown", page.onMouseDown, false);
        document.removeEventListener("keydown", page.escKeyDown, false);
        document.removeEventListener("mousemove", page.onMouseMove, false);
        document.removeEventListener("mouseup", page.onMouseUp, false);
        $("mingdao_collector_boundary").removeEventListener("dblclick",
        function () {
            page.removeSelectionArea();
            page.sendMessage({
                msg: "capture_selected"
            })
        },
        false);
        page.removeElement("mingdao_collector_protector");
        page.removeElement("mingdao_collector_container");
        page.isSelectionAreaTurnOn = false
    },
    createDiv: function (c, d, b) {
        var a = document.createElement("div");
        a.id = d;
        if (b) {
            a.className = b
        }
        c.appendChild(a);
        return a
    },
    createFrame: function () {
        Page.showDialog();
    },
    removeElement: function (a) {
        if ($(a)) {
            $(a).parentNode.removeChild($(a))
        }
    },
    attachFloatingButton: function () {
        if (window[global] && window[global]["interface"]) {
            window[global]["interface"].attachFloatingButton()
        }
    },
    detachFloatingButton: function () {
        if (window[global] && window[global]["interface"]) {
            window[global]["interface"].detachFloatingButton()
        }
    },
    init: function () {
        if (document.body.hasAttribute("mingdao_collector_injected")) {
            return
        }
        if (isPageCapturable()) {
            page.sendMessage({
                msg: "page_capturable"
            })
        } else {
            page.sendMessage({
                msg: "page_uncapturable"
            })
        }
        this.addMessageListener();
        page.getOriginalViewPortWidth()
    }
};
page.init();
window.onresize = function () {
    if (page.isSelectionAreaTurnOn) {
        page.removeSelectionArea();
        page.showSelectionArea()
    }
    page.getOriginalViewPortWidth()
};
