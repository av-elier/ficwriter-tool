const exec = require('child_process').exec;

let mystem = function(sentence, cb) {
    var proc = exec('.\\mystem\\mystem.exe -n')

    var list = [];
    proc.stdin.setEncoding('utf8');
    proc.stdout.setEncoding('utf8');

    proc.stdin.write(sentence, () => {
        proc.stdin.end();
    });

    proc.stdout.on('data', function (chunk) {
        list.push(chunk);
    });

    proc.stdout.on('end', function () {
        let mainGuesses = {};
        let wordsAndBase = list.join('\n')
            .split('\n')
            .filter(r => r !== '')
            .map(r => /^([\wа-яА-ЯёЁ]+)\{([\wа-яА-ЯёЁ]+)[^\w]/.exec(r))
            .filter(r => r != null);

        for (var i = 0; i < wordsAndBase.length; i++) {
            var wnb = wordsAndBase[i];
            mainGuesses[wnb[1]] = wnb[2];
        }

        cb(mainGuesses);
    });
};

module.exports = {
    single: (word, cb) => mystem(word, (x) => cb(x[word])),
    list: (words, cb) => mystem(words.join('.\n'), cb),
    raw: (sencence, cb) => mystem(sencence, cb),
};
