Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};

var ipc = require('electron').ipcRenderer;

var fictext = document.getElementById('fictext');
var ficcolored = document.getElementById('ficcolored');

let mystem = require(__dirname + '\\mystem\\mystem.js');

let freq = require(__dirname + '\\freq.js');

function freqColor(word) {
    let posInAll = freq.all.indexOf(word.toLowerCase());
    let posInBook = freq.book.indexOf(word.toLowerCase());

    if (posInBook == -1)
        posInBook = freq.book.length;
    if (posInAll == -1)
        posInAll = freq.all.length;

    let posInBookRel = posInBook / freq.book.length;
    let posInAllRel = posInAll / freq.all.length;
    return {
        r: 200 - Math.round(posInAllRel * 200),
        g: 200 - Math.round(posInBookRel * 200),
        b: 0,
    }
}


var i = 0;
function colorizeWord(word, base) {
    if (!base) return word;
    let c = freqColor(base);
    return `<span style="color: rgb(${c.r},${c.g},${c.b});">${word}</span>`
}
let lastSyncId = 0;
function syncColored() {
    const path = require('path');
    ficcolored.innerHTML = path.resolve('.') + '\n' + path.resolve('mystem/mystem.exe');

    const allWords = fictext.value
        .split('\n')
        .flatMap(line => {
            let res = line.split(' ');
            res[res.length - 1] += '\n';
            return res;
        });
    lastSyncId = lastSyncId + 1;
    let currentSyncId = lastSyncId;
    mystem.list(allWords.map(w => (/[а-яёА-ЯЁ]+/.exec(w)||[])[0]), (mainGuesses) => {
        if (currentSyncId !== lastSyncId) return;
        let colorizedHtml = allWords
            .map(word => colorizeWord(word, mainGuesses[(/[а-яёА-ЯЁ]+/.exec(word)||[])[0]]))
            .join(' ')
            .split('\n').join('<br>')

        ficcolored.innerHTML = colorizedHtml
    })

}

fictext.addEventListener('keyup', syncColored);
fictext.addEventListener('change', syncColored);

