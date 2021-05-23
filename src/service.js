import stringHash from 'string-hash';
import ProgressBar from 'cli-progress';
import { fetchJSON } from './http';
import config from './states.json';
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
  const stateSlug = config[state].slug; 

  const opt = {
    format: `Downloading: [{bar}] {percentage}% |[${stateSlug}]  ${period.start} - ${period.end} | pages: {value}/{total}`,
  }
  const progressUI = new ProgressBar.SingleBar(opt, ProgressBar.Presets.shades_classic);
  progressUI.start(listOfPages.length, 0);

  const result = await Promise.all(listOfPages.map((_, index) => {
    const current = index + 1;
    const url = fmtApiUrl(state, period, current);

    return fetchSisamApi(url).then(data => {
      progressUI.increment();

      return data;
    });
  }));

  progressUI.stop();

  return result;
};

export const scrapSisamData = async () => {
  const states = fmtStates();
  const period = fmtPeriod();
  
  period.map(period => states.map(state => getDataFromState(state, period)));
}
