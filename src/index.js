import { fmtApiUrl, fetchSisamApi, STATES } from './helpers';
import ufSlug from './states.json';

const getDataFromState = async (state, year) => {
  const period = { start: `01/01/${year}`, end: `31/12/${year}` };
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

const main = async () => {
  const statesData = await Promise.all(STATES.map(async state => {
    const data = await getDataFromState(state, 2013);
    const total = data.length;
    const errors = data.filter(page => page.error);

    return { id: state, uf: ufSlug[state].uf, errors, total: data.length, success: total - errors.length };
  }));

  console.log('>>> result', statesData);
};

main();
