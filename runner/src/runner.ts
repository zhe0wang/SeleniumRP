import fs from 'fs';
import * as path from 'path';
import fse from 'fs-extra';
import {fork} from 'child_process';
import Config from './config.json';
import Utility from './utility';
import Logger from './logger';
import ResultWriter from './result-writer';
import TestRunner from './test-runner';

let runnerResult = true,
	results: any = {
		tests: []
	},
	tests: any = [],
	testIdx;

run();

async function run() {
	results.createTime = new Date().toISOString();
	Logger.setDebugging(Config.isDebugging);

	process.on('uncaughtException', onError);
	process.on('exit', 	() => {
		let exitCode = runnerResult ? 0 : 1;
		Logger.log('Exit with: ' + exitCode);	
		results.endTime = new Date().toISOString();
		ResultWriter.writeResult(results);
		process.exit(exitCode);
	});

	initFolders();
	fetchTests();
	await runTests();
}

function initFolders() {
	[Config.screenBaseFolder, Config.screenCurrentFolder, Config.screenDiffFolder, Config.screenErrorFolder].forEach((folder) => {
		fse.ensureDirSync(folder);
	});

	[Config.screenCurrentFolder, Config.screenDiffFolder, Config.screenErrorFolder].forEach((folder) => {
		fse.emptyDirSync(folder);
	});
}

function fetchTests() {
	let folders = Utility.getFiles(Config.sourceFolder, true) || [],
		testToRun: any = [];
	
	tests = [];
	process.argv.forEach((val: string, index) => {
		if (index <= 1) {
			return;
		}

		testToRun.push(path.join(Config.sourceFolder, val));
	});
	
	folders.push(Config.sourceFolder);
	folders.forEach(function (subFolder) {
		let stepsFile;

		if (!Utility.isOnPath(subFolder, Config.shareFolder) 
			&& (Config.exclude || []).every((exd) => !Utility.isOnPath(subFolder, exd))
			&& (!testToRun.length 
				|| testToRun.some((toRun) => Utility.isOnPath(subFolder, toRun)))) {
			stepsFile = path.join(subFolder, 'steps.json');
			if (fs.existsSync(stepsFile)) {
				tests.push(subFolder);					
			}
		}
	});	
}

async function  runTests() {
	if (Config.batchSize >= 2) {
		runParallel();			
	} else {
		await runSequence();
	}
}

async function runSequence() {
	let i = 0,
		len = tests.length;
		
	for(i = 0; i < len; i += 1) {
		await TestRunner.runTest(tests[i], channel);
	}
}

function runParallel() {
	let testLen = tests.length;

	for(testIdx = 0; testIdx < Config.batchSize && testIdx < testLen; testIdx += 1) {
		createChildProcess(testIdx);
	}
}

function createChildProcess(idx) {
	let test = tests[idx],
		child

	if (!test) {
		return;
	}

	child = fork('./testRunner.js', [test]);
	child.on('message', channel);

	child.on('exit', function (exitCode) {
		Logger.log("Child exited with code: " + exitCode);
		runNextTest();
	});
}

function runNextTest() {
	if (testIdx >= tests.length) {
		return;
	}

	createChildProcess(testIdx);					
	testIdx += 1;
}

function channel(message) {
	let logAction = Logger[message.type],
		hasStep = message.stepName,
		test = results.tests.find((test) => test.name === message.testName),
		prefix,
		step,
		receiver;

	if (!test) {
		test = {
			name: message.testName,
			results: [],
			steps: [],
			logs: []
		};
		results.tests.push(test);
	}	

	if (hasStep) {
		step = test.steps.find((step) => step.name === message.stepName);
		if (!step) {
			step = {
				name: message.stepName,
				results: [],
				logs: []
			};
			test.steps.push(step);
		}
	}

	prefix = `${message.testName || ''} - ${message.stepName || ''}: `;
	if (logAction) {
		logAction(prefix + message.content, message.isForce);
	} else if (message.type === 'result' && (message.result === true || message.result === false)) {
		logAction = message.result ? Logger.success : Logger.error;
		logAction(prefix + message.content, true);
		if (!message.result) {
			runnerResult = false;
		}
	}

	receiver = hasStep ? step : test;
	if (message.type !== 'result') {
		receiver.logs.push(message);	
	} else {
		receiver.results.push(message);
	}
}

function onError(errors) {
	Logger.logError(errors);
	runnerResult = false;
}

let Runner = {
	run: run
};

export default  Runner;