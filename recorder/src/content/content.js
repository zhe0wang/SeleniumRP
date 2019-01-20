(function () {
    var state = {
            recording: false
        },
        actions = {
            start: startAction,
            stop: stopAction,
            selecttarget: selectTargetAction,
            highlight: highlightElement,
            updateconfig: updateConfig,
            updatestate: updateState,
            screenshot: screenshot
        },
        channel;

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            var action = actions[request.action],
                success = false;

            if (action) {
                action(request.value);
                success = true;
            }
            sendResponse({ success: true });
        });

    function startAction() {
        window.location.reload();
    }

    function stopAction() {
        state.recording = false;
        window.automEvents.toggleRecording(state.recording);
        closeChannel();
    }

    function updateState(config) {
        state[config.key] = config.value;
        if(config.key === 'isPartialScreenshot' && !config.value && state.selectingType === 'region') {
            screenshot();
        }
    }

    function screenshot() {
        state.selectingType = state.isPartialScreenshot && state.selectingType !== 'region' ? 'region' : null;
        window.automEvents.setSelectingType(state.selectingType);
    }

    function selectTargetAction() {
        state.selectingType = state.selectingType !== 'target' ? 'target' : null;
        window.automEvents.setSelectingType(state.selectingType);
    }

    function highlightElement(cssPath) {
        window.automEvents.highlightElement(cssPath);
    }

    function updateConfig(config) {
        window.automEvents.updateConfig(config);
    }

    function start() {
        window.automEvents.startListening(eventCallBack);
        window.automEvents.setUpdateStateHandler(updateState);
        window.addEventListener('unload', onUnLoad);

        chrome.runtime.sendMessage({ action: 'isRecording' }, function (response) {
            state.recording = response && response.isRecording;
            if (state.recording) {
                window.automEvents.toggleRecording(state.recording);
                createChannel();

                if (window.self === window.top) {
                    sendMessage({
                        notify: 'load'
                    });
                    sendMessage({
                        type: 'setsize',
                        sizes: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        }
                    });
                    sendMessage({
                        type: 'url',
                        url: window.location.href
                    });
                }
            }
        });
    }

    function onUnLoad() {
        if (!state.recording) {
            return true;
        }

        channel.postMessage({ stopRecording: true });
    }

    function createChannel() {
        channel = chrome.runtime.connect({ name: "automrecoder" });

        channel.onMessage.addListener(handlChannelMessage);
    }

    function handlChannelMessage(message) {

    }

    function closeChannel() {
        channel.disconnect();
    }

    function eventCallBack(eventMessage) {
        sendMessage(eventMessage);
    }

    function sendMessage(message) {
        if (!state.recording) {
            return;
        }

        channel.postMessage(message);
    }

    start();
})()