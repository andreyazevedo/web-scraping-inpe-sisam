const fetch = require('node-fetch-with-proxy');

const fetchJSON = (url, withHeaders = false) => fetch(url).then(response => {
  const json = response.json();

  if (withHeaders) {
    return json.then(data => Object.assign({ data }, { headers: response.headers }));
  }

  return json;
}).catch(err => ({ url, error: true }));

const fetchHTML = url => fetch(url).then(response => {
  const text = response.text();

  return text;
}).catch(err => ([{ error: true }]));

module.exports = {
  fetchJSON,
  fetchHTML
};
