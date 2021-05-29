import fs from 'fs';
import stringHash from 'string-hash';
import ProgressBar from 'cli-progress';
import { fetchJSON } from './http';
import config from './states.json';
import { fmtStates, fmtPeriod, readFile, fmtApiUrl, writeToFile } from './helpers';
import { pagesQueue, statesQueue } from './queues';

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
    format: `Downloading: [{bar}] {percentage}% | ${stateSlug} ${period.start} - ${period.end} | pages: {value}/{total}`,
  }
  const progressUI = new ProgressBar.SingleBar(opt, ProgressBar.Presets.shades_classic);
  progressUI.start(listOfPages.length, 0);

  const result = await pagesQueue.addAll(listOfPages.map((_, index) => () => {
    const current = index + 1;
    const url = fmtApiUrl(state, period, current);

    return fetchSisamApi(url).then(data => {
    progressUI.increment();

      return data;
    });
  }));

  progressUI.stop();

  const hasError = result.find(data => data.error);

  if (hasError) {
    return getDataFromState(state, period);
  }

  const slugPeriod = `${period.start.replaceAll('/', '-')}_${period.end.replaceAll('/', '-')}`;
  const stateUf = config[state].uf;
  const path = `dataset/${stateUf}_${slugPeriod}.json`;
  const dataset = result.map(page => page.items).flat();

  writeToFile(path, dataset);

  return result;
};

export const scrapSisamData = async () => {
  const states = fmtStates();
  const period = fmtPeriod();
  
  period.map(period => statesQueue.addAll(states.map(state => () => getDataFromState(state, period))));
}

export const setFolders = () => {
  const paths = ['cache', 'dataset'];

  return paths.map(path => {
    if (!fs.existsSync(path)){
      fs.mkdirSync(path);
    }
  });
}
