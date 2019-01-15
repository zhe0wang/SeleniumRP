import fs from 'fs';
import TRX from 'node-trx';
import Logger from './logger';
 
let TestRun = TRX.TestRun,
    UnitTest = TRX.UnitTest;
    
function writeResult(results) {
    if (!results.tests.length || !results.tests.some((t) => t.results && t.results.length)) {
        return;
    }

    try {
        fs.writeFileSync('result.json', JSON.stringify(results, null, 4));

        writeTrxResult(results);
    } catch (err) {
        Logger.error(err);
    }
}

function writeTrxResult(results) {
    var run,
        computerName = 'Autom runner';

    try {
        run = new TestRun({ 
            name: 'Autom Tests',
            times: {
                creation: results.createTime,
                queuing: results.createTime,
                start: results.createTime,
                finish: results.endTime
            }
        });

        results.tests.forEach(function(test) {
            var testName = test.name;

            test.steps.forEach(function (step) {
                var stepResults = step.results,
                    testResult,
                    startResult = stepResults.find((r) => r.content === 'Start'),
                    endResult = stepResults.find((r) => r.content === 'Finish'),
                    outcome = endResult && endResult.result ? 'Passed' : 'Failed',
                    startTime = startResult && startResult.timeStamp,
                    endTime = endResult && endResult.timeStamp,
                    duration = startTime && endTime && (new Date(endTime).valueOf() - new Date(startTime).valueOf()),
                    actions;

                testResult = {
                    test: new UnitTest({ 
                        name: testName + ' - ' + step.name, 
                        methodName: '', 
                        methodCodeBase: '', 
                        methodClassName: step.name,
                        description: `test: ${testName} - step: ${step.name}` 
                    }),
                    computerName: computerName,
                    outcome: outcome,
                    duration: duration || '',
                    startTime: startTime || '',
                    endTime: endTime || ''
                };

                run.addResult(testResult);
            });
        });

        fs.writeFileSync('result.trx', run.toXml());
    } catch (err) {
        Logger.error(err);
    }
}

const ResultWriter = {
    writeResult: writeResult,
    writeTrxResult: writeTrxResult
};

export default ResultWriter;