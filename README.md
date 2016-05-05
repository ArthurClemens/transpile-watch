# transpile-watch

Utility script for transpiling files (es6, scss, ...) and to watch for changes. Convenience wrapper around [chokidar](https://github.com/paulmillr/chokidar).


## Invocation

```javascript
const watcher = require('transpile-watch');

watcher.watch(options);
```


`watch()` returns the Chokidar watcher object:

```javascript
const chokidarWatcher = watch({});
chokidarWatcher.close();
```


## Options

### what

String: directory to watch

### ignore

String: directory to ignore

### persistent

Boolean: set to `true` to keep watching

### extension

String: include filter for files to process

### createOutPath

Function: `function(inPath) -> String`: function to transform a path to an out path, for instance `es6` to `js`

### transform

Function: `function(inPath, outPath) -> String`: function to do the transpiling

### transformed

Function: `function()`: called after the transform function has been completed

### validPath

Function: `function(inPath) -> Boolean`: function to check the validity of the path

### debug

Boolean: set to `true` to log the results of the transform function

### events

Array: `['eventName', 'eventName']`: Transpile on defined events. Available events are: ready, add, change, unlink, addDir, unlinkDir (related to chokidar's events). If the event ready is choosen, transpiling does not start directly running the script.

## Example

Example script to transpile es6 files:

```javascript
'use strict';

// argv[2]: state (run once or watch)
// argv[3]: which dir to watch
// argv[4]: which dir to ignore

const watch = require('transpile-watch');
watch({
    persistent: !(process.argv[2] === 'once'),
    what: process.argv[3],
    ignore: (process.argv[4] && process.argv[4] !== 'null') ? process.argv[4] : null,
    extension: 'es6.js',
    events: ['ready', 'add', 'change'],
    createOutPath: function(inPath) {
        return inPath.replace(/es6.js$/, 'js');
    },
    transform: function(inPath, outPath) {
        return [
            'babel', inPath, '>', outPath,
            '&&',
            'uglifyjs', '-o', outPath, outPath
        ].join(' ');
    }
});
```

Invoked to run once:

```
"transpile-es6": "node scripts/watcher.js once src/"
```

Invoked to watch:

```
"watch-es6": "node scripts/watcher.js watch src/"
```
