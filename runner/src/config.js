let Config = {
    isDebugging: true,
    sourceFolder: './data/',
    shareFolder: './data/share/',
    screenBaseFolder: './screens/base/',
    screenCurrentFolder: './screens/current/',
    screenDiffFolder: './screens/diff/',
    screenErrorFolder: './screens/error/',
    windowSize: {
        width: null,
        height: null
    },
    brower: 'chrome',
	//brower: 'internet explorer',
    //brower: 'MicrosoftEdge',
    //serverUrl: 'http://localhost:4444/wd/hub',
    browerLogLevel: 10000,

    startUrl: null,
    error: {
        retryCount: 3,
        wait: 0
    },
    wait: {
        all: null
    },
    closeOnFinish: true,
    exclude: [],
    batchSize: 0
};

module.exports = Config;