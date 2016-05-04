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
    const events = options.events || ['init', 'add', 'change'];

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

    const watcherEvents = function() {
        for(var i = 0; i < events.length; i++) {
            var event = events[i];
            if (event !== 'ready') {
                watcher.on(event, function(path) {
                    if (isValidFile(path)) {
                        console.log(validExtension, '[' + event + '] transforming', path);
                        doTransform(path);
                    }
                    if (['add', 'unlink'].indexOf(event) > 0) {
                        watcher.unwatch(path);
                    }
                });
            }
        }
    };

    if (events.indexOf('ready') > 0) {
        watcherEvents();
    } else {
        watcher.on('ready', watcherEvents);
    }
};

module.exports = watch;
