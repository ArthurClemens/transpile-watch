const watch = require('../lib/transpile-watch');
const fs = require('fs');
const touch = require('touch');

const testFileIn = './test/test-file-in.es6';
const testFileOut = './test/test-file-out.js';

const doesExist = (filePath) => {
    console.log("doesExist")
    try {
        fs.statSync(filePath);
    } catch (err) {
        if (err.code == 'ENOENT') {
            return false;
        }
    }
    return true
}

cleanupTestFiles = () => { 
    if (doesExist(testFileIn)) {
        console.log("testFileIn does exist")
        fs.unlinkSync(testFileIn);   
    }
    if (doesExist(testFileOut)) {
        console.log("testFileOut does exist")
        fs.unlinkSync(testFileOut);   
    }
};

const verifyFiles = (done) => {
    fs.readFile(testFileIn, 'utf8', function(errIn, contentsIn) {
        fs.readFile(testFileOut, 'utf8', function(errOut, contentsOut) {
            if (!errOut) {
                if (contentsIn !== undefined && contentsOut !== undefined && contentsIn.trim() === contentsOut.trim()) {
                    done();
                }
            }
        });
    });
};

const defaultOptions = (done) => ({
    persistent: false,
    what: 'test/',
    ignore: null,
    extension: '.es6',
    createOutPath: (inPath) => (inPath.replace(/-in.es6$/, '-out.js')),
    transform: (inPath, outPath) => {
        const command = [
            `echo $(cat ${inPath}) > ${outPath}`
        ].join(' && ');
        return command;
    },
    transformed: () => verifyFiles(done)
});

const prepareInputFile = (filePath, content) => {
    const writeStream = fs.createWriteStream(filePath);
    writeStream.write(content);
    writeStream.end();
};

describe("Transpile watch", function() {
    before(function() {
        cleanupTestFiles();
    });

    after(function() {
        cleanupTestFiles();
    });

    describe("Transpile single file", function() {
        it("Call once", function(done) {
            prepareInputFile(testFileIn, 'var list = [0,1];');
            watch(defaultOptions(done))
        });

        it("Call once, custom event", function(done) {
            prepareInputFile(testFileIn, 'var value = "great";');
            watch(Object.assign(
                {},
                defaultOptions(done),
                {
                    events: ['init']
                }
            ));
        });

        it("Persistent", function(done) {
            this.timeout(10000);
            prepareInputFile(testFileIn, 'var a = 0;');
            const chokidarWatcher = watch(Object.assign(
                {},
                defaultOptions(null),
                {
                    persistent: true,
                    transformed: null
                }
            ));
            setTimeout(() => {
                touch(testFileIn);
            }, 2000);
            setTimeout(() => {
                console.log("setTimeout last")
                chokidarWatcher.close();
                verifyFiles(done)
            }, 5000);
        });
    });
});

