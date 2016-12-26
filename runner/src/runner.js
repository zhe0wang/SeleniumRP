var fs = require('fs'),
	path = require('path'),
	fse = require('fs-extra'),
	fork = require('child_process').fork,
	Config = require('./config.js'),
	Utility = require('./utility.js'),
	Logger = require('./logger.js'),
	ResultWriter = require('./resultWriter.js'),
	TestRunner = require('./testRunner.js'),
	runnerResult = true,
	results = {
		tests: []
	},
	tests = [],
	testIdx;

run();

async function run() {
	results.createTime = new Date().toISOString();
	Logger.setDebugging(Config.isDebugging);

	process.on('uncaughtException', onError);
	process.on('exit', 	() => {
		var exitCode = runnerResult ? 0 : 1;
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
	var folders = Utility.getFiles(Config.sourceFolder, true) || [],
		testToRun = [];
	
	tests = [];
	process.argv.forEach((val, index) => {
		if (index <= 1) {
			return;
		}

		testToRun.push(path.join(Config.sourceFolder, val));
	});
	
	folders.push(Config.sourceFolder);
	folders.forEach(function (subFolder) {
		var stepsFile;

		if (!Utility.isOnPath(subFolder, Config.shareFolder) 
			&& (Config.exclude || []).every((exd) => !Utility.isOnPath(subFolder, exd))
			&& (!testToRun.length 
				|| testToRun.some((toRun) => Utility.isOnPath(subFolder, toRun)))) {
			stepsFile = path.join(subFolder, 'steps.json');
			if (Utility.fileExists(stepsFile)) {
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
	var i = 0,
		len = tests.length;
		
	for(i = 0; i < len; i += 1) {
		await TestRunner.runTest(tests[i], channel);
	}
}

function runParallel() {
	var testLen = tests.length;

	for(testIdx = 0; testIdx < Config.batchSize && testIdx < testLen; testIdx += 1) {
		createChildProcess(testIdx);
	}
}

function createChildProcess(idx) {
	var test = tests[idx],
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
	var logAction = Logger[message.type],
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

var Runner = {
	run: run
};

module.exports = Runner;