(function (win) {
    var dashboard, 
        currentTab,
        actions = {
            isRecording: isRecordingAction
        };

    chrome.windows.onRemoved.addListener(function (windowId) {
        if(dashboard && dashboard.id === windowId) {
            dashboard = null;
        }
    });

    chrome.browserAction.onClicked.addListener(function (tab) {
        if (!dashboard) {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                currentTab = tabs[0];
                win.currentTab = currentTab;
                chrome.windows.create({
                    url: "index.html",
                    type: "popup",
                    width: 1150,
                    height: 750
                }, function (win) {
                    win.dashboard = dashboard;
                });
            });
        }
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (!currentTab ||!sender.tab || sender.tab.id !== currentTab.id) {
            sendResponse(null);
            return;
        }

        sendResponse(actions[request.action]());
    });


    function isRecordingAction() {
        return {isRecording: win.appState && win.appState.isRecording};
    }
})(window);