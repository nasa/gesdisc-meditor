var requests = require('request-promise-native');

var UUI_APP_URL =  (process.env.UUI_APP_URL_OPS || 'http://localhost:9000').replace(/\/+$/, '');
var UUI_HEADERS = { // A minimal viable set of UUI headeres
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json;charset=utf-8'
};

// Retrieves a list of dataset IDs from UUI
function fetchDatasets() {
    // Note: can also fetch/transform from here https://cmr.earthdata.nasa.gov/search/collections.umm-json?provider=ges_disc&pretty=true&page_size=2000
    return requests.post({
        url: UUI_APP_URL + '/service/datasets/jsonwsp',
        headers: UUI_HEADERS,
        followAllRedirects: true,
        gzip: true,
        json: true,
        body: {"methodname":"search","args":{"role":"subset","fields":["dataset.id"]},"type":"jsonwsp/request","version":"1.0"}
    })
    .then(function(res) {
        return res.result.items.map(item => item.dataset.id);
    })
    .catch(function(e) {
        console.log('Error while trying to fetch UUI datasets from ', UUI_APP_URL + '/service/datasets/jsonwsp', ':', e.message);
        return ['Failed to fetch the list'];
    });;
};

// Retrieves a list of keywords from UUI
function fetchKeywords() {
    return requests.post({
        url: UUI_APP_URL + '/service/keywords/jsonwsp',
        headers: UUI_HEADERS,
        followAllRedirects: true,
        gzip: true,
        json: true,
        body: {"methodname": "getKeywords", "args":{"role":"subset"},"type":"jsonwsp/request","version":"1.0"}
    })
    .then(function(res) {
        return res.result.items;
    })
    .catch(function(e) {
        console.log('Error while trying to fetch UUI keywords from ', UUI_APP_URL + '/service/datasets/jsonwsp', ':', e.message);
        return ['Failed to fetch the list'];
    });
};

module.exports.getFetchers = function() {
    return {
        tags: fetchKeywords,
        datasets: fetchDatasets
    };
};