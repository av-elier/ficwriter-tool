

// let freq = require('./freq.js');
const mystem = require('./mystem/mystem.js');
const csv = require('fast-csv');
const fs = require('fs');

let mystemPromise = Promise.resolve();
let mystemBuffer = [];
let wordsBookWeights = {};
let wordsBookWeightsMystemed = {};

function weightsToSorted(weights) {
    let wSorted = [];
    let weightsArray = Object.keys(weights);
    wSorted = weightsArray.sort((a,b) => {
        return Number(weightsArray[a]) < Number(weightsArray[b]);
    });
    return wSorted;
}

csv.fromPath("freq\\Maks.csv", {delimiter: ','}).on("data", function(data) {
        let wo = data[0];
        wordsBookWeights[wo] = Number(data[1]);
        console.assert(Number(data[1]) > 0)
        mystemBuffer.push(wo);
        if (mystemBuffer.length < 500 && data[0] !== '')
            return;
        console.log(`buffer of ${mystemBuffer.length} words pushed to mystem`)
        let words = mystemBuffer;
        mystemBuffer = [];

        mystemPromise = mystemPromise.then(() => new Promise((resolve) => {
            mystem.list(words, (mainGuesses) => {
                Object.keys(mainGuesses).forEach((w) => {
                    const g = mainGuesses[w];
                    wordsBookWeightsMystemed[g] = ( wordsBookWeightsMystemed[g] || 0 ) + Number(wordsBookWeights[w] || 0);
                })
                resolve();
            });
        }));
    }).on("end", function(){
        mystemPromise.then(() => {
            const wordsBookSorted = weightsToSorted(wordsBookWeightsMystemed);
            const wordsCsv = wordsBookSorted.map((w, i) => `${w},${wordsBookSorted.length - i}`).join('\n');
            fs.writeFileSync('maks_mystemed.cvs', wordsCsv);
        })
    });
