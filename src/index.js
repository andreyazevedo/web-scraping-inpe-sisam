import { scrapSisamData, setFolders } from './service';

const main = () => {
  setFolders();
  scrapSisamData();
};

main();
