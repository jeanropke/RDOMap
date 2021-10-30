Object.defineProperty(Date.prototype, 'toISOUTCDateString', {
  value: function () {
    return this.toISOString().split('T')[0];
  },
});

class Loader {
  static init(urls) {
    this.urls = new Map();
    this.promises = {};
    urls.forEach(url => {
        const name = url.split('/').filter(e => e).pop().split('.', 1)[0];
        this.promises[name] = new Loader(name, url);
        this.urls.set(name, url);
    });

    /*
    Similar to DOMContentLoaded: to be fired once cycles, items, collections, treasures, ...
    are loaded and initialized. Can be used for final view updates which depend on data.
    This promise is driven by the promises of all loaders and init functions providing data
    for the map model. – Use like:
    Loader.mapModelLoaded.then(callback);
    */
    this.mapModelLoaded = new Promise(resolve => this.resolveMapModelLoaded = resolve);
  }
  constructor(name, url, customNoCache = null) {
    const queryString = {};

    if (['updates'].includes(name)) queryString.nocache = Date.now();
    else if (['fme'].includes(name)) queryString.nocache = Math.floor(Date.now() / 10000);
    else if (!url.startsWith('http')) queryString.nocache = customNoCache || nocache;
    else queryString.nocache = customNoCache || new Date(Date.now() - 21600000).toISOUTCDateString();

    if (['lang_progress'].includes(name)) queryString.date = customNoCache || new Date().toISOUTCDateString();

    this._json = $.getJSON(url, queryString);
  }
  // allow garbage collection of loaded data after use
  consumeJson(...args) {
    const json = this._json;
    delete this._json;
    return json.then(...args);
  }
  static reloadData(name) {
    delete this.promises[name];
    this.promises[name] = new Loader(name, this.urls.get(name), Date.now());
  }
}

const urls = [
  'data/lang_progress.json',
  'data/animal_legendary.json',
  'data/animal_spawns.json',
  'data/camps.json',
  'data/fme_condor_egg.json',
  'data/fme_salvage.json',
  'data/discoverables.json',
  'data/encounters.json',
  'data/fasttravels.json',
  'data/gfh.json',
  'data/hm.json',
  'data/items.json',
  'data/overlays_beta.json',
  'data/overlays.json',
  'data/plants.json',
  'data/possible_dailies.json',
  'data/shops.json',
  'data/treasures.json',
  'data/bounties.json',
  'https://pepegapi.jeanropke.net/v3/rdo/dailies',
  'https://pepegapi.jeanropke.net/v2/rdo/nazar',
  'https://api.rdo.gg/fme/',
  'data/fme_keys.json',
];
Loader.init(urls);
