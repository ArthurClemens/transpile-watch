'use strict';
const chokidar = require('chokidar');

const watch = function(options) {
    const what = options.what;
    const ignore = options.ignore;
    const persistent = options.persistent;
    const validExtension = options.extension;
    const createOutPath = options.createOutPath;
    const transform = options.transform;
    const validPath = options.validPath || function() {return true;};
    const debug = options.debug;
    const extensionRe = new RegExp(validExtension.replace('.', '\\.') + '$', 'g');
    const ignoreRe = new RegExp('^' + ignore);

    const watcher = chokidar.watch(what, {
        ignored: /[\/\\]\./,
        persistent: persistent
    });

    const execute = function(command) {
        const exec = require('child_process').exec;
        const log = function(error, stdout, stderr) {
            if (stderr) {
                console.log(stderr);
            } else if (stdout && debug) {
                console.log(stdout);
            }
        };
        if (debug) {
            console.log(command);
        }
        exec(command, log);
    };

    const extension = function(path) {
        const ext = path.match(extensionRe);
        if (ext !== null) {
            return ext[0];
        }
    };

    const isValidExtension = function(path) {
        return (extension(path) === validExtension);
    };

    const isIgnored = function(path) {
        if (!ignore) {
            return false;
        }
        return path.match(ignoreRe);
    };

    const isValidFile = function(path) {
        return validPath(path) && isValidExtension(path) && !isIgnored(path);
    };

    const doTransform = function(path) {
        execute(transform(path, createOutPath(path)));
    };

    watcher.on('change', function(path) {
        if (isValidFile(path)) {
            console.log(validExtension, 'file changed, transforming', path);
            doTransform(path);
        }
    });

    watcher.on('add', function(path) {
        if (isValidFile(path)) {
            console.log(validExtension, 'file found, transforming', path);
            doTransform(path);
        }
        watcher.unwatch(path);
    });
};

module.exports = watch;
