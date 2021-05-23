import fs from 'fs';
import config from './states.json';

export const readFile = path => {
  try {
    const file = fs.readFileSync(path, 'utf8');

    return JSON.parse(file);
  } catch (error) {
    return;
  }
};

export const fmtStates = () => {
  const statesFromEnv = process.env.states?.split(',');
  const statesFromConfig = Object.keys(config);

  return statesFromEnv || statesFromConfig;
};

export const fmtPeriod = () => {
  const { start, end, year } = process.env;
  const formattedYear = year?.split(',');
  const years = formattedYear ? [].concat(formattedYear) : undefined;

  if (years) {
    return years.map(year => ({ start: `01/01/${year}`, end: `31/12/${year}` }));
  }

  return [{ start, end }];
};

export const writeToFile = (name, data) => fs.writeFileSync(name, JSON.stringify(data));

export const fmtApiUrl = (uf, {start, end}, page = 1, pagination = 2000) => {
  const domain = 'https://queimadas.dgi.inpe.br/queimadas/sisam/v2/api/variaveis?';
  const date = `inicio=${start}&final=${end}`;
  const state = `uf=${uf}&municipios=-1`;
  const variables = `horarios=0&horarios=6&horarios=12&horarios=18&variaveis=conc_co&variaveis=conc_o3&variaveis=conc_no2&variaveis=conc_so2&variaveis=conc_pm&variaveis=vento&variaveis=temp_ar&variaveis=umid_ar&variaveis=prec&variaveis=num_focos&per_page=${pagination}&page=${page}`;

  return `${domain}${state}&${variables}&${date}`;
};
