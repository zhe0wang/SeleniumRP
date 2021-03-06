import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import StepRunner from './step-runner';
import Config from './config.json';
import Utility from './utility';

let	screenBaseFolder,
	screenCurrentFolder,
	screenDiffFolder,
	screenErrorFolder,
	testName,
	isParallel;

init();

function init() {
	isParallel = false;
	if (process.argv.length > 2) {
		isParallel = true;
		RunAsParallel(process.argv[2]);
	}
}

function RunAsParallel(testFolder) {
	runTest(testFolder, parallelChanel);
}

function parallelChanel(message) {
	(<any>process).send(message);
}

async function runTest(testFolder, channel) {
	let steps;

	initFolders(testFolder);
	steps = getSteps(testFolder, channel);
	await StepRunner.runTest(testName, steps, channel);
}

function initFolders(testFolder) {
	testName = path.relative(Config.sourceFolder, testFolder);

	screenBaseFolder = path.join(Config.screenBaseFolder, testName);
	screenCurrentFolder = path.join(Config.screenCurrentFolder, testName);
	screenDiffFolder = path.join(Config.screenDiffFolder, testName);
	screenErrorFolder =  path.join(Config.screenErrorFolder, testName);

	[screenBaseFolder, screenCurrentFolder, screenDiffFolder, screenErrorFolder].forEach((folder) => {
		fse.ensureDirSync(folder);
	});

	[screenCurrentFolder, screenDiffFolder, screenErrorFolder].forEach((folder) => {
		fse.emptyDirSync(folder);
	});
}

function getSteps(testFolder, channel) {
	let stepsFile = path.join(testFolder, 'steps.json'),
		stepNames,
		steps,
		i,
		len,
		stepData,
		stepName,
		stepPath,
		results: any = [];

	if (!fs.existsSync(stepsFile)) {
		channel({
			type: 'error',
			content: testName + ': Could not find step file!'
		});
		return null;
	}

	stepNames = JSON.parse(fs.readFileSync(stepsFile, 'utf8'));
	steps = stepNames && stepNames.steps;
	if (!steps) {
		return;
	}

	for(i = 0, len = steps.length; i < len; i += 1) {
		stepName = steps[i] && steps[i].name;
		stepPath = path.join(testFolder, `${stepName}.json`);
		
		if (!fs.existsSync(stepPath)) {
			stepPath = path.join(Config.shareFolder, `${stepName}.json`);
			
			if (!fs.existsSync(stepPath)) {
				channel({
					type: 'error',
					content: 'Could not find step: ' + stepName
				});
				return null;
			}
		}

		try {
			stepData = fs.readFileSync(stepPath, 'utf8');
			if (stepData) {
				results.push(JSON.parse(stepData));
			}
		} catch(e) {
			channel({
				type: 'error',
				content: stepPath + ': Invalid content'
			});
			return null;
		}
	}

	return results;
}

let TestRunner = {
	runTest: runTest
};

export default TestRunner;