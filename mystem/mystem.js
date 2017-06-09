const exec = require('child_process').exec;


function execAndRead(inp, cb) {
    var proc = exec(__dirname + '\\mystem.exe -n')
    var list = [];
    proc.stdin.setEncoding('utf8');
    proc.stdout.setEncoding('utf8');

    proc.stdin.write(inp, () => {
        proc.stdin.end();
    });

    proc.stdout.on('data', function (chunk) {
        list.push(chunk);
    });

    proc.stdout.on('end', function () {
        cb(list.join('\n'));
    });
}

function mystem(sentence, cb) {
    execAndRead(sentence, function (lines) {
        let mainGuesses = {};
        let wordsAndBase = lines.split(/\r\n|\n/)
            .filter(r => r !== '')
            .map(r => /^([\wа-яА-ЯёЁ]+)\{([\wа-яА-ЯёЁ]+)[^\w]/.exec(r)) // there is a bug with более-менее being treated like более.
            .filter(r => r != null);

        for (var i = 0; i < wordsAndBase.length; i++) {
            var wnb = wordsAndBase[i];
            mainGuesses[wnb[1]] = wnb[2];
        }

        cb(mainGuesses);
    });
};

function mystemList2(inpList, cb) {
    execAndRead(inpList.join('\n'), function (lines) {
        let mystemList = lines.split('\n')
            .filter(l => l !== '')
            .map(l => /^([\wа-яА-ЯёЁ]+)\{([\wа-яА-ЯёЁ]+)[^\w]/.exec(l))
            .filter(r => r != null)
            .map(r => r[2]);
        console.assert(mystemList.length === inpList.length, `(${mystemList.length} !== ${inpList.length}\n`
            + JSON.stringify(mystemList) + '\n' + JSON.stringify(inpList));
        cb(mystemList);
    });
}

function mystemWordsCount(wordsCount) {
    console.log('mystemWordsCount');
    let mystemedWordsCount = {};
    let mystemBuffer = [];
    let mystemPromise = Promise.resolve();
    const wordsArr = Object.keys(wordsCount);
    for (var i = 0; i < wordsArr.length; i++) {
        var w = wordsArr[i];
        mystemBuffer.push(w);
        if (mystemBuffer.length < 5000 && i < wordsArr.length - 1) continue;
        let mystemBufferCurrent = mystemBuffer;
        mystemBuffer = [];
        mystemPromise = mystemPromise.then(() => {
            return new Promise((resolve, reject) => {
                console.log(`mystemWordsCount, another ${mystemBufferCurrent.length} words`);
                mystemList2(mystemBufferCurrent, function(mystemedWords) {
                    for (var j = 0; j < mystemBufferCurrent.length; j++) {
                        const w = mystemBufferCurrent[j];
                        const mw = mystemedWords[j];
                        mystemedWordsCount[mw] = (mystemedWordsCount[mw] || 0) + wordsCount[w];
                    }
                    resolve();
                });
            });
        });
    }
    return mystemPromise.then(() => mystemedWordsCount);
}

module.exports = {
    single: (word, cb) => mystem(word, (x) => cb(x[word])),
    list: (words, cb) => mystem(words.join('\n'), cb),
    raw: (sencence, cb) => mystem(sencence, cb),
    list2: (words, cb) => mystemList2(words, cb),
    mystemWordsCount: mystemWordsCount,
};
