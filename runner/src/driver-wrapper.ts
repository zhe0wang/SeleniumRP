import { Builder, By, Capabilities } from 'selenium-webdriver';
import Config from './config.json';
import chromedriver from 'chromedriver';

let driver;
let isIE = Config.brower === 'internet explorer';
let browserMargin = {
    x: 0,
    y: 0
};
let logger;

async function init(logFunc) {
    let builder = new Builder().forBrowser(Config.brower),
        capabilities,
        width = Config.windowSize.width || 800,
        height = Config.windowSize.height || 600;

    logger = logFunc;
    if (Config.serverUrl) {
        builder.usingServer(Config.serverUrl);
    }

    if (isIE) {
        capabilities = Capabilities.ie();
        capabilities.set('nativeEvents', false);
        // capabilities.set('ie.forceCreateProcessApi', true);
        // capabilities.set('ie.browserCommandLineSwitches', '-private');

        builder.withCapabilities(capabilities);
    }

    if (Config.headless) {
        logger('running headless mode');
        capabilities = Capabilities.chrome();
        capabilities.set('chromeOptions', {args: ['--headless']});

        builder.withCapabilities(capabilities);
    }

    driver = await builder.build();

    await updateBrowserMargin();
    driver.manage().setTimeouts({
        script: 15000
    });
    await driver.manage().window().setRect({ width: width + browserMargin.x, height: height + browserMargin.y })
}

async function updateBrowserMargin() {
    let margins = await driver.executeScript('return [window.outerWidth-window.innerWidth, window.outerHeight-window.innerHeight];');
    browserMargin = {
        x: margins[0],
        y: margins[1]
    };
}

async function getLogs() {
    let logType = 'browser';
    if (isIE || !Config.browerLogLevel) {
        return;
    }

    let driverLogs = await driver.manage().logs();
    if (!driverLogs) {
        return;
    }

    let types = await driverLogs.getAvailableLogTypes();
    if (types.indexOf(logType) < 0) {
        return;
    }

    return await driverLogs.get(logType);
}

async function setWindowSize(sizes) {
    let width = (sizes.width || Config.windowSize.width) + browserMargin.x,
        height = (sizes.height || Config.windowSize.height) + browserMargin.y;

    await driver.manage().window().setRect({ width, height });
}

async function goToUrl(url) {
    await driver.get(url);
}

async function click(target, isDoubleClick = false) {
    let el = await getEl(target);
    if (!isDoubleClick) {
        await el.click(el);
    } else {
        await el.doubleClick(el);
    }
}

async function contextClick(target, x, y) {
    let el = await getEl(target);
    await driver.actions()
        .contextClick(el, 2)
        .perform();
}

async function getEl(target) {
    return await driver.findElement(By.css(target.cssPath));
}

async function sendKeys(target, keys) {
    let el = await getEl(target);
    await el.sendKeys(keys);
}

async function scroll(target, scrollOffset) {
    let el = await getEl(target);

    await driver.executeScript(function () {
        let args = arguments[arguments.length - 1],
            el = args[0],
            scrollOffset = args[1];

        if (scrollOffset.left) {
            el.scrollLeft = scrollOffset.left;
        }

        if (scrollOffset.top) {
            el.scrollTop = scrollOffset.top;
        }
    }, [el, scrollOffset]);
}

async function verify(target, text) {
    let el = await getEl(target);
    if (!el) {
        return false;
    }

    if (text) {
        let elText = await el.getText();
        return text.trim() === (elText || '').trim();
    }

    return true;
}

async function resetMouse() {
	await driver.actions().move({duration: 0, x: -100000, y: -100000});
}

async function screenshot() {
    return await driver.takeScreenshot()
}

async function close() {
    driver && await driver.quit();
}

const DriverWrapper = {
    init: init,
    getLogs: getLogs,
    setWindowSize: setWindowSize,
    goToUrl: goToUrl,
    click: click,
    contextClick: contextClick,
    sendKeys: sendKeys,
    scroll: scroll,
    verify: verify,
    resetMouse: resetMouse,
    screenshot: screenshot,
    close: close
};

export default DriverWrapper;