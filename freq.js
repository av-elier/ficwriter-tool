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

let wordsAllWeights = {};
let wordsAllRelWeights = {};
csv.fromPath(__dirname + "\\freq\\freqrnc2011.csv", {delimiter: '\t'})
    .on("data", function(data){
        wordsAllWeights[data[0]] = Number(data[2]);
    })
    .on("end", function(){
        wordsAllRelWeights = weightsToRelWeights(wordsAllWeights); // TODO: mystem
    });

function loadBookWords(path) {
    let weights = {};
    console.debug(`loadBookWords(${path})`);
    return new Promise((resolve, reject) => {
        csv.fromPath(path, {delimiter: ','})
            .on("data", function(data){
                weights[data[0]] = Number(data[1]);
            })
            .on("end", function(){
                const relWeights = weightsToRelWeights(weights);
                console.debug(`loadBookWords(${path}) END`);
                resolve(relWeights);
            });
    });
}


let maks = {};
loadBookWords(__dirname + "\\freq\\Maks.csv")
    .then((relW) => Object.keys(relW).forEach(k => maks[k] = relW[k]));

let oluhi = {};
loadBookWords(__dirname + "\\freq\\oluhi.csv")
    .then((relW) => Object.keys(relW).forEach(k => oluhi[k] = relW[k]));

freq = {
    all: wordsAllRelWeights,
    maks: maks,
    oluhi: oluhi,
    load: loadBookWords,
};

module.exports = freq;
