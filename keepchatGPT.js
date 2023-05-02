// ==UserScript==
// @name              My KeepChatGPT
// @description       Solving problmes: (1) NetworkError when attempting to fetch resource. (2) Something went wrong. If this issue persists please contact us through our help center at help.openai.com. (3) Conversation not found. (4) This content may violate our content policy.
// @version           11.1
// @author            xcanwin
// @namespace         https://github.com/xcanwin/KeepChatGPT/
// @supportURL        https://github.com/xcanwin/KeepChatGPT/
// @updateURL         https://raw.githubusercontent.com/tuan-karma/My_KeepChatGPT/main/keepchatGPT.js
// @downloadURL       https://raw.githubusercontent.com/tuan-karma/My_KeepChatGPT/main/keepchatGPT.js
// @description:vi    ChatGPT Plugin trò chuyện. Giải quyết tất cả các lỗi, mang lại trải nghiệm AI của chúng tôi một cách cực: (1) NetworkError when attempting to fetch resource. (2) Something went wrong. If this issue persists please contact us through our help center at help.openai.com. (3) Conversation not found. (4) This content may violate our content policy.
// @license           GPL-2.0-only
// @match             https://chat.openai.com/*
// @grant             GM_addStyle
// @grant             GM_addElement
// @grant             GM_setValue
// @grant             GM_getValue
// @grant             unsafeWindow
// @run-at            document-idle
// @noframes
// ==/UserScript==


(function () {
    'use strict';

    const $ = (Selector, el) => (el || document).querySelector(Selector);
    const $$ = (Selector, el) => (el || document).querySelectorAll(Selector);

    const getLang = function () {
        let lang =
        {
            "index": { "dark_mode": "dm", "show_debug": "sd", "cancel_audit": "cm", "cancel_animation": "ca", "about": "ab", "suggest_interval_30s": "si", "modify_interval": "mi", "check_updates": "cu", "current_version": "cv", "discover_lastest_ver": "dl", "is_lastest_ver": "lv", "clone_conversation": "cc" },
            "local": {
                "en": { "dm": "Dark mode", "sd": "Show debugging", "cm": "Cancel audit", "ca": "Cancel animation", "ab": "About", "si": "Suggest interval of 30 seconds; The author usually sets 150", "mi": "Modify interval", "cu": "Check for updates", "cv": "Current version", "dl": "Discover the latest version", "lv": "is the latest version", "cc": "Clone conversation" },
            }
        };
        const nls = navigator.languages;
        let language = "zh-CN";
        for (let j = 0; j < nls.length; j++) {
            let nl = nls[j];
            if (nl in lang.local) {
                language = nl;
                break;
            } else if (nl.length > 2 && nl.slice(0, 2) in lang.local) {
                language = nl.slice(0, 2);
                break;
            }
        }
        return [lang.index, lang.local[language]];
    };

    const [langIndex, langLocal] = getLang();

    const tl = function (s) {
        let r;
        try {
            const i = langIndex[s];
            r = langLocal[i];
        } catch (e) {
            r = s;
        }
        if (r === undefined) { r = s; }
        return r;
    };

    const sv = function (key, value = "") {
        GM_setValue(key, value);
    };

    const gv = function (key, value = "") {
        return GM_getValue(key, value);
    };

    const formatDate = function (d) {
        return (new Date(d)).toLocaleString();
    };

    const formatJson = function (d) {
        try {
            const j = JSON.parse(d);
            return `<pre>${JSON.stringify(j, null, 2)}</pre>`;
        } catch (e) {
            return d;
        }
    };

    const setIfr = function (u = "") {
        if ($("#xcanwin") === null) {
            const nIfr = document.createElement('iframe');
            nIfr.id = "xcanwin";
            nIfr.style = `height: 0px; width: 100%;`;
            if (u) {
                nIfr.src = u;
            }
            nIfr.onload = function () {
                const nIfrText = $("#xcanwin").contentWindow.document.documentElement.innerText;
                try {
                    $("#xcanwin").contentWindow.document.documentElement.style = `background: #FCF3CF; height: 360px; width: 1080px; overflow; auto;`;
                    if (nIfrText.indexOf(`"expires":"`) > -1) {
                        console.log(`KeepChatGPT: IFRAME: Expire date: ${formatDate(JSON.parse(nIfrText).expires)}`);
                        $("#xcanwin").contentWindow.document.documentElement.innerHTML = formatJson(nIfrText);
                    } else if (nIfrText.match(/Please stand by|while we are checking your browser|Please turn JavaScript on|Please enable Cookies|reload the page/)) {
                        console.log(`KeepChatGPT: IFRAME: BypassCF`);
                    }
                } catch (e) {
                    console.log(`KeepChatGPT: IFRAME: ERROR: ${e},\nERROR RESPONSE:\n${nIfrText}`);
                }
            };
            $("main").lastElementChild.appendChild(nIfr);
        } else {
            if (u) {
                $("#xcanwin").src = u;
            }
        }
    };

    const keepChat = function () {
        fetch(u).then((response) => {
            response.text().then((data) => {
                try {
                    const contentType = response.headers.get('Content-Type');
                    if (contentType.indexOf("application/json") > -1 && response.status !== 403 && data.indexOf(`"expires":"`) > -1) {
                        console.log(`KeepChatGPT: FETCH: Expire date: ${formatDate(JSON.parse(data).expires)}`);
                        $("#xcanwin").contentWindow.document.documentElement.innerHTML = formatJson(data);
                    } else {
                        setIfr(u);
                    }
                } catch (e) {
                    console.log(`KeepChatGPT: FETCH: ERROR: ${e},\nERROR RESPONSE:\n${data}`);
                    setIfr(u);
                }
            })
        });
    }

    const ncheckbox = function () {
        const nsvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        nsvg.setAttribute("viewBox", "0 0 100 30");
        nsvg.classList.add("checkbutton");
        nsvg.innerHTML = `<g fill="none" fill-rule="evenodd"><path fill="#E3E3E3" d="M0 15C0 6.716 6.716 0 15 0h14c8.284 0 15 6.716 15 15s-6.716 15-15 15H15C6.716 30 0 23.284 0 15z"/><circle fill="#FFF" cx="15" cy="15" r="13"/></g>`;
        return nsvg.cloneNode(true);
    };

    const ndialog = function (title = 'KeepChatGPT', content = '', buttonvalue = 'OK', buttonfun = function (t) { return t; }, inputtype = 'br', inputvalue = '') {
        const ndivalert = document.createElement('div');
        ndivalert.setAttribute("class", "kdialog relative z-50");
        ndivalert.innerHTML = `
<div class="fixed inset-0 bg-gray-500/90"></div>
<div class="fixed inset-0 overflow-y-auto z-50">
  <div class="flex items-end justify-center min-h-full p-4 sm:items-center sm:p-0 text-center">
    <div class="bg-white dark:bg-gray-900 rounded-lg sm:max-w-lg sm:p-6 text-left">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center justify-between">
            <h3 class="dark:text-gray-200 text-gray-900 text-lg">${title}</h3>
            <p class="kdialogclose" style="cursor: pointer;">X</p>
          </div>
          <p class="dark:text-gray-100 mt-2 text-gray-500 text-sm" style="margin-bottom: 10px;">${content}</p>
          <div class="md:py-3 md:pl-4 border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
            <${inputtype} class="kdialoginput resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent" style="max-height: 200px; height: 24px; outline: none;" placeholder=""></${inputtype}>
          </div>
        </div>
      </div>
      <div class="flex sm:flex-row-reverse sm:mt-4"><button class="btn btn-neutral kdialogbtn">${buttonvalue}</button>
      </div>
    </div>
  </div>
</div>
        `;
        if (inputtype !== 'br') {
            $(".kdialoginput", ndivalert).value = inputvalue;
        } else {
            $(".kdialoginput", ndivalert).parentElement.style.display = 'none';
        }
        $(".kdialogclose", ndivalert).onclick = function () {
            ndivalert.remove();
        };
        $(".kdialogbtn", ndivalert).onclick = function () {
            buttonfun(ndivalert);
            $(".kdialogclose", ndivalert).onclick();
        };
        document.body.appendChild(ndivalert);
    };

    const loadMenu = function () {
        if ($(".kmenu") !== null) {
            return;
        }
        const ndivmenu = document.createElement('div');
        ndivmenu.setAttribute("class", "kmenu");
        ndivmenu.innerHTML = `<ul><li id=nmenuid_sd>${tl("show_debug")}</li><li id=nmenuid_dm>${tl("dark_mode")}</li><li id=nmenuid_cm>${tl("cancel_audit")}</li><li id=nmenuid_af>${tl("modify_interval")}</li><li id=nmenuid_cc>${tl("clone_conversation")}</li><li id=nmenuid_cu>${tl("check_updates")}</li><li id=nmenuid_ab>${tl("about")}</li></ul>`;
        document.body.appendChild(ndivmenu);

        $('#nmenuid_sd').appendChild(ncheckbox());
        $('#nmenuid_dm').appendChild(ncheckbox());
        $('#nmenuid_cm').appendChild(ncheckbox());
        $('#nmenuid_cc').appendChild(ncheckbox());

        $('#nmenuid_sd').onclick = function () {
            if ($('.checkbutton', this).classList.contains('checked')) {
                if ($('#xcanwin')) $('#xcanwin').style.height = '0px';
                sv("k_showDebug", false);
            } else {
                if ($('#xcanwin')) $('#xcanwin').style.height = '80px';
                sv("k_showDebug", true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };
        $('#nmenuid_dm').onclick = function () {
            if ($('.checkbutton', this).classList.contains('checked')) {
                $('#kcg').style = $('#kcg').styleOrigin;
                sv("k_theme", "light");
            } else {
                $('#kcg').styleOrigin = $('#kcg').style;
                $('#kcg').style.background = "#2C3E50";
                $('#kcg').style.animation = "none";
                $('#kcg').style.color = "#ffffff";
                $('#kcg').style.marginRight = "inherit";
                sv("k_theme", "dark");
            }
            $('.checkbutton', this).classList.toggle('checked');
        };
        $('#nmenuid_cm').onclick = function () {
            if ($('.checkbutton', this).classList.contains('checked')) {
                byeModer(false);
                sv("k_closeModer", false);
            } else {
                byeModer(true);
                sv("k_closeModer", true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };
        $('#nmenuid_af').onclick = function () {
            toggleMenu('hide');
            ndialog(`${tl("modify_interval")}`, `${tl("suggest_interval_30s")}`, `Go`, function (t) {
                try {
                    interval2Time = parseInt($(".kdialoginput", t).value);
                } catch (e) {
                    interval2Time = parseInt(gv("k_interval", 30));
                }
                if (interval2Time < 10) {
                    return;
                }
                clearInterval(nInterval2);
                nInterval2 = setInterval(nInterval2Fun, 1000 * interval2Time);
                sv("k_interval", interval2Time);
            }, `input`, parseInt(gv("k_interval", 30)));
        };
        $('#nmenuid_cc').onclick = function () {
            toggleMenu('hide');
            if ($('.checkbutton', this).classList.contains('checked')) {
                sv("k_clonechat", false);
            } else {
                sv("k_clonechat", true);
            }
            $('.checkbutton', this).classList.toggle('checked');
        };
        $('#nmenuid_cu').onclick = function () {
            toggleMenu('hide');
            checkForUpdates();
        };
        $('#nmenuid_ab').onclick = function () {
            window.open(GM_info.script.namespace, '_blank');
        };
    };

    const toggleMenu = function (action) {
        const ndivmenu = $(".kmenu");
        if (action === "show") {
            ndivmenu.style.display = 'block';
            if ($("#kcg")) {
                ndivmenu.style.left = `${$("#kcg").getBoundingClientRect().right + 20}px`;
                ndivmenu.style.top = `${$("#kcg").getBoundingClientRect().top}px`;
            }
        } else {
            ndivmenu.style.display = 'none';
        }
    };

    const loadKCG = function () {
        let symbol_prt;
        if ($("#kcg") !== null) {
            return;
        }
        if ($("main").kcg !== undefined) {
            if ($(symbol1_class)) {
                $("main").kcg.innerHTML = $("main").kcg._symbol1_innerHTML;
                symbol_prt = $(symbol1_class).parentElement;
            } else if ($(symbol2_class)) {
                $("main").kcg.innerHTML = $("main").kcg._symbol2_innerHTML;
                symbol_prt = $(symbol2_class).parentElement;
            }
            symbol_prt.insertBefore($("main").kcg, symbol_prt.childNodes[0]);
            return;
        }

        loadMenu();
        setIfr(u);

        const ndivkcg = document.createElement("div");
        ndivkcg.id = "kcg";
        ndivkcg.setAttribute("class", "shine flex py-3 px-3 items-center gap-3 rounded-md text-sm mb-1 flex-shrink-0 border border-white/20");

        const ndivmenu = $(".kmenu");
        ndivkcg.onmouseover = ndivmenu.onmouseover = function () {
            toggleMenu('show');
        };
        ndivkcg.onmouseleave = ndivmenu.onmouseleave = function () {
            toggleMenu('hide');
        };
        ndivkcg.onclick = function () {
            if (ndivmenu.style.display === 'none') {
                toggleMenu('show');
            } else {
                toggleMenu('hide');
            }
        };
        const icon = GM_info.script.icon ? GM_info.script.icon : `${GM_info.script.namespace}raw/main/assets/logo.svg`;
        ndivkcg._symbol1_innerHTML = "GPT Plus";
        ndivkcg._symbol2_innerHTML = "ChatGPT Plus";

        if ($(symbol1_class)) {
            ndivkcg.innerHTML = ndivkcg._symbol1_innerHTML;
            symbol_prt = $(symbol1_class).parentElement;
        } else if ($(symbol2_class)) {
            ndivkcg.innerHTML = ndivkcg._symbol2_innerHTML;
            symbol_prt = $(symbol2_class).parentElement;
        }
        $("main").kcg = ndivkcg;
        symbol_prt.insertBefore($("main").kcg, symbol_prt.childNodes[0]);

        addStyle();
        setUserOptions();
    };

    const addStyle = function () {
        GM_addStyle(`
.kmenu {
    background-color: #202123;
    color: #FFFFFF;
    border: 1px solid #4D4D4F;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    display: none;
    min-width: 200px;
    padding: 12px 0;
    position: absolute;
    z-index: 1000;
}
.kmenu::before {
    content: "";
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: -30px;
    right: 0px;
    pointer-events: auto;
    z-index: -1;
}
.kmenu::after {
    content: "";
    position: absolute;
    top: 15px;
    left: -20px;
    border-style: solid;
    border-width: 10px 10px 10px 10px;
    border-color: transparent #202123 transparent transparent;
}
.kmenu li {
    display: block;
    padding: 8px 24px;
    text-align: left;
    user-select: none;
    display: flex;
    align-items: center;
}
.kmenu li:hover {
    background-color: #273746;
    cursor: pointer;
}

.rounded-sm {
    user-select: none;
}

nav {
    position: relative;
}

.checkbutton {
    height: 20px;
    margin-left: auto;
    margin-right: -35px;
    padding-left: 10px;
}
.checkbutton:hover {
    cursor: pointer;
}
.checked path {
    fill: #30D158;
}
.checked circle {
    transform: translateX(14px);
    transition: transform 0.2s ease-in-out;
}
`);
    };

    const setUserOptions = function () {
        if (gv("k_showDebug", false) === true) {
            $('#nmenuid_sd .checkbutton').classList.add('checked');
            if ($('#xcanwin')) $('#xcanwin').style.height = '80px';
        } else {
            if ($('#xcanwin')) $('#xcanwin').style.height = '0px';
        }

        if (gv("k_theme", "light") === "light") {
            $('#kcg').styleOrigin = $('#kcg').style;
        } else {
            $('#nmenuid_dm .checkbutton').classList.add('checked');
            $('#kcg').style.background = "#202123";
            $('#kcg').style.animation = "none";
            $('#kcg').style.color = "#ffffff";
            $('#kcg').style.marginRight = "inherit";
        }

        if (gv("k_closeModer", false) === true) {
            $('#nmenuid_cm .checkbutton').classList.add('checked');
            byeModer(true);
        } else {
            byeModer(false);
        }

        if (gv("k_clonechat", false) === true) {
            $('#nmenuid_cc .checkbutton').classList.add('checked');
        }
    };

    let byeModer = function (action) {
        if (typeof _fetch === 'undefined') {
            var _fetch = fetch;
        }
        if (action === true) {
            unsafeWindow.fetch = new Proxy(fetch, {
                apply: function (target, thisArg, argumentsList) {
                    const n = {};
                    n.json = function () { return {}; };
                    return argumentsList[0].includes('moderations') ? Promise.resolve(n) : target.apply(thisArg, argumentsList);
                }
            });
        } else {
            unsafeWindow.fetch = _fetch;
        }
    };

    let byeConversationNotFound = function (action) {
        if (typeof _fetch === 'undefined') {
            var _fetch = fetch;
        }
        if (action === true) {
            unsafeWindow.fetch = new Proxy(_fetch, {
                apply: function (target, thisArg, argumentsList) {
                    try {
                        if (argumentsList[0].includes('conversation')) {
                            const post_body = JSON.parse(argumentsList[1].body);
                            post_body.conversation_id = location.href.match(/\/c\/(.*)/)[1];
                            argumentsList[1].body = JSON.stringify(post_body);
                        }
                    } catch (e) { }
                    return target.apply(thisArg, argumentsList);
                }
            });
        } else {
            unsafeWindow.fetch = _fetch;
        }
    };

    const verInt = function (vs) {
        const vl = vs.split('.');
        let vi = 0;
        for (let i = 0; i < vl.length && i < 3; i++) {
            vi += parseInt(vl[i]) * (1000 ** (2 - i));
        }
        return vi;
    }

    const checkForUpdates = function () {
        const crv = GM_info.script.version;
        let updateURL = GM_info.scriptUpdateURL || GM_info.script.updateURL || GM_info.script.downloadURL;
        updateURL = `${updateURL}?t=${Date.now()}`;
        fetch(updateURL, {
            cache: 'no-cache'
        }).then((response) => {
            response.text().then((data) => {
                const m = data.match(/@version\s+(\S+)/);
                const ltv = m && m[1];
                if (ltv && verInt(ltv) > verInt(crv)) {
                    ndialog(`${tl("check_updates")}`, `${tl("current_version")}: ${crv}, ${tl("discover_lastest_ver")}: ${ltv}`, `UPDATE`, function (t) {
                        window.open(updateURL, '_blank');
                    });
                } else {
                    ndialog(`${tl("check_updates")}`, `${tl("current_version")}: ${crv}, ${tl("is_lastest_ver")}`, `OK`);
                }
            });
        }).catch(e => console.log(e));
    }

    const tempFixOpenAI = function () {
        const account = $('button[id^="headlessui-menu"] > .grow', top.document);
        if (account && !account.classList.contains('truncate')) {
            account.classList.add('text-ellipsis', 'truncate');
            account.style.maxWidth = '10.3rem';
        }
    };

    const cloneChat = function () {
        $$(".rounded-sm").forEach(function (e) {
            if (gv("k_clonechat", false) === true) {
                e.style.cursor = "pointer";
                e.onclick = function () {
                    const content = this.closest('div.text-base').innerText;
                    $("form.stretch textarea").value = "";
                    $("form.stretch textarea").focus();
                    document.execCommand('insertText', false, content);
                }
            } else {
                e.style.cursor = "default";
                e.onclick = function () { }
            }
        });
    };

    const nInterval1Fun = function () {
        if ($(symbol1_class) || $(symbol2_class)) {
            loadKCG();
            cloneChat();
            tempFixOpenAI();
        }
    };

    const nInterval2Fun = function () {
        if ($(symbol1_class) || $(symbol2_class)) {
            keepChat();
        }
    };

    let nInterval1 = setInterval(nInterval1Fun, 300);
    let interval2Time = parseInt(gv("k_interval", 30));
    let nInterval2 = setInterval(nInterval2Fun, 1000 * interval2Time);

    const u = `/api/${GM_info.script.namespace.slice(33, 34)}uth/s${GM_info.script.namespace.slice(28, 29)}ssion`;
    const symbol1_class = 'nav>a.flex';
    const symbol2_class = 'button.justify-center';

})();
