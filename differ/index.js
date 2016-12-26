
var express = require('express'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    path = require('path'),
    config = require('./config.js'),
    baseFolderUrl = '/base',
    currentFolderUrl = '/current',
    diffFolderUrl = '/diff',
    app = express();

start();

function start() {
    if (!fs.existsSync(config.screenBaseFolder)) {
        console.error(`Base folder doesn't exit`);
        return;
    }

    if (!fs.existsSync(config.screenCurrentFolder)) {
        console.error(`Current folder doesn't exit`);
        return;
    }

    if (!fs.existsSync(config.screenDiffFolder)) {
        console.error(`Diff folder doesn't exit`);
        return;
    }

    app.use('/', express.static('./'));
    app.use(baseFolderUrl, express.static(config.screenBaseFolder));
    app.use(currentFolderUrl, express.static(config.screenCurrentFolder));
    app.use(diffFolderUrl, express.static(config.screenDiffFolder));

    app.use(bodyParser.json());
    app.get('/diffInfo', getDiffInfo);

    app.post('/acceptDiff', acceptDiff);

    console.log('Magic on http://localhost:3000/! Ctrl + c to exit');
    app.listen(3000);
}

function getDiffInfo(req, res) {
    var response = [],
        diffFiles = getFiles(config.screenDiffFolder) || [];

    diffFiles.forEach(function (diffFile) {
        var file = path.relative(config.screenDiffFolder, diffFile),
            diff = path.join(diffFolderUrl, file),
            base = path.join(baseFolderUrl, file),
            current = path.join(currentFolderUrl, file),
            fileExt = path.extname(file),
            fileName = file.substring(0, file.length - fileExt.length),
            fileSegs = fileName.split(path.sep);

        response.push({
            titleSegs: fileSegs,
            file: file,
            base: base,
            current: current,
            diff: diff
        });
    });

    res.send(response);
}


function getFiles(dir){
    var all = [],
        files = fs.readdirSync(dir) || [];
    for (var i in files){
        var name = dir + (dir.endsWith('/') ? '' : '/') + files[i];
        if (fs.statSync(name).isDirectory()){
            all = all.concat(getFiles(name));
        } else {
            all.push(name);
        }
    }
    return all;
}

function acceptDiff(req, res) {
    var file = req.body.file,
        base,
        current,
        diff;

    if (!file) {
        res.sendStatus(404);
        return;
    }

    base = path.join(config.screenBaseFolder, file);
    current = path.join(config.screenCurrentFolder, file);
    diff = path.join(config.screenDiffFolder, file);

    fileExists(base) && fs.unlinkSync(base);
    fileExists(current) && fs.writeFileSync(base, fs.readFileSync(current));
    fileExists(diff) && fs.unlinkSync(diff);
    res.sendStatus(200);
}


function fileExists(file) {
    try {
        fs.statSync(file);
        return true;
    } catch (err) {
        return false;
    }
}