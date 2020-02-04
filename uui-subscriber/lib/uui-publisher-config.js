exports.UUI_APP_URL_FOR_PUBLISHED = process.env.UUI_APP_URL_OPS;
exports.UUI_APP_URL_FOR_TEST = process.env.UUI_APP_URL_TEST;

exports.DEBUG_URS_LOGIN = false;
// Meditor models supported in UUI
exports.PUBLISHABLE_MODELS = ['Alerts', 'Data-In-Action', 'Documents', 'FAQs', 'Glossary',
  'Howto', 'Images', 'New News', 'News', 'Publications', 'Tools', 'Data Release', 'Service Release'];

exports.SYNC_TARGETS = [{
  states: ['Published'],
  url: exports.UUI_APP_URL_FOR_PUBLISHED,
  baseline: 'OPS',
  action: 'put'
}, {
  states: ['Hidden'],
  url: exports.UUI_APP_URL_FOR_PUBLISHED,
  baseline: 'OPS',
  action: 'delete'
}, {
  states: ['Draft', 'Under Review'],
  url: exports.UUI_APP_URL_FOR_TEST,
  baseline: 'Test',
  action: 'put'
}];

// This parameter can be used to push from multiple mEditor models into a single model in UUI
exports.MEDITOR_MODEL_GROUPS = [
  {
    uuiModelName: 'news',
    meditorModelNames: ['News', 'New News'],
  },
  {
    uuiModelName: 'data-release',
    meditorModelNames: ['Data Release'],
  },
  {
    uuiModelName: 'service-release',
    meditorModelNames: ['Service Release'],
  },
];

exports.SYNC_MEDITOR_DOCS_ONLY = process.env.SYNC_MEDITOR_DOCS_ONLY || false; // Update only those items in UUI that originated from mEditor

exports.UUI_AUTH_CLIENT_ID = process.env.UUI_AUTH_CLIENT_ID;
exports.URS_USER = process.env.URS_USER;
exports.URS_PASSWORD = process.env.URS_PASSWORD;
exports.DEBUG_MODE = (typeof process.env.DEBUG_MODE_NOTIFIER === 'string' || process.env.DEBUG_MODE_NOTIFIER instanceof String) && process.env.DEBUG_MODE_NOTIFIER === 'true';


exports.URS_BASE_URL = 'https://urs.earthdata.nasa.gov';
exports.URS_HEADERS = { // A minimal viable set of URS headeres
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Content-Type': 'application/x-www-form-urlencoded'
  // 'Host': 'urs.earthdata.nasa.gov',
  // 'Connection': 'keep-alive',
  // 'Content-Length': 336,
  // 'Pragma': 'no-cache',
  // 'Cache-Control': 'no-cache',
  // 'Origin': 'https://urs.earthdata.nasa.gov',
  // 'Upgrade-Insecure-Requests': 1,
  // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
  // 'Referer': 'https://urs.earthdata.nasa.gov/oauth/authorize?response_type=code&redirect_uri=' + encodeURIComponent(UUI_APP_URL) + '%2Flogin%2Fcallback&client_id=' + UUI_AUTH_CLIENT_ID,
  // 'Accept-Language': 'en-US,en;q=0.9'
}

exports.UUI_HEADERS = { // A minimal viable set of UUI headeres
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept': 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=utf-8'
  //'Pragma': 'no-cache',
  // 'Accept-Language': 'en-US,en;q=0.9',
  // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.170 Safari/537.36',
  //'Referer': UUI_APP_URL + '/',
  //'DNT': '1',
  // 'Connection': 'keep-alive',
  // 'Cache-Control': 'no-cache'
}
