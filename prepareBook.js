

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

function loadWordCountFreqRNC2011(path) {
    return new Promise((resolve, reject) => {
        let wordsAllWeights = {};
        csv.fromPath(path, {delimiter: '\t'})
            .on("data", function(data){
                const weight = Number(data[2]);
                var parts = data[0].split(/[^а-яёА-ЯЁ]/)
                    .filter(w => w !== '' && w != null)
                parts.forEach(p => wordsAllWeights[p] = (wordsAllWeights[p] || 0) + weight / parts.length);
            })
            .on("end", function(){
                resolve(wordsAllWeights);
            });
    });
}

module.exports = {
    prepare: function(pathIn, pathOut) {
        return loadFullFile(pathIn)
            .then(countWords)
            .then(mystem.mystemWordsCount)
            .then((mwc) => saveMystemedWordsCount(mwc, pathOut));
    },
    prepareFreqRNC2011: function(pathIn, pathOut) {
        return loadWordCountFreqRNC2011(pathIn)
            .then(mystem.mystemWordsCount)
            .then((mwc) => saveMystemedWordsCount(mwc, pathOut));
    }
};
