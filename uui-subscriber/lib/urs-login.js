'use strict';
var requests = require('request-promise-native');

// Imitates a browser - based login into URS
module.exports.login = function(params) {
  var cookiejar = requests.jar();
  var URS_OAUTH_URL = params.baseUrl.replace(/\/+$/, '') + '/oauth/authorize?response_type=code&redirect_uri=' + encodeURIComponent(params.redirectUri) + '&client_id=' + params.clientId;
  var URS_LOGIN_URL = params.baseUrl.replace(/\/+$/, '') + '/login';
  return Promise.resolve()
    .then(res => {
      return requests({
        url: URS_OAUTH_URL,
        jar: cookiejar
      });
    })
    .then(res => {
      const token = res.match(/name\=\"authenticity\_token\"\s+value\=\"(.*?)\"/)[1]; // Find CSRF token in the form
      let requestParams = {
        url: URS_LOGIN_URL,
        headers: params.headers,
        jar: cookiejar,
        followAllRedirects: true,
        gzip: true,
        form: {
          'utf8': '✓',
          'authenticity_token': token,
          'username': params.user,
          'password': params.password,
          'client_id': params.clientId,
          'redirect_uri': params.redirectUri,
          'response_type': 'code',
          'state': null,
          'stay_in': 1,
          'commit': 'Log+in'
        }
      }
      
      return requests.post(requestParams);
    })
    .then(res => {
      return cookiejar;
    });
}
