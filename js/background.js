﻿


createMenu();
chrome.runtime.onMessage.addListener(function (id, obj) {
    
});
// A generic onclick callback function.
function genericOnClick(info, tab) {
  console.log("item " + info.menuItemId + " was clicked");
  console.log("info: " + JSON.stringify(info));
  console.log("tab: " + JSON.stringify(tab));
}

// Create one test item for each context type.
//var contexts = ["page","selection","link","editable","image","video",
//                "audio"];
//for (var i = 0; i < contexts.length; i++) {
//  var context = contexts[i];
//  var title = "Test '" + context + "' menu item";
//  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
//                                       "onclick": genericOnClick});
//  console.log("'" + context + "' item:" + id);
//}

function createMenu() {
    var title = "分享此网页";
    var pageMenuID = chrome.contextMenus.create({
        "title": title,
        "onclick": pageMenuClick
    });
    var title2 ="分享选中文字"
    var selectionMenuID = chrome.contextMenus.create({
        "title": title2, "contexts": ['selection'],
        "onclick": selectionMenuClick
    });
    var title3 = "分享此链接";
    var linkMenuID = chrome.contextMenus.create({
        "title": title3, "contexts": ['link'],
        "onclick": linkMenuClick
    });
    var title4 = "分享此图片";
    var imgMenuID = chrome.contextMenus.create({
        "title": title4, "contexts": ['image'],
        "onclick": imgMenuClick
    });
}

function popup(url) {
    window.open(url, "window", "width=600,height=400,status=yes,scrollbars=yes,resizable=yes");
}
/*
    页面直接点击
*/
function pageMenuClick(info, tab) {
    chrome.tabs.query(
                {
                    active: true,
                    currentWindow: true
                },
                function (tabs) {
                    var data = {
                        type: 'link',
                        info: info,
                        tab: tab
                    };
                    window.localStorage.setItem('last', JSON.stringify(data));
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        {
                            msg: "shareDocumentUrl"
                        },
                        function (response) { });
                });
    console.log(JSON.stringify(info));
}

/*
    选中文字点击
*/
function selectionMenuClick(info,tab) {
    console.log(JSON.stringify(info));
}

/*
    链接点击
*/
function linkMenuClick(info, tab) {
    console.log(JSON.stringify(info));
}

/*
    图片点击
*/
function imgMenuClick(info, tab) {
    console.log(JSON.stringify(info));
}

function showDialog(info,tab){
    
}


 
 