const watch = require('../lib/transpile-watch');
const fs = require('fs');
const touch = require('touch');

const testFileIn = './test/test-file-in.es6';
const testFileOut = './test/test-file-out.js';

const doesExist = (filePath) => {
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
        fs.unlinkSync(testFileIn);   
    }
    if (doesExist(testFileOut)) {
        fs.unlinkSync(testFileOut);   
    }
};

const verifyFiles = (done) => {
    fs.readFile(testFileIn, 'utf8', function(errIn, contentsIn) {
        fs.readFile(testFileOut, 'utf8', function(errOut, contentsOut) {
            console.log("contents in : ", contentsIn)
            console.log("contents out: ", contentsOut)
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
                events: ['ready', 'change']
            }
        ));
    });

    it("Persistent", function(done) {
        prepareInputFile(testFileIn, 'var a = 0;');
        watch(Object.assign(
            {},
            defaultOptions(done),
            {
                persistent: true
            }
        ));
    });
});

