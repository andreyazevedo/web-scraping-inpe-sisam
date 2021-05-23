import stringHash from 'string-hash';
import { fetchJSON } from './http';
import { fmtStates, fmtPeriod, readFile, fmtApiUrl, writeToFile } from './helpers';

export const fetchSisamApi = async url => {
  const urlHash = stringHash(url);
  const path = `cache/${urlHash}.json`;
  const file = readFile(path);

  if (file) {
    return {...file, fromCache: true};
  }

  const data = await fetchJSON(url);

  if (!data.error) {
    writeToFile(path, data);
  }

  return data;
}

const getDataFromState = async (state, period) => {
  const url = fmtApiUrl(state, period);  
  const firstPage = await fetchSisamApi(url);
  const { pages } = firstPage;
  const listOfPages = Array.from(Array(pages).keys());

  return Promise.all(listOfPages.map((_, index) => {
    const current = index + 1;
    const url = fmtApiUrl(state, period, current);
    console.log(`>>> start request: state: ${state}, page: ${current}`);
    return fetchSisamApi(url).then(data => {
      const fromCache = data.fromCache;
      const status = data.error ? `FAILED - ${url}` : 'SUCCESS';

      if (!fromCache) {
        console.log(`>>> end request: state: ${state}, page: ${current} - ${status}`);
      }

      return data;
    });
  }));
};

export const scrapSisamData = async () => {
  const states = fmtStates();
  const period = fmtPeriod();
  
  period.map(period => states.map(state => getDataFromState(state, period)));
}
