import fs from 'fs';
import stringHash from 'string-hash';
import { fetchJSON } from './http';

// export const STATES = [12,27,13,16,29,23,53,32,52,21,31,50,51,15,25,26,22,41,33,24,11,14,43,42,28,35,17];
export const STATES = [29];

const readFile = path => {
  try {
    const file = fs.readFileSync(path, 'utf8');

    return JSON.parse(file);
  } catch (error) {
    return;
  }
};

export const writeToFile = (name, data) => fs.writeFile(name, JSON.stringify(data), () => { });

export const fmtApiUrl = (uf, {start, end}, page = 1, pagination = 2000) => {
  const domain = 'https://queimadas.dgi.inpe.br/queimadas/sisam/v2/api/variaveis?';
  const date = `inicio=${start}&final=${end}`;
  const state = `uf=${uf}&municipios=-1`;
  const variables = `horarios=0&horarios=6&horarios=12&horarios=18&variaveis=conc_co&variaveis=conc_o3&variaveis=conc_no2&variaveis=conc_so2&variaveis=conc_pm&variaveis=vento&variaveis=temp_ar&variaveis=umid_ar&variaveis=prec&variaveis=num_focos&per_page=${pagination}&page=${page}`;

  return `${domain}${state}&${variables}&${date}`;
};

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
