Object.defineProperty(String.prototype, 'filename', {
  value: function (extension) {
    let s = this.replace(/\\/g, '/');
    s = s.substring(s.lastIndexOf('/') + 1);
    return extension ? s.replace(/[?#].+$/, '') : s.split('.')[0];
  },
});

Object.defineProperty(String.prototype, 'includesOneOf', {
  value: function (...elements) {
    var include = false;
    for (var str of elements) {
      if (this.includes(str)) {
        include = true;
        break;
      }
    }
    return include;
  },
});

Object.defineProperty(Number.prototype, 'mod', {
  value: function (num) {
    return ((this % num) + num) % num;
  },
});


document.addEventListener('DOMContentLoaded', function() {
  try {
    init();
  } catch (e) {
    if (getParameterByName('show-alert') === '1') {
      alert(e);
    }
    console.error(e);
  }
});

function init() {
  try {
    Sentry.init({ release: nocache, tracesSampleRate: isLocalHost() ? 1 : 0.3 });
  } catch (err) {
    console.log(`Sentry: ${err}`);
  }

  const navLang = navigator.language;
  const langCodesMap = { 'zh-CN': 'zh-Hans', 'zh-SG': 'zh-Hans', 'zh-HK': 'zh-Hant', 'zh-TW': 'zh-Hant' };
  const mappedLanguage = langCodesMap[navLang] || navLang;
  SettingProxy.addSetting(Settings, 'language', {
    default: Language.availableLanguages.includes(mappedLanguage) ?
      mappedLanguage :
      'en',
  });

  if (['ja', 'ko', 'zh-Hans', 'zh-Hant'].includes(Settings.language))
    MapBase.setFallbackFonts();

  //Convert old settings if any
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('rdo:')) {
      localStorage.setItem(`rdo.${key.split(':')[1]}`, localStorage.getItem(key));
      localStorage.removeItem(key);
    }
    // Get rdr2collectors map legendary timers only when rdo keys does not exists
    // Do not enable legendary animals base on collectors map because it cause an issue that are always enabled on RDO map on load ;)
    else if (key.startsWith('rdr2collector:Legendaries_')) {
      let _key = `rdo.${key.split(':')[1]}`;
      if (localStorage.getItem(_key) == null)
        localStorage.setItem(_key, localStorage.getItem(key));
    } else if (key === 'lastDailiesDate') {
      localStorage.setItem('rdo.lastDailiesDate', localStorage.getItem('lastDailiesDate'));
      localStorage.removeItem('lastDailiesDate');
    }
  });

  Menu.init();
  MapBase.init();

  Language.init().then(() => {
    changeCursor();
    Pins.init();
    FME.init();

    // Prevent blocks by external services. Sometimes these requests took >6 seconds.
    // Bonus: If either of these fail to load, it doesn't block the map from working properly.
    Dailies.init();
    MadamNazar.init();

    const animals = AnimalCollection.init();
    const locations = Location.init();
    const encounters = Encounter.init();
    const treasures = Treasure.init();
    const bounties = BountyCollection.init();
    const fmeCondorEgg = CondorEgg.init();
    const fmeSalvage = Salvage.init();
    const plants = PlantsCollection.init();
    const camps = CampCollection.init();
    const shops = Shop.init();
    const singleplayer = Singleplayer.init();
    const gfh = GunForHire.init();
    const legendary = Legendary.init();
    const discoverables = Discoverable.init();
    const overlays = Overlay.init();

    return Promise.all([animals, locations, encounters, treasures, bounties, fmeCondorEgg, fmeSalvage, plants, camps, shops, gfh, legendary, discoverables, overlays, singleplayer]);
  }).then(() => {
    Loader.resolveMapModelLoaded();
    MapBase.afterLoad();
  });

  if (Settings.isMenuOpened)
    document.querySelector('.menu-toggle').click();

  document.getElementById('language').value = Settings.language;
  document.getElementById('marker-opacity').value = Settings.markerOpacity;
  document.getElementById('marker-size').value = Settings.markerSize;
  document.getElementById('marker-cluster').checked = Settings.isMarkerClusterEnabled;
  document.getElementById('tooltip').checked = Settings.showTooltips;
  document.getElementById('tooltip-map').checked = Settings.showTooltipsMap;
  document.getElementById('enable-marker-popups-hover').checked = Settings.isPopupsHoverEnabled;
  document.getElementById('enable-marker-shadows').checked = Settings.isShadowsEnabled;
  document.getElementById('enable-legendary-backgrounds').checked = Settings.isLaBgEnabled;
  document.getElementById('legendary-animal-marker-type').value = Settings.legendarySpawnIconType;
  document.getElementById('legendary-animal-marker-size').value = Settings.legendarySpawnIconSize;
  document.getElementById('enable-dclick-zoom').checked = Settings.isDoubleClickZoomEnabled;
  document.getElementById('show-help').checked = Settings.showHelp;
  document.getElementById('timestamps-24').checked = Settings.isClock24Hour;
  document.getElementById('show-coordinates').checked = Settings.isCoordsOnClickEnabled;
  document.getElementById('enable-debug').checked = Settings.isDebugEnabled;
  document.getElementById('enable-right-click').checked = Settings.isRightClickEnabled;

  document.getElementById('help-container').style.display = Settings.showHelp ? '' : 'none';

  document.getElementById('show-dailies').checked = Settings.showDailies;
  document.getElementById('show-utilities').checked = Settings.showUtilitiesSettings;
  document.getElementById('show-customization').checked = Settings.showCustomizationSettings;
  document.getElementById('show-import-export').checked = Settings.showImportExportSettings;
  document.getElementById('show-debug').checked = Settings.showDebugSettings;

  document.getElementById('dailies-container').classList.toggle('opened', Settings.showDailies);
  document.getElementById('utilities-container').classList.toggle('opened', Settings.showUtilitiesSettings);
  document.getElementById('customization-container').classList.toggle('opened', Settings.showCustomizationSettings);
  document.getElementById('import-export-container').classList.toggle('opened', Settings.showImportExportSettings);
  document.getElementById('debug-container').classList.toggle('opened', Settings.showDebugSettings);

  setInterval(clockTick, 1000);
}

function isLocalHost() {
  return location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

function changeCursor() {
  const cursorStyle = Settings.isCoordsOnClickEnabled ? 'pointer' : 'grab';
  const displayStyle = (cursorStyle === 'pointer') ? '' : 'none';
  document.querySelectorAll('.leaflet-grab').forEach(el => el.style.cursor = cursorStyle);
  document.querySelectorAll('.lat-lng-container').forEach(ctn => ctn.style.display = displayStyle);
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function getCookies() {
  var cookies = {};
  document.cookie.split(';').forEach(function(cookie) {
    var [name, ...rest] = cookie.split('=');
    cookies[name.trim()] = rest.join('=').trim();
  });
  return cookies;
}

// Simple download function
function downloadAsFile(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function clockTick() {
  'use strict';
  const now = new Date();
  const gameTime = new Date(now * 30);
  const gameHour = gameTime.getUTCHours();
  const nightTime = gameHour >= 22 || gameHour < 5;
  const clockFormat = {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: Settings.isClock24Hour ? 'h23' : 'h12',
  };

  const timeInGame = document.getElementById('time-in-game');
  if (timeInGame)
    timeInGame.textContent = gameTime.toLocaleString(Settings.language, clockFormat);

  const dayCycle = document.querySelector('.day-cycle');
  if (dayCycle)
    dayCycle.style.background = `url(assets/images/${nightTime ? 'moon' : 'sun'}.png)`;

  document.querySelectorAll('.leaflet-marker-icon[data-time]').forEach(marker => {
    let time = marker.dataset.time || '';
    if (time === '') return;
    if (time.split(',').includes(gameHour + '') && !MapBase.isPreviewMode) {
      marker.style.filter = 'drop-shadow(0 0 .5rem #fff) drop-shadow(0 0 .25rem #fff)';
    } else {
      marker.style.filter = 'none';
    }
  });
}

const sideMenu = document.querySelector('.side-menu');

sideMenu.addEventListener('scroll', function () {
  // These are not equality checks because of mobile weirdness.
  const atTop = this.scrollTop <= 0;
  const atBottom = this.scrollTop + this.clientHeight >= this.scrollHeight;
  document.querySelector('.scroller-line-tp').style.display = atTop ? '' : 'none';
  document.querySelector('.scroller-arrow-tp').style.display = atTop ? 'none' : '';
  document.querySelector('.scroller-line-bt').style.display = atBottom ? '' : 'none';
  document.querySelector('.scroller-arrow-bt').style.display = atBottom ? 'none' : '';
});

sideMenu.addEventListener('touchend', e => {
  if (e.target.classList.contains('btn-light'))
    e.target.style.setProperty('--bs-btn-hover-bg', 'transparent');
  e.stopImmediatePropagation();
});

//TODO: re-implement this function
document.getElementById('show-all-markers').addEventListener('change', function () {
  Settings.showAllMarkers = this.checked;
});

document.getElementById('enable-right-click').addEventListener('change', function () {
  Settings.isRightClickEnabled = this.checked;
});

document.getElementById('show-dailies').addEventListener('change', function () {
  Settings.showDailies = this.checked;
  document.getElementById('dailies-container').classList.toggle('opened', Settings.showDailies);
});

document.getElementById('show-utilities').addEventListener('change', function () {
  Settings.showUtilitiesSettings = this.checked;
  document.getElementById('utilities-container').classList.toggle('opened', Settings.showUtilitiesSettings);
});

document.getElementById('show-customization').addEventListener('change', function () {
  Settings.showCustomizationSettings = this.checked;
  document.getElementById('customization-container').classList.toggle('opened', Settings.showCustomizationSettings);
});

document.getElementById('show-import-export').addEventListener('change', function () {
  Settings.showImportExportSettings = this.checked;
  document.getElementById('import-export-container').classList.toggle('opened', Settings.showImportExportSettings);
});

document.getElementById('show-debug').addEventListener('change', function () {
  Settings.showDebugSettings = this.checked;
  document.getElementById('debug-container').classList.toggle('opened', Settings.showDebugSettings);
});

document.getElementById('language').addEventListener('change', function () {
  Settings.language = this.value;
  Language.setMenuLanguage();
  MapBase.setFallbackFonts();

  AnimalCollection.onLanguageChanged();
  Bounty.onLanguageChanged();
  CampCollection.onLanguageChanged();
  Encounter.onLanguageChanged();
  GunForHire.onLanguageChanged();
  Legendary.onLanguageChanged();
  Location.onLanguageChanged();
  PlantsCollection.onLanguageChanged();
  Shop.onLanguageChanged();
  Treasure.onLanguageChanged();
  Singleplayer.onLanguageChanged();

  Dailies.sortDailies();
  MadamNazar.addMadamNazar();
  MapBase.updateTippy('language');
});

document.getElementById('marker-size').addEventListener('change', function () {
  Settings.markerSize = Number(this.value);

  CampCollection.onSettingsChanged();
  CondorEgg.onSettingsChanged();
  Encounter.onSettingsChanged();
  GunForHire.onSettingsChanged();
  Location.onSettingsChanged();
  PlantsCollection.onSettingsChanged();
  Salvage.onSettingsChanged();
  Shop.onSettingsChanged();
  Treasure.onSettingsChanged();
  Singleplayer.onSettingsChanged();

  MadamNazar.addMadamNazar();
  Pins.loadPins();
});

document.getElementById('marker-opacity').addEventListener('change', function () {
  Settings.markerOpacity = Number(this.value);

  CampCollection.onSettingsChanged();
  CondorEgg.onSettingsChanged();
  Encounter.onSettingsChanged();
  GunForHire.onSettingsChanged();
  Location.onSettingsChanged();
  PlantsCollection.onSettingsChanged();
  Salvage.onSettingsChanged();
  Shop.onSettingsChanged();
  Treasure.onSettingsChanged();
  Singleplayer.onSettingsChanged();

  MadamNazar.addMadamNazar();
  Pins.loadPins();
});

document.getElementById('overlay-opacity').addEventListener('change', function () {
  Settings.overlayOpacity = Number(this.value);
  Legendary.onSettingsChanged();
  Overlay.onSettingsChanged();
  CondorEgg.onSettingsChanged();
  Salvage.onSettingsChanged();
});

document.getElementById('tooltip').addEventListener('change', function () {
  Settings.showTooltips = this.checked;
  Menu.updateTippy();
});

document.getElementById('tooltip-map').addEventListener('change', function () {
  Settings.showTooltipsMap = this.checked;
  MapBase.updateTippy('tooltip');
});

document.getElementById('marker-cluster').addEventListener('change', function () {
  Settings.isMarkerClusterEnabled = this.checked;

  Layers.oms.clearMarkers();

  Encounter.onSettingsChanged();
  GunForHire.onSettingsChanged();
  Location.onSettingsChanged();
  Shop.onSettingsChanged();
  Singleplayer.onSettingsChanged();

  MadamNazar.addMadamNazar();
  Pins.loadPins();
});

document.getElementById('enable-marker-popups-hover').addEventListener('change', function () {
  Settings.isPopupsHoverEnabled = this.checked;
});

document.getElementById('enable-marker-shadows').addEventListener('change', function () {
  Settings.isShadowsEnabled = this.checked;

  CampCollection.onSettingsChanged();
  Encounter.onSettingsChanged();
  GunForHire.onSettingsChanged();
  Location.onSettingsChanged();
  PlantsCollection.onSettingsChanged();
  Shop.onSettingsChanged();
  Singleplayer.onSettingsChanged();
  Treasure.onSettingsChanged();

  Pins.loadPins();
  MadamNazar.addMadamNazar();
});

document.getElementById('enable-legendary-backgrounds').addEventListener('change', function () {
  Settings.isLaBgEnabled = this.checked;
  Legendary.onSettingsChanged();
});

document.getElementById('legendary-animal-marker-type').addEventListener('change', function () {
  Settings.legendarySpawnIconType = this.value;
  Legendary.onSettingsChanged();
});

document.getElementById('legendary-animal-marker-size').addEventListener('change', function () {
  Settings.legendarySpawnIconSize = Number(this.value);
  Legendary.onSettingsChanged();
});

document.getElementById('enable-dclick-zoom').addEventListener('change', function () {
  Settings.isDoubleClickZoomEnabled = this.checked;
  if (Settings.isDoubleClickZoomEnabled) {
    MapBase.map.doubleClickZoom.enable();
  } else {
    MapBase.map.doubleClickZoom.disable();
  }
});

document.getElementById('show-help').addEventListener('change', function () {
  Settings.showHelp = this.checked;
  document.getElementById('help-container').style.display = Settings.showHelp ? '' : 'none';
});

document.getElementById('timestamps-24').addEventListener('change', function () {
  Settings.isClock24Hour = this.checked;
  clockTick();
  document.getElementById('language').dispatchEvent(new Event('change'));
});

document.getElementById('show-coordinates').addEventListener('change', function () {
  Settings.isCoordsOnClickEnabled = this.checked;
  changeCursor();
});

document.getElementById('enable-debug').addEventListener('change', function () {
  Settings.isDebugEnabled = this.checked;
});

//Open collection submenu
document.querySelectorAll('.open-submenu').forEach(el => {
  el.addEventListener('click', function (e) {
    e.stopPropagation();
    this.parentElement.parentElement.querySelector('.menu-hidden').classList.toggle('opened');
    this.classList.toggle('rotate');
  });
});

document.querySelectorAll('.submenu-only').forEach(el => {
  el.addEventListener('click', function(e) {
    e.stopPropagation();
    this.parentElement.querySelector('.menu-hidden').classList.toggle('opened');
    this.querySelector('.open-submenu').classList.toggle('rotate');
  });
});

//Open & close side menu
document.querySelector('.menu-toggle').addEventListener('click', function () {
  sideMenu.classList.toggle('menu-opened');
  Settings.isMenuOpened = sideMenu.classList.contains('menu-opened');
  this.textContent = Settings.isMenuOpened ? 'X' : '>';
  document.querySelector('.top-widget').classList.toggle('top-widget-menu-opened', Settings.isMenuOpened);
  document.getElementById('fme-container').classList.toggle('fme-menu-opened', Settings.isMenuOpened);
});

document.addEventListener('contextmenu', function (e) {
  if (!Settings.isRightClickEnabled) e.preventDefault();
});

document.getElementById('delete-all-settings').addEventListener('click', function () {
  for (const key in localStorage) {
    if (key.startsWith('rdo.'))
      localStorage.removeItem(key);
  }

  location.reload(true);
});

document.getElementById('reload-map').addEventListener('click', function () {
  location.reload(true);
});

// converts string 'hours:minutes' to time 12/24 hours
function convertToTime(hours = '00', minutes = '00') {
  return Settings.isClock24Hour ?
    `${hours}:${minutes}` :
    `${+hours % 12 || 12}:${minutes}${+hours >= 12 ? 'PM' : 'AM'}`;
}

/**
 * Modals
 */

const deleteAllSettingsModal = new bootstrap.Modal(document.getElementById('delete-all-settings-modal'));
document.getElementById('open-delete-all-settings-modal').addEventListener('click', function () {
  deleteAllSettingsModal.show();
});
/* returns an Array with the range of all hours between from to to  */
function timeRange(from, to) {
  const times = [];

  let hour = from;
  while (hour !== to) {
    times.push(hour);
    hour = (hour + 1) % 24;
    if (times.length >= 24) break;
  }
  return times;
}
/**
 * Leaflet plugins
 */
L.DivIcon.DataMarkup = L.DivIcon.extend({
  _setIconStyles: function (img, name) {
    L.DivIcon.prototype._setIconStyles.call(this, img, name);

    if (this.options.marker)
      img.dataset.marker = this.options.marker;

    if (this.options.category)
      img.dataset.category = this.options.category;

    if (this.options.tippy)
      img.dataset.tippy = this.options.tippy;

    if (this.options.time) {
      var from = parseInt(this.options.time[0]);
      var to = parseInt(this.options.time[1]);

      img.dataset.time = timeRange(from, to);
    }
  },
});

L.LayerGroup.include({
  getLayerById: function (id) {
    for (var i in this._layers) {
      if (this._layers[i].id === id) {
        return this._layers[i];
      }
    }
  },
});

// Glowing icon (legendary animals)
L.Icon.TimedData = L.Icon.extend({
  _setIconStyles: function (img, name) {
    L.Icon.prototype._setIconStyles.call(this, img, name);
    if (this.options.time && this.options.time.length) {
      img.dataset.time = this.options.time;
    }
  },
});

document.getElementById('cookie-export').addEventListener('click', function () {
  try {
    var cookies = getCookies();
    var storage = localStorage;

    // Remove irrelevant properties (permanently from localStorage):
    delete cookies['_ga'];
    delete storage['randid'];
    delete storage['inventory'];

    // TODO: Need to more differentiate settings form RDO and Collectors map, to don't add hundreds of settings to this list (add prefix or sth)
    // Remove irrelevant properties (from COPY of localStorage, only to do not export them):
    storage = Object.assign({}, localStorage);
    delete storage['pinned-items'];
    delete storage['rdo.pinned-items'];
    delete storage['routes.customRoute'];
    delete storage['importantItems'];
    delete storage['enabled-categories'];

    for (var key in storage) {
      if (!key.startsWith('rdo.')) {
        delete storage[key];
      }
    }

    var settings = {
      'cookies': cookies,
      'local': storage,
    };

    var settingsJson = JSON.stringify(settings, null, 4);
    var exportDate = new Date().toISOUTCDateString();

    downloadAsFile(`RDO-map-settings-(${exportDate}).json`, settingsJson);
  } catch (error) {
    console.error(error);
    alert(Language.get('alerts.feature_not_supported'));
  }
});

function setSettings(settings) {
  for (const [key, value] of Object.entries(settings.cookies)) {
    document.cookie = `${key}=${value}; max-age=${60 * 60 * 24 * 999}; path=/`;
  }

  for (const [key, value] of Object.entries(settings.local)) {
    localStorage.setItem(key, value);
  }

  location.reload();
}

document.getElementById('cookie-import').addEventListener('click', function() {
  try {
    let settings = null;
    const file = document.getElementById('cookie-import-file').files[0];
    let fallback = false;

    if (!file) {
      alert(Language.get('alerts.file_not_found'));
      return;
    }

    try {
      file.text().then((text) => {
        try {
          settings = JSON.parse(text);
          setSettings(settings);
        } catch (error) {
          alert(Language.get('alerts.file_not_valid'));
          return;
        }
      });
    } catch (error) {
      fallback = true;
    }

    if (fallback) {
      const reader = new FileReader();

      reader.addEventListener('loadend', e => {
        const text = e.target.result;

        try {
          settings = JSON.parse(text);
          setSettings(settings);
        } catch (error) {
          alert(Language.get('alerts.file_not_valid'));
          return;
        }
      });

      reader.readAsText(file);
    }
  } catch (error) {
    console.error(error);
    alert(Language.get('alerts.feature_not_supported'));
  }
});

function linear(value, iMin, iMax, oMin, oMax) {
  const clamp = (num, min, max) => {
    return num <= min ? min : num >= max ? max : num;
  };
  return clamp((((value - iMin) / (iMax - iMin)) * (oMax - oMin) + oMin), oMin, oMax);
}

function isEmptyObject(obj) {
  if (obj == null) return true;
  if (typeof obj !== 'object') return false;
  return Object.keys(obj).length === 0;
}

/**
 * Loads a specified font and adds it to the document's font set.
 *
 * @param {string} name - The name of the font.
 * @param {Object} urls - An object containing URLs for different font formats.
 * @param {string} [urls.woff2] - The URL for the WOFF2 font format.
 * @param {string} [urls.woff] - The URL for the WOFF font format.
 * @param {string} [urls.ttf] - The URL for the TTF font format.
 * @returns {Promise<FontFace>} A promise that resolves to the loaded FontFace object.
 *
 * @example
 * const urls = {
 *   woff2: '/assets/fonts/font.woff2',
 *   woff: '/assets/fonts/font.woff',
 *   ttf: '/assets/fonts/font.ttf'
 * };
 */
function loadFont(name, urls = {}) {
  const sources = [
    { url: urls.woff2, format: 'woff2' },
    { url: urls.woff, format: 'woff' },
    { url: urls.ttf, format: 'truetype' },
  ]
    .filter(({ url }) => url)
    .map(({ url, format }) => `url(${url}) format('${format}')`)
    .join(', ');

  const fontFace = new FontFace(name, sources, { style: 'normal', weight: '400' });
  return fontFace.load().then(() => {
    document.fonts.add(fontFace);
    return fontFace;
  });
}
