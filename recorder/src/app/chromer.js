import Constants from './constants.js';
import Notifier from './notifier.js';
import SaveClientEventAction from './view/share/saveClientEventAction.js';
import ToggleStartAction from './view/home/toggleStartAction.js';
import Utility from './Utility.js';

const commandMap = {
    'screenshot': onScreenShot,
    'select': onCursorSelect
}

const Chromer = {
    sendMessage: function (message, cb) {
        chrome.runtime.getBackgroundPage(function (bg) {
            var background = bg,
                tab = bg.currentTab;

            chrome.tabs.sendMessage(tab.id, message, function (response) {
                if (cb) {
                    cb(response);
                }
            });
        });
    },
    updateBackgroundState: function (key, value) {
        chrome.runtime.getBackgroundPage(function (bg) {
            bg.appState = bg.appState || {};
            bg.appState[key] = value;
        });
    },
    start: function () {
        chrome.runtime.onConnect.addListener(function (channel) {
            if (channel.name !== "automrecoder") {
                return;
            }

            channel.onMessage.addListener(handlChannelMessage);
        });

        chrome.commands.onCommand.addListener(function (command) {
            chrome.runtime.getBackgroundPage(function (bg) {
                bg.appState = bg.appState || {};

                if (!bg.appState.isRecording) {
                    return;
                }
                var commandHandler = commandMap[command];
                if (commandHandler) {
                    commandHandler();
                }
            });
        });
    },
    onNotify: function (cb, notifyMessage) {

    }
};

function onScreenShot() {
    var sceenShotEvent;

    sceenShotEvent = {type: 'screenshot'};
    SaveClientEventAction.next(sceenShotEvent);
}

function onCursorSelect() {
    Chromer.sendMessage({action: 'selecttarget'});
}

function handlChannelMessage(message) {
    if (message.stopRecording) {
        setTimeout(toStopRecording);
    }

    if (message.notify) {
        Notifier.next(message);
        return;
    }

    if (message.cssPath === false) {
        Utility.logError("Cannot generate a valid CssPath");
        return;
    }

    SaveClientEventAction.next(message);
}

function toStopRecording() {
    chrome.runtime.getBackgroundPage(function (bg) {
        chrome.tabs.get(bg.currentTab.id, function (tab) {
            if (!tab || tab.closed) {
                ToggleStartAction.next();
            }
        });
    });
}

export default Chromer;