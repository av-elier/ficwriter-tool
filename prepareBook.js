

// let freq = require('./freq.js');
const mystem = require('./mystem/mystem.js');
const csv = require('fast-csv');
const fs = require('fs');

let mystemPromise = Promise.resolve();
let mystemBuffer = [];
let wordsBookWeights = {};
let wordsBookWeightsMystemed = {};

function weightsToSorted(weights) {
    return Object.keys(weights).sort((a, b) => weights[b] - weights[a]);
}

function loadFullFile(path) {
    console.log('loadFullFile');
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err != null) reject(err);
            else resolve(data.toString());
        });
    })
}

function countWords(book) {
    console.log('countWords');
    let wordsCount = {};
    book.split(/[^а-яёА-ЯЁ]/)
        .filter(w => w !== '' && w != null)
        .forEach(w => wordsCount[w] = (wordsCount[w] || 0) + 1)
    return wordsCount;
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
        if (mystemBuffer.length < 2000 && i < wordsArr.length - 1) continue;
        let mystemBufferCurrent = mystemBuffer;
        mystemBuffer = [];
        mystemPromise = mystemPromise.then(() => {
            return new Promise((resolve, reject) => {
                console.log(`mystemWordsCount, another ${mystemBufferCurrent.length} words`);
                mystem.list2(mystemBufferCurrent, function(mystemedWords) {
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

function saveMystemedWordsCount(mystemWordsCount, path) {
    console.log(`saveMystemedWordsCount(${mystemWordsCount}, ${path})`);
    return new Promise((resolve, reject) => {
        const wordsBookSorted = weightsToSorted(mystemWordsCount);
        const wordsCsv = wordsBookSorted.map((w, i) => `${w},${mystemWordsCount[w]}`).join('\n');
        fs.writeFile(path, wordsCsv, () => {
            resolve({
                mystemWordsCount: mystemWordsCount,
                wordsBookSorted: wordsBookSorted,
                wordsCsv: wordsCsv,
            });
        });
    });
}

module.exports = {
    prepare: function(pathIn, pathOut) {
        return loadFullFile(pathIn)
            .then(countWords)
            .then(mystemWordsCount)
            .then((mwc) => saveMystemedWordsCount(mwc, pathOut));
    }
};
