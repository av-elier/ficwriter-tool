Array.prototype.flatMap = function(lambda) {
    return Array.prototype.concat.apply([], this.map(lambda));
};

const ipc = require('electron').ipcRenderer;

const colorsys = require('colorsys');

var fictext = document.getElementById('fictext');
var ficcolored = document.getElementById('ficcolored');

let mystem = require(__dirname + '\\mystem\\mystem.js');

let freq = require(__dirname + '\\freq.js');

function freqColor(word) {
    let weightInAll = freq.all[word.toLowerCase()];

    let weightInMaks = freq.maks[word.toLowerCase()];
    let weightInOluhi = freq.oluhi[word.toLowerCase()];

    if (weightInAll == null)
        weightInAll = 0;
    if (weightInMaks == null)
        weightInMaks = 0;
    if (weightInOluhi == null)
        weightInOluhi = 0;

    const rgb = {
        r: Math.round(Math.pow(weightInAll, 1/20) * 200),
        g: Math.round(Math.pow(weightInMaks, 1/20) * 200),
        b: Math.round(Math.pow(weightInOluhi, 1/20) * 200),
    }
    let hsv = colorsys.rgb_to_hsv(rgb)[0];
    hsv.s = Math.round(Math.pow(hsv.s / 100, 1/2) * 100);
    return colorsys.hsv_to_hex(hsv);
}


var i = 0;
function colorizeWord(word, base) {
    if (!base) return word;
    let c = freqColor(base);
    return `<span style="color: ${c};">${word}</span>`
}
let lastSyncId = 0;
function syncColored() {
    const path = require('path');

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

