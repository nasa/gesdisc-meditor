var requests = require('request-promise-native');

var UUI_APP_URL =  (process.env.UUI_APP_URL_OPS || 'http://localhost:9000').replace(/\/+$/, '');
var UUI_HEADERS = { // A minimal viable set of UUI headeres
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json;charset=utf-8'
};

// Retrieves a list of dataset IDs from UUI
function fetchDatasets() {
    return new Promise((resolve) => {
        resolve(['fake', 'tags'])
    })
};

// Retrieves a list of keywords from UUI
function fetchKeywords() {
    return new Promise((resolve) => {
        resolve(['fake', 'tags'])
    })
};

module.exports.getFetchers = function() {
    return {
        tags: fetchKeywords,
        datasets: fetchDatasets
    };
};