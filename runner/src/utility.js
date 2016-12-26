var fs = require('fs'),
    path = require('path');

function getFiles(dir, forFolder){
    var all = [],
        files = fs.readdirSync(dir) || [];
    for (var i in files){
        var name = dir + (dir.endsWith('/') ? '' : '/') + files[i];
        if (fs.statSync(name).isDirectory()) {
            forFolder && all.push(name);
            all = all.concat(getFiles(name, forFolder));
        } else {
            !forFolder && all.push(name);
        }
    }
    return all;
}

function fileExists(path) {
    try {
        fs.statSync(path);
        return true;
    } catch (e) {
        return false;
    }
}

function ensureFile(path, data, encoding) {
	var state;

	try {
		fs.statSync(path);
	} catch (e) {
		fs.writeFileSync(path, data, encoding);
	}
}

function isOnPath(a, b) {
    return a.startsWith(b) || !path.relative(a, b);
}

function sleep(ms = 0) {
    return new Promise(r => setTimeout(r, ms));
}

const Utility = {
    getFiles: getFiles,
    fileExists: fileExists,
    ensureFile: ensureFile,
    sleep: sleep,
    isOnPath: isOnPath
};

module.exports = Utility;