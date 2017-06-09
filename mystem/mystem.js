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
            .map(l => /^([\wа-яА-ЯёЁ]+)\{([\wа-яА-ЯёЁ]+)[^\w]/.exec(l)[2]);
        console.assert(mystemList.length === inpList.length, `(${mystemList.length} !== ${inpList.length}\n`
            + JSON.stringify(mystemList) + '\n' + JSON.stringify(inpList));
        cb(mystemList);
    });
}

module.exports = {
    single: (word, cb) => mystem(word, (x) => cb(x[word])),
    list: (words, cb) => mystem(words.join('\n'), cb),
    raw: (sencence, cb) => mystem(sencence, cb),
    list2: (words, cb) => mystemList2(words, cb),
};
