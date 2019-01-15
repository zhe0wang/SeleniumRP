const {Builder, By} = require('selenium-webdriver');

let fs = require('fs'),
	fse = require('fs-extra'),
	resemble = require('node-resemble-js'),
	webdriver = require('selenium-webdriver'),
	PNG = require('pngjs').PNG,
	Config = require('./config.js'),
	KeyMap = require('./keyMap.js'),
	Utility = require('./utility.js'),
	driver,
	channel,
	browserMargin = {
		x:0, 
		y: 0
	},
	actionMap = {
		url: goToUrl,
		click: doClick,
		dblclick: doDblClick,
		keydown: doKey,
		keypress: doKey,
		keyup: doKeyUp,
		scroll: doScroll,
		contextmenu: doContextMenu,
		screenshot: doScreenShot,
		verify: doVerify,
		wait: doWait,
		setsize: doSetSize
	},
	currentUrl,
	currentTestName,
	currentTestResult = true,
	currentStep,
	currentStepResult = true,
	currentActionIdx = 0,
	isIE = Config.brower === 'internet explorer',
	defaultErrorWait = Config.error && Config.error.wait || 300,
	errorCount = 0,
	errorWait = 0,
	actionErrorCount = 0;
	
async function finish() {
	if (Config.closeOnFinish && driver) {
		await driver.quit();
	}

	isFinished = true;
}

async function runTest(testName, steps, testChannel) {
	var step,
		i,
		len = steps && steps.length;

	if (!len) {
		finish();
		return;
	}

	currentUrl = null;
	isRunning = true;
	currentTestResult = true;
	currentTestName = testName;
	channel = testChannel;
	await initDriver();

	logResult('Start', null, true);
	for(i = 0; i < len; i +=1) {
		step = steps[i];
		currentStep = step;
		currentStepResult = true;

		log('');		
		log(`--- step: ${currentStep.name} --- `, 'highlight');
		logResult('Start');
		await runStepActions(step);
		logResult('Finish', currentStepResult);
		if (actionErrorCount >= 2) {
			break;
		}
	}

	finish();
	logResult('Finish', currentTestResult, true);
	isRunning = false;
}

async function initDriver() {
	var builder = new Builder().forBrowser(Config.brower),
		capabilities,
		width = Config.windowSize.width || 800,
		height = Config.windowSize.height || 600;

	if (Config.serverUrl) {
		builder.usingServer(Config.serverUrl);
	}

	if (isIE) {
		capabilities = webdriver.Capabilities.ie();
		capabilities.set('nativeEvents', false);
		// capabilities.set('ie.forceCreateProcessApi', true);
		// capabilities.set('ie.browserCommandLineSwitches', '-private');

		builder.withCapabilities(capabilities);
	}

	driver = await builder.build();

	await updateBrowserMargin();
	driver.manage().setTimeouts({
		script: 15000
	});
	await driver.manage().window().setRect({ width: width + browserMargin.x, height: height + browserMargin.y})
}

async function updateBrowserMargin() {
	var margins = await driver.executeScript('return [window.outerWidth-window.innerWidth, window.outerHeight-window.innerHeight];');
	browserMargin = {
		x: margins[0],
		y: margins[1]
	};
}

async function runStepActions(step) {
	var actions = step.actions,
		i,
		errorStartIdx = null,
		len = actions.length;

	for(i = 0; i < len; i +=1) {
		currentActionIdx = i;
		clearErrorCount();
		await Utility.sleep(Config.wait.all);
		await doAction(actions[i]);
		await doCheckError();
		
		if (actionErrorCount === 1 && errorStartIdx == null) {
			errorStartIdx = i;			
		} else if (actionErrorCount >= 1 && i - errorStartIdx > actionErrorCount) {
			errorStartIdx = null;
			actionErrorCount = 0;
		} else if (actionErrorCount >= 2) {
			break;
		}
	}
}

async function doAction(action) {
	var clientAction = action && actionMap[action.type];
	if (!clientAction) {
		log(`No action found for: ${action.type}`, 'warn')
		return;
	}

	try {
		await Utility.sleep(Config.wait[action.type]);
		await clientAction(action);
	} catch(err) {	
		if (errorCount >= Config.error.retryCount) {	
			log(err, 'error');
			updateResult('Error occured', false);
			await createErrorScreenshot(action);
			actionErrorCount += 1;
			return;
		}

		errorCount += 1;
		errorWait += defaultErrorWait;	
		log(`--- retry: ${errorCount} ---`, 'warn', true);
			
		await Utility.sleep(errorWait);
		await doAction(action);
	}
}

function clearErrorCount() {
	errorCount = 0;
	errorWait = Config.error && Config.error.wait || 300;
}

async function doCheckError() {
	var logType = 'browser',
		driverLogs,
		types,
		logs,
		filteredLogs;

	if (isIE || !Config.browerLogLevel) {
		return;
	}

	driverLogs = await driver.manage().logs();
	types = await driverLogs.getAvailableLogTypes();
	if (types.indexOf(logType) > -1) {
		logs = await driverLogs.get(logType);
		filteredLogs = logs.filter((l) => l.level.value >= Config.browerLogLevel);
		filteredLogs.forEach(function(filterLog) {
			if (filterLog.level.value > 900) {
				log('BROWER: ' + filterLog.message, 'error');
				updateResult('Error occured: ' + 'BROWER: ' + filterLog.message, false);
			} else if (filterLog.level.value > 800) {
				log('BROWER: ' + filterLog.message, 'warn');
			}
		});
	}
}

async function doSetSize(action) {
	var sizes = action.sizes,
		width = (Config.windowSize.width || sizes.width) + browserMargin.x,
		height = (Config.windowSize.height || sizes.height) + browserMargin.y;

	log(`set size to: w-${width}, h-${height}`, null, errorCount);
	await driver.manage().window().setRect({width, height});
}

async function doWait(action) {
	log(`wait for: ${action.value} ms`, null, errorCount);
	await Utility.sleep(action.value);
}

async function goToUrl(action) {
	if (currentUrl) {
		return;
	}

	currentUrl = Config.startUrl || action.url;
	log(currentUrl, null, errorCount);
	await driver.get(action.url);
}

async function doClick(action) {
	await doClickAction(action);
}

async function doDblClick(action) {
	await doClickAction(action, true);
}

async function doClickAction(action, isDbl) {
	log(`${!isDbl ? 'click' : 'double click'}:  ${action.target.cssPath}`, null, errorCount);

	el = await getEl(action.target);
	if (!isDbl) {
		await el.click(el);
	} else {
		await el.doubleClick(el);
	}
}

async function doContextMenu(action) {
	var	x = action.clientX,
		y = action.clientY,
		el;

	log(`contextmenu:  ${x}, ${y}`, null, errorCount);
	el = await getEl(action.target);
	await driver.actions()
		.contextClick(el, 2)
		.perform();
}

async function doKey(action, cb) {
	var keyCode = action.keyCode,
		key = KeyMap[action.keyCode] || String.fromCharCode(action.keyCode),
		el;

	log(`key:  ${key} : ${keyCode}`, null, errorCount);
	el = await getEl(action.target);
	await el.sendKeys(key);
}

async function doKeyUp(action, cb) {
	var value = action.target && action.target.value,
		el;

	if (value === null || value === undefined) {
		await doKey(action);
		return;
	}

	log(`set value:  ${value}`, null, errorCount);
	el = await getEl(action.target);
	await el.sendKeys(value);
}

async function doScroll(action) {
	var el;
	log(`scroll: ${action.scroll.left} ${action.scroll.top}`, null, errorCount);

	el = await getEl(action.target);
	await scrollByElement(el, action.scroll);
}

async function doVerify(action) {
	var textContent = (action.target || {}).textContent || action.id,
		verifyMessage = `verify - "${textContent}"`,
		el;

	log(verifyMessage, null, errorCount);
	el = await getEl(action.target);
	log(verifyMessage, !el ? 'error' : 'success');
	updateResult(verifyMessage, el);
}

async function resetMouse() {
	log('reset mouse');
	await driver.actions().move({x: -100000, y: -100000});
}

async function getEl(target) {
	return await driver.findElement(By.css(target.cssPath));
}

async function scrollByElement(element, scrollOffset) {
	await driver.executeScript(function () {
		var args = arguments[arguments.length - 1],
			el = args[0],
			scrollOffset = args[1];
		
		if (scrollOffset.left) {
			el.scrollLeft = scrollOffset.left;
		}

		if (scrollOffset.top) {
			el.scrollTop = scrollOffset.top;
		}	
	}, [element, scrollOffset]);
}

async function createErrorScreenshot(action) {
	var fileName = `${currentActionIdx}-${action.id}-${action.type || ''}.png`,
		errorFolder = `${Config.screenErrorFolder}/${currentTestName}/${currentStep.name}/`,
		errorFile = `${errorFolder}${fileName}`,
		data;

	await resetMouse();
	data = await getScreenshotData();
	data = highlightTarget(action, data, [255, 0, 0]);
	fse.ensureDirSync(errorFolder);	
	fs.writeFileSync(errorFile, data, 'base64');
}

function highlightTarget(action, data, color) {
	var png,
		targetPosition = action && action.target && action.target.position,
		targetHeight,
		targetWidth,
		x,
		y,
		idx,
		isValid = targetPosition && targetPosition.x >= 0  && targetPosition.y >= 0 && targetPosition.width && targetPosition.height;
	
	if (!isValid) {
		return data;
	}

	png = PNG.sync.read(new Buffer(data, 'base64'));
	targetHeight = Math.min(targetPosition.y + targetPosition.height, png.height);
	targetWidth = Math.min(targetPosition.x +  targetPosition.width, png.width);
	for (var y = targetPosition.y; y < targetHeight; y += 1) {
		for (var x = targetPosition.x; x < targetWidth; x += 1) {
			if (y > targetPosition.y && y < targetHeight - 1 && x > targetPosition.x && x < targetWidth - 1) {
				continue;
			}

			idx = (png.width * y + x) << 2;
			png.data[idx] = color[0];
			png.data[idx+1] = color[1];
			png.data[idx+2] = color[2];
		}
	}

	return PNG.sync.write(png).toString('base64');
}

async function doScreenShot(action) {
	var data;

	await resetMouse();
	data = await getScreenshotData(action);
	await compareImages(action, data);
}

async function getScreenshotData(action) {
	var imgStr = await driver.takeScreenshot(),
		base64Data = imgStr.replace(/^data:image\/png;base64,/, ''),
		png,
		regionPng;

	if (action && action.x >= 0  && action.y >= 0 && action.width && action.height) {
		png = PNG.sync.read(new Buffer(base64Data, 'base64'));
		regionPng = new PNG({width: action.width, height: action.height});
		PNG.bitblt(png, regionPng, action.x, action.y, action.width, action.height, 0, 0);
		base64Data = PNG.sync.write(regionPng).toString('base64');
	}

	return base64Data;
}

function compareImages(action, base64Data) {
	var stepName = currentStep.name,
		screenShotName = `${action.screenIndex || action.id}`,
		fileName = `${screenShotName}.png`,
		baseFolder = `${Config.screenBaseFolder}/${currentTestName}/${stepName}/`,
		currentFolder = `${Config.screenCurrentFolder}/${currentTestName}/${stepName}/`,
		diffFolder = `${Config.screenDiffFolder}/${currentTestName}/${stepName}/`,
		baseFile = `${baseFolder}${fileName}`,
		currentFile = `${currentFolder}${fileName}`,
		diffFile = `${diffFolder}${fileName}`,
		screenshotMessage = `screenshot "${stepName} - ${screenShotName}"`,
		ws;

	log(screenshotMessage, null, errorCount);
	fse.ensureDirSync(baseFolder);
	fse.ensureDirSync(currentFolder);
	fse.ensureDirSync(diffFolder);

	Utility.ensureFile(baseFile, base64Data, 'base64');
	fs.writeFileSync(currentFile, base64Data, 'base64');

	return new Promise((resolve, reject) => {
		resemble(baseFile).compareTo(currentFile).ignoreColors().onComplete(function (data) {
			var isSuccess = Number(data.misMatchPercentage) <= 0.01;

			log(screenshotMessage, isSuccess ? 'success' : 'error');
			updateResult(screenshotMessage, isSuccess);

			if (isSuccess) {
				resolve();
			} else {
				ws = fs.createWriteStream(diffFile);
				ws.on('finish', function() {
					resolve();
				});
				data.getDiffImage().pack().pipe(ws);
			}			
		});
	});
}

function updateResult(message, result) {
	logResult(message, result);
	if (!result) {
		currentStepResult = false;
		currentTestResult = false;
	}
}

function log(content, type, isForce) {
	channel && channel({
		testName: currentTestName,
		stepName: currentStep && currentStep.name,
		timeStamp: new Date().toISOString(),
		type: type || 'log',
		content: content,
		isForce: isForce
	});
}

function logResult(content, result, isTestOnly) {
	var message = {
		testName: currentTestName,
		timeStamp: new Date().toISOString(),
		type: 'result',
		content: content,
		result: result
	};

	if (!isTestOnly && currentStep && currentStep.name) {
		message.stepName = currentStep.name;
	}

	channel && channel(message);
}

var StepRunner = {
	runTest: runTest
}

module.exports = StepRunner;