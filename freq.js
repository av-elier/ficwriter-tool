var csv = require('fast-csv');

function weightsToSorted(weights) {
    return Object.keys(weights).sort((a, b) => weights[b] - weights[a]);
}

function weightsToRelWeights(weights) {
    const sorted = weightsToSorted(weights);
    const heaviest = weights[sorted[0]];
    let relWeights = {};
    sorted.forEach((w) => relWeights[w] = weights[w] / heaviest);
    return relWeights;
}

function loadCsvWords(path) {
    let weights = {};
    console.debug(`loadCsvWords(${path})`);
    return new Promise((resolve, reject) => {
        csv.fromPath(path, {delimiter: ','})
            .on("data", function(data){
                weights[data[0]] = Number(data[1]);
            })
            .on("end", function(){
                const relWeights = weightsToRelWeights(weights);
                console.debug(`loadCsvWords(${path}) END`);
                resolve(relWeights);
            });
    });
}


let wordsAll = {};
loadCsvWords(__dirname + "\\freq\\freqrnc2011_mystemed.csv")
    .then((relW) => Object.keys(relW).forEach(k => wordsAll[k] = relW[k]));

let maks = {};
loadCsvWords(__dirname + "\\freq\\Maks.csv")
    .then((relW) => Object.keys(relW).forEach(k => maks[k] = relW[k]));

let oluhi = {};
loadCsvWords(__dirname + "\\freq\\oluhi.csv")
    .then((relW) => Object.keys(relW).forEach(k => oluhi[k] = relW[k]));

freq = {
    all: wordsAll,
    maks: maks,
    oluhi: oluhi,
    load: loadCsvWords,
};

module.exports = freq;
