import fs from 'fs';
import path from 'path';

function getFiles(dir, forFolder){
    let all: any = [],
        files = fs.readdirSync(dir) || [];
    for (let i in files){
        let name = dir + (dir.endsWith('/') ? '' : '/') + files[i];
        if (fs.statSync(name).isDirectory()) {
            forFolder && all.push(name);
            all = all.concat(getFiles(name, forFolder));
        } else {
            !forFolder && all.push(name);
        }
    }
    return all;
}

function ensureFile(path, data, encoding) {
	let state;

    if (!fs.existsSync(path)) {
		fs.writeFileSync(path, data, encoding);
	}
}

function isOnPath(a, b) {
    return a.startsWith(b) || !path.relative(a, b);
}

function sleep(ms: any = 0) {
    return new Promise(r => setTimeout(r, ms));
}

const Utility = {
    getFiles: getFiles,
    ensureFile: ensureFile,
    sleep: sleep,
    isOnPath: isOnPath
};

export default Utility;