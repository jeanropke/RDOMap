console.log('Welcome!');

/** @type {Object[]} The collection of sites that will be used for screenshotting. */
let sites = [];

// Imports, yada yada, boring.
const ProgressBar = require('progress');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Here we see my laziness, instead of finding the file on my FS, I just launch a local server and download them.
function downloadFileSync(url) {
  return require('child_process').execFileSync('curl', ['--silent', '-L', url], { encoding: 'utf8' });
}

// Set up the URL bases.
const mapOneBase = 'http://localhost/?z=4&ft=-75,110';
const mapTwoBase = 'http://localhost/rdo/?z=4&ft=-75,110&c=red';

/**
 * COLLECTOR ITEMS
 * Get all categories and items for each cycle in the items.json file.
 * If an item has 1 location on the map, make it a short image to be clearer.
 */
let collectorItems = downloadFileSync('http://localhost/data/items.json');
collectorItems = JSON.parse(collectorItems);

Object.keys(collectorItems).forEach(k => {
  const category = collectorItems[k];
  Object.keys(category).forEach(ck => {
    // Category items.
    sites.push({
      name: `${k}_${ck}`,
      type: 'long',
      url: `${mapOneBase}&q=${k}&cycles=${ck}`,
    });

    // Individual items.
    const items = collectorItems[k][ck];
    items.forEach(item => {
      if (item.text.includes('random')) return;
      if (item.text.match(/_[0-9]$/)) {
        const name = item.text.replace(/_[0-9]$/, '');
        if (sites.some(s => s.name === `${name}_${ck}`)) return;

        sites.push({
          name: `${name}_${ck}`,
          type: 'long',
          url: `${mapOneBase}&q=${name}&cycles=${ck}`,
        });
      } else {
        sites.push({
          name: `${item.text}_${ck}`,
          type: 'short',
          url: `${mapOneBase}&q=${item.text}&cycles=${ck}`,
        });
      }
    });
  });
});

/**
 * ANIMAL ITEMS
 * Will add each animal heatmap to the list of sites, they are always long images.
 */
let animalItems = downloadFileSync('http://localhost/rdo/data/hm.json');
animalItems = JSON.parse(animalItems);

animalItems.forEach(category => {
  category.data.forEach(animal => {
    sites.push({
      name: animal.key,
      type: 'long',
      url: `${mapTwoBase}&q=${animal.key}`,
    });
  });
});

/**
 * ENCOUNTER ITEMS
 * Will add encounters to the list, while there isn't a single location encounter for now,
 * check it just to be safe and to be future-proof.
 */
let encounterItems = downloadFileSync('http://localhost/rdo/data/encounters.json');
encounterItems = JSON.parse(encounterItems);

encounterItems.forEach(item => {
  sites.push({
    name: item.key,
    type: item.locations.length !== 1 ? 'long' : 'short',
    url: `${mapTwoBase}&q=${item.key}`,
  });
});

/**
 * CAMP ITEMS
 * Will add camps to the list, while there isn't a single location camp for now,
 * check it just to be safe and to be future-proof.
 */
let campItems = downloadFileSync('http://localhost/rdo/data/camps.json');
campItems = JSON.parse(campItems);

campItems.forEach(item => {
  sites.push({
    name: item.key,
    type: item.locations.length !== 1 ? 'long' : 'short',
    url: `${mapTwoBase}&q=${item.key}`,
  });
});

/**
 * MISC ITEMS
 * Will add misc items to the list, while there isn't a single location for now,
 * check it just to be safe and to be future-proof.
 */
let miscItems = downloadFileSync('http://localhost/rdo/data/items.json');
miscItems = JSON.parse(miscItems);

miscItems.forEach(item => {
  sites.push({
    name: item.key,
    type: item.locations.length !== 1 ? 'long' : 'short',
    url: `${mapTwoBase}&q=${item.key}`,
  });
});

/**
 * ENCOUNTER ITEMS
 * Will add plants to the list, while there isn't a single location plant for now,
 * check it just to be safe and to be future-proof.
 */
let plantItems = downloadFileSync('http://localhost/rdo/data/plants.json');
plantItems = JSON.parse(plantItems);

plantItems.forEach(item => {
  sites.push({
    name: item.key,
    type: item.locations.length !== 1 ? 'long' : 'short',
    url: `${mapTwoBase}&q=${item.key}`,
  });
});

/**
 * SHOP ITEMS
 * Will add shops to the list, tackle has only one location, so check for it.
 */
let shopItems = downloadFileSync('http://localhost/rdo/data/shops.json');
shopItems = JSON.parse(shopItems);

shopItems.forEach(item => {
  sites.push({
    name: item.key,
    type: item.locations.length !== 1 ? 'long' : 'short',
    url: `${mapTwoBase}&q=${item.key}`,
  });
});

/**
 * TREASURE ITEMS
 * Treasures will always be zoomed in on the map, so they are always short images.
 */
let treasureItems = downloadFileSync('http://localhost/rdo/data/treasures.json');
treasureItems = JSON.parse(treasureItems);

treasureItems.forEach(item => {
  sites.push({
    name: item.text,
    type: 'short',
    url: `${mapTwoBase}&q=${item.text}`,
  });
});

/**
 * GUN FOR HIRE ITEMS
 * Will add gfh to the list, certain gfhs have only 1 location, so check for it.
 */
let gfhItems = downloadFileSync('http://localhost/rdo/data/gfh.json');
gfhItems = JSON.parse(gfhItems);

gfhItems.forEach(item => {
  sites.push({
    name: item.key,
    type: item.locations.length !== 1 ? 'long' : 'short',
    url: `${mapTwoBase}&q=${item.key}`,
  });
});

/**
 * LEGENDARY ANIMALS ITEMS
 * Legendaries will always be zoomed in on the map, so they are always short images.
 */
let legendaryItems = downloadFileSync('http://localhost/rdo/data/animal_legendary.json');
legendaryItems = JSON.parse(legendaryItems);

legendaryItems.forEach(item => {
  sites.push({
    name: item.text,
    type: 'short',
    url: `${mapTwoBase}&q=${item.text}`,
  });
});

sites.sort((a, b) => (a.name > b.name) ? 1 : -1);

/** @type {ProgressBar} The ProgressBar instance to use for displaying the progress bar in console. */
const bar = new ProgressBar('[:bar] :current/:total (:percent)', {
  complete: '=',
  incomplete: ' ',
  total: sites.length,
  width: 80,
});

/**
 * Use Puppeteer to create a 4K-resolution image of a certain item.
 * @param {string} url The URL to screenshot.
 * @param {string} siteType Used to determine the folder the image will be created in.
 * @param {string} siteName Used to determine the name of the image.
 */
async function doScreenCapture(url, siteType, siteName) {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 3840,
      height: 2160,
    },
  });
  const page = await browser.newPage();
  const writeDir = path.join(__dirname, `_${siteType}`);
  const fileDir = path.join(writeDir, `${siteName}.jpg`);

  if (!fs.existsSync(writeDir)) fs.mkdirSync(writeDir);

  await page.goto(url, {
    waitUntil: 'networkidle2',
  });
  await page.screenshot({
    fullPage: true,
    type: 'jpeg',
    quality: 100,
    path: fileDir,
  });
  await browser.close();
}

const valid = sites.map(i => i.name);
const data = JSON.stringify(valid, null, 2);
fs.writeFileSync('manifest.json', data);

/**
 * The main thread logic. This spawns 8 instances of screenshotting at a time to speed up the process.
 * TODO: Clean this up at some point, no rush.
 */
async function run() {
  for (var i = 0; i < sites.length; i++) {
    let p1 = sites[i] ? doScreenCapture(sites[i].url, sites[i].type, sites[i].name) : () => { };
    i++;
    let p2 = sites[i] ? doScreenCapture(sites[i].url, sites[i].type, sites[i].name) : () => { };
    i++;
    let p3 = sites[i] ? doScreenCapture(sites[i].url, sites[i].type, sites[i].name) : () => { };
    i++;
    let p4 = sites[i] ? doScreenCapture(sites[i].url, sites[i].type, sites[i].name) : () => { };
    i++;
    let p5 = sites[i] ? doScreenCapture(sites[i].url, sites[i].type, sites[i].name) : () => { };
    i++;
    let p6 = sites[i] ? doScreenCapture(sites[i].url, sites[i].type, sites[i].name) : () => { };
    i++;
    let p7 = sites[i] ? doScreenCapture(sites[i].url, sites[i].type, sites[i].name) : () => { };
    i++;
    let p8 = sites[i] ? doScreenCapture(sites[i].url, sites[i].type, sites[i].name) : () => { };

    await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8]);
    bar.tick(8);
    if (bar.complete) {
      console.log('\nDone!\n');
    }
  }
}

console.log('Starting the screenshotting process...');
run();
