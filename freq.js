let mystem = require('./mystem/mystem.js');
var csv = require('fast-csv');

let wordsAllWeights = {};
let wordsAll = [];
let wordsAllSorted = [];
let wordsBook = [];

csv.fromPath("freq\\freqrnc2011.csv", {delimiter: '\t'})
    .on("data", function(data){
        wordsAllWeights[data[0]] = data[2];
        wordsAll.push(data[0]);
    })
    .on("end", function(){
        wordsAll = wordsAll.sort((a,b) => {
            return Number(wordsAllWeights[a]) < Number(wordsAllWeights[b])
        });
        wordsAll.forEach(function(word) {
            wordsAllSorted.push(word);
        }, this);
        console.log("done");
    });

csv.fromPath("freq\\Maks.csv", {delimiter: ','})
    .on("data", function(data){
        wordsBook.push(data[0]);
    })
    .on("end", function(){
        console.log("done");
    });



freq = {
    all: wordsAllSorted,
    book: wordsBook,
};

module.exports = freq;
