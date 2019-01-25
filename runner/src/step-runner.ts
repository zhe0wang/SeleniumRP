import fs from 'fs';
import fse from 'fs-extra';
import resemble from 'node-resemble-js';

import Config from './config.json';
import KeyMap from './key-map';
import Utility from './utility';
import DriverWrapper from './driver-wrapper';
import Pixel from './Pixel';

let channel,
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
	defaultErrorWait = Config.error && Config.error.wait || 300,
	errorCount = 0,
	errorWait = 0,
	actionErrorCount = 0,
	isFinished = false,
	isRunning = false;
	
async function finish() {
	Config.closeOnFinish && await DriverWrapper.close();
	isFinished = true;
}

async function runTest(testName, steps, testChannel) {
	let step,
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
	await DriverWrapper.init(log);

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

async function runStepActions(step) {
	let actions = step.actions,
		i,
		errorStartIdx: any = null,
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
	let clientAction = action && actionMap[action.type];
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
	let logs = await DriverWrapper.getLogs();
	if (!logs) {
		return;
	}

	let filteredLogs = logs.filter((l) => l.level.value >= Config.browerLogLevel);
	filteredLogs.forEach((filterLog) => {
		if (filterLog.level.value > 900) {
			log('BROWER: ' + filterLog.message, 'error');
			updateResult('Error occured: ' + 'BROWER: ' + filterLog.message, false);
		} else if (filterLog.level.value > 800) {
			log('BROWER: ' + filterLog.message, 'warn');
		}
	});
}

async function doSetSize(action) {
	let sizes = action.sizes;

	log(`set size to: w-${sizes.width}, h-${sizes.height}`, null, errorCount);
	await DriverWrapper.setWindowSize(sizes);
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
	await DriverWrapper.goToUrl(action.url);
}

async function doClick(action) {
	await doClickAction(action);
}

async function doDblClick(action) {
	await doClickAction(action, true);
}

async function doClickAction(action, isDoubleClick = false) {
	log(`${!isDoubleClick ? 'click' : 'double click'}:  ${action.target.cssPath}`, null, errorCount);

	await DriverWrapper.click(action.target, isDoubleClick);
}

async function doContextMenu(action) {
	let	x = action.clientX,
		y = action.clientY;

	log(`contextmenu:  ${x}, ${y}`, null, errorCount);
	await DriverWrapper.contextClick(action.target, x, y);
}

async function doKey(action) {
	let keyCode = action.keyCode,
		key = KeyMap[action.keyCode] || String.fromCharCode(action.keyCode);

	log(`key:  ${key} : ${keyCode}`, null, errorCount);
	await DriverWrapper.sendKeys(action.target, key);
}

async function doKeyUp(action) {
	let value = action.target && action.target.value;
	if (value === null || value === undefined) {
		await doKey(action);
		return;
	}

	log(`set value:  ${value}`, null, errorCount);
	await DriverWrapper.sendKeys(action.target, value);
}

async function doScroll(action) {
	log(`scroll: ${action.scroll.left} ${action.scroll.top}`, null, errorCount);

	await DriverWrapper.scroll(action.target, action.scroll);
}

async function doVerify(action) {
	let text = (action.target || {}).textContent,
		verifyMessage = `verify - "${text || action.id}"`,
		result;

	log(verifyMessage, null, errorCount);
	result = await DriverWrapper.verify(action.target, text);
	log(verifyMessage, !result ? 'error' : 'success');
	updateResult(verifyMessage, result);
}

async function resetMouse() {
	log('reset mouse');
	await DriverWrapper.resetMouse();
}

async function createErrorScreenshot(action) {
	let fileName = `${currentActionIdx}-${action.id}-${action.type || ''}.png`,
		errorFolder = `${Config.screenErrorFolder}/${currentTestName}/${currentStep.name}/`,
		errorFile = `${errorFolder}${fileName}`;

	await resetMouse();
	let imgStr = await DriverWrapper.screenshot();
	let data = await Pixel.getImgData(imgStr);
	let dim = action && action.target && action.target.position;
	data = Pixel.highlight(dim, data, [255, 0, 0]);
	fse.ensureDirSync(errorFolder);	
	fs.writeFileSync(errorFile, data, 'base64');
}

async function doScreenShot(action) {
	await resetMouse();
	let imgStr = await DriverWrapper.screenshot();
	let data = await Pixel.getImgData(imgStr, action);
	await compareImages(action, data);
}

function compareImages(action, base64Data) {
	let stepName = currentStep.name,
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
		resemble(baseFile).compareTo(currentFile).ignoreColors().onComplete((data) => {
			let isSuccess = Number(data.misMatchPercentage) <= 0.01;

			log(screenshotMessage, isSuccess ? 'success' : 'error');
			updateResult(screenshotMessage, isSuccess);

			if (isSuccess) {
				resolve();
			} else {
				ws = fs.createWriteStream(diffFile);
				ws.on('finish', () => resolve());
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

function log(content, type?, isForce?) {
	channel && channel({
		testName: currentTestName,
		stepName: currentStep && currentStep.name,
		timeStamp: new Date().toISOString(),
		type: type || 'log',
		content: content,
		isForce: isForce
	});
}

function logResult(content, result?, isTestOnly?) {
	let message: any = {
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

let StepRunner = {
	runTest: runTest
}

export default StepRunner;