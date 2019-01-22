import Alertify from 'alertify.js';

const Utility = {
    logSuccess: function (message) {
        Alertify.logPosition('top right');
        Alertify.success(message)
    },
    logError: function (message) {
        Alertify.logPosition('top right');
        Alertify.error(message)
    },
    saveFile: function (fileName, content) {
        var a = document.createElement('a'),
            content,
            file;

        file = new Blob([content], {type: 'data:text/plain;charset=utf-8'});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
}

export default Utility;