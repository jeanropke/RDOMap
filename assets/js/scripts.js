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
  }
});

Object.defineProperty(Date.prototype, 'toISOUTCDateString', {
  value: function () { return this.toISOString().split('T')[0]; },
});

var searchTerms = [];
var uniqueSearchMarkers = [];

var categories = [
  'ambush', 'boats', 'campfires', 'daily_locations', 'defend_campsite', 'dog_encounter',
  'egg_encounter', 'escort', 'fame_seeker', 'fast_travel', 'grave_robber', 'hideouts',
  'hogtied_lawman', 'duel', 'moonshiner_camp', 'moonshiner_destroy', 'moonshiner_roadblock',
  'moonshiner_sabotage', 'nazar', 'plants', 'rescue', 'rival_collector', 'runaway_wagon',
  'shops', 'sightseeing', 'trains', 'treasure', 'treasure_hunter', 'tree_map', 'user_pins',
  'wounded_animal', 'camps', 'animal_attack', 'kidnapped', 'discoverables', 'legendary_animals',
  'beggar', 'stalking_hunter', 'slumped_hunter', 'crashed_wagon', 'suspension_trap'
];

var categoriesDisabledByDefault = [
  'ambush', 'daily_locations', 'dog_encounter', 'egg_encounter', 'escort', 'fame_seeker',
  'grave_robber', 'hogtied_lawman', 'duel', 'moonshiner_camp', 'moonshiner_destroy',
  'moonshiner_roadblock', 'moonshiner_sabotage', 'rescue', 'rival_collector', 'runaway_wagon',
  'sightseeing', 'treasure_hunter', 'tree_map', 'wounded_animal', 'camps', 'animal_attack',
  'kidnapped', 'discoverables', 'beggar', 'stalking_hunter', 'slumped_hunter', 'crashed_wagon',
  'suspension_trap'
];

var plants = [
  'alaskan_ginseng', 'american_ginseng', 'bay_bolete', 'black_berry', 'black_currant', 'burdock_root',
  'chanterelles', 'common_bulrush', 'creeping_thyme', 'desert_sage', 'english_mace', 'evergreen_huckleberry',
  'golden_currant', 'hummingbird_sage', 'milkweed', 'parasol_mushroom', 'oleander_sage', 'oregano',
  'prairie_poppy', 'red_raspberry', 'rams_head', 'red_sage', 'indian_tobacco', 'vanilla_flower',
  'violet_snowdrop', 'wild_carrots', 'wild_feverfew', 'wild_mint', 'wintergreen_berry', 'yarrow'
];

var plantsDisabledByDefault = plants;

var shops = [
  'barber', 'butcher', 'doctor', 'fence', 'general_store', 'gunsmith', 'honor', 'photo_studio',
  'post_office', 'saloon', 'stable', 'tackle', 'tailor'
];

var shopsDisabledByDefault = [
  'barber', 'butcher', 'doctor', 'fence', 'general_store', 'gunsmith', 'honor', 'photo_studio',
  'stable', 'tackle', 'tailor'
];

var camps = [
  'bayounwa', 'bigvalley', 'chollasprings', 'cumberland', 'gaptooth', 'greatplains', 'grizzlies',
  'heartlands', 'hennigans', 'riobravo', 'roanoke', 'scarlett', 'talltrees'
];

var campsDisabledByDefault = camps;

var enabledCategories = categories;
var enabledPlants = plants;
var enabledShops = shops;
var enabledCamps = camps;
var categoryButtons = $(".clickable[data-type]");

var date;

var debugMarkersArray = [];
var tempCollectedMarkers = "";

function init() {
  //sometimes, cookies are saved in the wrong order
  var cookiesList = [];
  $.each($.cookie(), function (key, value) {
    if (key.startsWith('removed-items')) {
      cookiesList.push(key);
    }
  });
  cookiesList.sort();
  $.each(cookiesList, function (key, value) {
    tempCollectedMarkers += $.cookie(value);
  });

  if (typeof $.cookie('alert-closed-1') == 'undefined') {
    $('.map-alert').show();
  }
  else {
    $('.map-alert').hide();
  }

  if (typeof $.cookie('disabled-categories') !== 'undefined')
    categoriesDisabledByDefault = $.cookie('disabled-categories').split(',');

  enabledCategories = enabledCategories.filter(function (item) {
    return categoriesDisabledByDefault.indexOf(item) === -1;
  });

  if (typeof $.cookie('disabled-plants') !== 'undefined')
    plantsDisabledByDefault = $.cookie('disabled-plants').split(',');

  enabledPlants = enabledPlants.filter(function (item) {
    return plantsDisabledByDefault.indexOf(item) === -1;
  });

  if (typeof $.cookie('disabled-shops') !== 'undefined')
    shopsDisabledByDefault = $.cookie('disabled-shops').split(',');

  enabledShops = enabledShops.filter(function (item) {
    return shopsDisabledByDefault.indexOf(item) === -1;
  });

  if (typeof $.cookie('disabled-camps') !== 'undefined')
    campsDisabledByDefault = $.cookie('disabled-camps').split(',');

  enabledCamps = enabledCamps.filter(function (item) {
    return campsDisabledByDefault.indexOf(item) === -1;
  });

  if ($.cookie('map-layer') === undefined || isNaN(parseInt($.cookie('map-layer'))))
    $.cookie('map-layer', 0, { expires: 999 });

  if (!Language.availableLanguages.includes(Settings.language)) {
    Settings.language = 'en';
    $.cookie('language', Settings.language, { expires: 999 });
    $('#language').val(Settings.language);
  }

  if ($.cookie('remove-markers-daily') === undefined) {
    Settings.resetMarkersDaily = true;
    $.cookie('remove-markers-daily', '1', { expires: 999 });
  }

  if ($.cookie('marker-cluster') === undefined) {
    Settings.markerCluster = true;
    $.cookie('marker-cluster', '1', { expires: 999 });
  }

  if ($.cookie('enable-marker-shadows') === undefined) {
    Settings.isShadowsEnabled = true;
    $.cookie('enable-marker-shadows', '1', { expires: 999 });
  }

  if ($.cookie('enable-dclick-zoom') === undefined) {
    Settings.isDoubleClickZoomEnabled = true;
    $.cookie('enable-dclick-zoom', '1', { expires: 999 });
  }

  if ($.cookie('show-help') === undefined) {
    Settings.showHelp = true;
    $.cookie('show-help', '1', { expires: 999 });
  }

  if ($.cookie('marker-opacity') === undefined) {
    Settings.markerOpacity = 1;
    $.cookie('marker-opacity', '1', { expires: 999 });
  }

  if ($.cookie('marker-size') === undefined) {
    Settings.markerSize = 1;
    $.cookie('marker-size', '1', { expires: 999 });
  }

  if ($.cookie('overlay-opacity') === undefined) {
    Settings.overlayOpacity = 0.5;
    $.cookie('overlay-opacity', '0.5', { expires: 999 });
  }

  if ($.cookie('fme-display') === undefined) {
    FME.display = 3;
    $.cookie('fme-display', '3', { expires: 999 });
  }

  if ($.cookie('timestamps-24') === undefined) {
    Settings.display24HoursTimestamps = false;
    $.cookie('timestamps-24', 'false', { expires: 999 });
  }

  MapBase.init();
  MapBase.setOverlays(Settings.overlayOpacity);

  Language.init();
  Language.setMenuLanguage();

  setMapBackground($.cookie('map-layer'));

  if (Settings.isMenuOpened)
    $('.menu-toggle').click();

  $('#language').val(Settings.language);
  $('#marker-opacity').val(Settings.markerOpacity);
  $('#fme-display').val(FME.display);
  $('#marker-size').val(Settings.markerSize);
  $('#overlay-opacity').val(Settings.overlayOpacity);

  $('#reset-markers').prop("checked", Settings.resetMarkersDaily);
  $('#marker-cluster').prop("checked", Settings.markerCluster);
  $('#enable-marker-shadows').prop("checked", Settings.isShadowsEnabled);
  $('#enable-marker-popups-hover').prop("checked", Settings.isPopupsHoverEnabled);
  $('#enable-dclick-zoom').prop("checked", Settings.isDoubleClickZoomEnabled);
  $('#pins-place-mode').prop("checked", Settings.isPinsPlacingEnabled);
  $('#pins-edit-mode').prop("checked", Settings.isPinsEditingEnabled);
  $('#show-help').prop("checked", Settings.showHelp);
  $('#show-coordinates').prop("checked", Settings.isCoordsEnabled);
  $('#timestamps-24').prop("checked", Settings.display24HoursTimestamps);
  $('#sort-items-alphabetically').prop("checked", Settings.sortItemsAlphabetically);
  $("#enable-right-click").prop('checked', $.cookie('right-click') != null);
  $("#enable-debug").prop('checked', $.cookie('debug') != null);
  $("#enable-cycle-changer").prop('checked', $.cookie('cycle-changer-enabled') != null);

  $("#help-container").toggle(Settings.showHelp);

  Pins.addToMap();
  changeCursor();
}

function isLocalHost() {
  return location.hostname === "localhost" || location.hostname === "127.0.0.1";
}

function setMapBackground(mapIndex) {
  switch (parseInt(mapIndex)) {
    default:
    case 0:
      $('#map').css('background-color', '#d2b790');
      MapBase.isDarkMode = false;
      break;

    case 1:
      $('#map').css('background-color', '#d2b790');
      MapBase.isDarkMode = false;
      break;

    case 2:
      $('#map').css('background-color', '#3d3d3d');
      MapBase.isDarkMode = true;
      break;

    case 3:
      $('#map').css('background-color', '#000');
        MapBase.isDarkMode = true;
        break;
  }
  MapBase.setOverlays();
  $.cookie('map-layer', mapIndex, { expires: 999 });
}

function changeCursor() {
  if (Settings.isCoordsEnabled)
    $('.leaflet-grab').css('cursor', 'pointer');
  else {
    $('.leaflet-grab').css('cursor', 'grab');
    $('.lat-lng-container').css('display', 'none');
  }
}

function addZeroToNumber(number) {
  if (number < 10)
    number = '0' + number;
  return number;
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

//Copy text to clipboard
function setClipboardText(text) {
  var el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
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
  const now = new Date();
  const gameTime = new Date(now * 30);
  const gameHour = gameTime.getUTCHours();
  const nightTime = gameHour >= 22 || gameHour < 5;
  const clockFormat = {
    timeZone: 'UTC',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: Settings.display24HoursTimestamps ? 'h23' : 'h12',
  };

  $('#time-in-game').text(gameTime.toLocaleString(Settings.language, clockFormat));
  $('.day-cycle').css('background', `url(assets/images/${nightTime ? 'moon' : 'sun'}.png)`);

  if (!enabledCategories.includes('hideouts')) return;
}

setInterval(clockTick, 1000);

/**
 * jQuery triggers
 */

//Toggle debug container
$("#toggle-debug").on("click", function () {
  $("#debug-container").toggleClass('opened');
});

//Show all markers on map
$("#show-all-markers").on("change", function () {
  Settings.showAllMarkers = $("#show-all-markers").prop('checked');
  MapBase.addMarkers();
});

// Give me back my right-click
$('#enable-right-click').on("change", function () {
  if ($("#enable-right-click").prop('checked')) {
    $.cookie('right-click', '1', { expires: 999 });
  } else {
    $.removeCookie('right-click');
  }
});

// :-)
$('#enable-debug').on("change", function () {
  if ($("#enable-debug").prop('checked')) {
    Settings.isDebugEnabled = true;
    $.cookie('debug', '1', { expires: 999 });
  } else {
    Settings.isDebugEnabled = false;
    $.removeCookie('debug');
  }
});

//Disable menu category when click on input
$('.menu-option.clickable input, #submit-new-herb').on('click', function (e) {
  e.stopPropagation();
});

//Search system on menu
$("#search").on("input", function () {
  MapBase.onSearch($('#search').val());
});

$("#copy-search-link").on("click", function () {
  setClipboardText(`http://jeanropke.github.io/RDOMap/?search=${$('#search').val()}`);
});

//Change & save markers reset daily or manually
$("#reset-markers").on("change", function () {
  Settings.resetMarkersDaily = $("#reset-markers").prop('checked');
  $.cookie('remove-markers-daily', Settings.resetMarkersDaily ? '1' : '0', { expires: 999 });
});

$("#clear-markers").on("click", function () {
  $.each(MapBase.markers, function (key, value) {
    value.isCollected = false;
    value.canCollect = true;
  });

  Menu.refreshMenu();
  MapBase.addMarkers();
});

//When map-alert is clicked
$('.map-alert').on('click', function () {
  $.cookie('alert-closed-1', 'true', { expires: 999 });
  $('.map-alert').hide();
});

//Enable & disable show coordinates on menu
$('#show-coordinates').on('change', function () {
  Settings.isCoordsEnabled = $("#show-coordinates").prop('checked');
  $.cookie('coords-enabled', Settings.isCoordsEnabled ? '1' : '0', { expires: 999 });

  changeCursor();
});

$('#timestamps-24').on('change', function () {
  Settings.display24HoursTimestamps = $("#timestamps-24").prop('checked');
  $.cookie('timestamps-24', Settings.display24HoursTimestamps ? '1' : '0', { expires: 999 });
  clockTick();
});

//Change & save language option
$("#language").on("change", function () {
  Settings.language = $("#language").val();
  $.cookie('language', Settings.language, { expires: 999 });
  Language.setMenuLanguage();
  MapBase.addMarkers();
  Menu.refreshMenu();
});

//Change & save overlay opacity
$("#marker-opacity").on("change", function () {
  var parsed = parseFloat($("#marker-opacity").val());
  Settings.markerOpacity = parsed ? parsed : 1;
  $.cookie('marker-opacity', Settings.markerOpacity, { expires: 999 });
  MapBase.addMarkers();
});

$("#overlay-opacity").on("change", function () {
  var parsed = parseFloat($("#overlay-opacity").val());
  Settings.overlayOpacity = parsed ? parsed : 0.5;
  $.cookie('overlay-opacity', Settings.overlayOpacity, { expires: 999 });
  MapBase.setOverlays(parsed);
});

//Change & save marker size
$("#marker-size").on("change", function () {
  var parsed = parseFloat($("#marker-size").val());
  Settings.markerSize = parsed ? parsed : 1;
  $.cookie('marker-size', Settings.markerSize, { expires: 999 });
  MapBase.addMarkers();
  Treasures.set();
  Legendary.set();
});

// Toggle visibility of FME cards.
$("#fme-display").on("change", function () {
  var parsed = parseInt($("#fme-display").val());
  FME.display = !isNaN(parsed) ? parsed : 3;
  $.cookie('fme-display', FME.display, { expires: 999 });
  FME.update();
});

//Disable & enable collection category
$('.clickable').on('click', function (e) {
  e.stopPropagation();

  var menu = $(this);
  if (menu.data('type') === undefined) return;

  $('[data-type=' + menu.data('type') + ']').toggleClass('disabled');
  var isDisabled = menu.hasClass('disabled');

  if (isDisabled) {
    enabledCategories = $.grep(enabledCategories, function (value) {
      return value != menu.data('type');
    });

    categoriesDisabledByDefault.push(menu.data('type'));
  } else {
    enabledCategories.push(menu.data('type'));

    categoriesDisabledByDefault = $.grep(categoriesDisabledByDefault, function (value) {
      return value != menu.data('type');
    });
  }
  $.cookie('disabled-categories', categoriesDisabledByDefault.join(','), { expires: 999 });

  if (menu.data('type') == 'treasure')
    Treasures.addToMap();
  else if (menu.data('type') == 'user_pins')
    Pins.addToMap();
  else if (menu.data('type') == 'legendary_animals')
    Legendary.addToMap();    
  else
    MapBase.addMarkers();
});

//Disable & enable collection category
$(document).on('click', '.animal-wrapper[data-type]', function (e) {
  e.stopPropagation();

  var menu = $(this);

  $('.menu-hidden .animal-wrapper').each(function (key, value) {
    if (menu.data('type') != $(value).data('type'))
      $(value).children('span').addClass('disabled');
  });

  menu.children('span').toggleClass('disabled');
  if (menu.children('span').hasClass('disabled')) {
    Heatmap.removeHeatmap();
  } else {
    Heatmap.setHeatmap(menu.data('type'), menu.parent().data('type'));
  }
});

//Open collection submenu
$('.open-submenu').on('click', function (e) {
  e.stopPropagation();
  $(this).parent().parent().children('.menu-hidden').toggleClass('opened');
  $(this).toggleClass('rotate');
});

$('.submenu-only').on('click', function (e) {
  e.stopPropagation();
  $(this).parent().children('.menu-hidden').toggleClass('opened');
  $(this).children('.open-submenu').toggleClass('rotate');
});

//Remove item from map when using the menu
$(document).on('click', '.collectible-wrapper[data-type]', function () {
  var menu = $(this);
  var collectible = menu.data('type');
  var category = menu.parent().data('type');

  if (typeof collectible === 'undefined') return;
  
  $('[data-type=' + collectible + ']').toggleClass('disabled');
  var isDisabled = $('[data-type=' + collectible + ']').hasClass('disabled');

  if (category == 'encounters') {
    if (isDisabled) {
      enabledCategories = $.grep(enabledCategories, function (value) {
        return value != collectible;
      });

      categoriesDisabledByDefault.push(collectible);
    } else {
      enabledCategories.push(collectible);

      categoriesDisabledByDefault = $.grep(categoriesDisabledByDefault, function (value) {
        return value != collectible;
      });
    }

    $.cookie('disabled-categories', categoriesDisabledByDefault.join(','), { expires: 999 });

    Encounters.addToMap();
  } else if (category == 'plants') {
    if (isDisabled) {
      enabledPlants = $.grep(enabledPlants, function (value) {
        return value != collectible;
      });

      plantsDisabledByDefault.push(collectible);
    } else {
      enabledPlants.push(collectible);

      plantsDisabledByDefault = $.grep(plantsDisabledByDefault, function (value) {
        return value != collectible;
      });
    }

    $.cookie('disabled-plants', plantsDisabledByDefault.join(','), { expires: 999 });

    MapBase.addMarkers();
  } else if (category == 'shops') {
    if (isDisabled) {
      enabledShops = $.grep(enabledShops, function (value) {
        return value != collectible;
      });

      shopsDisabledByDefault.push(collectible);
    } else {
      enabledShops.push(collectible);

      shopsDisabledByDefault = $.grep(shopsDisabledByDefault, function (value) {
        return value != collectible;
      });
    }

    $.cookie('disabled-shops', shopsDisabledByDefault.join(','), { expires: 999 });

    MapBase.addMarkers();
  } else if (category == 'camps') {
    if (isDisabled) {
      enabledCamps = $.grep(enabledCamps, function (value) {
        return value != collectible;
      });

      campsDisabledByDefault.push(collectible);
    } else {
      enabledCamps.push(collectible);

      campsDisabledByDefault = $.grep(campsDisabledByDefault, function (value) {
        return value != collectible;
      });
    }

    $.cookie('disabled-camps', campsDisabledByDefault.join(','), { expires: 999 });

    MapBase.addMarkers();
  } else {
    MapBase.removeItemFromMap(collectible, collectible, category, true);
  }

});

//Open & close side menu
$('.menu-toggle').on('click', function () {
  $('.side-menu').toggleClass('menu-opened');

  if ($('.side-menu').hasClass('menu-opened')) {
    $('.menu-toggle').text('X');
    $.cookie('menu-opened', '1');
  } else {
    $('.menu-toggle').text('>');
    $.cookie('menu-opened', '0');
  }
  $('.timer-container').toggleClass('timer-menu-opened');
  $('.counter-container').toggleClass('counter-menu-opened');
  $('.clock-container').toggleClass('timer-menu-opened');
  $('.fme-container').toggleClass('fme-menu-opened');
});
//Enable & disable markers cluster
$('#marker-cluster').on("change", function () {
  Settings.markerCluster = $("#marker-cluster").prop('checked');
  $.cookie('marker-cluster', Settings.markerCluster ? '1' : '0', { expires: 999 });

  MapBase.map.removeLayer(Layers.itemMarkersLayer);
  MapBase.addMarkers();
});

$('#enable-marker-popups-hover').on("change", function () {
  Settings.isPopupsHoverEnabled = $("#enable-marker-popups-hover").prop('checked');
  $.cookie('enable-marker-popups-hover', Settings.isPopupsHoverEnabled ? '1' : '0', { expires: 999 });
});

$('#enable-marker-shadows').on("change", function () {
  Settings.isShadowsEnabled = $("#enable-marker-shadows").prop('checked');
  $.cookie('enable-marker-shadows', Settings.isShadowsEnabled ? '1' : '0', { expires: 999 });

  MapBase.map.removeLayer(Layers.itemMarkersLayer);
  MapBase.addMarkers();
});

$('#enable-dclick-zoom').on("change", function () {
  Settings.isDoubleClickZoomEnabled = $("#enable-dclick-zoom").prop('checked');
  $.cookie('enable-dclick-zoom', Settings.isDoubleClickZoomEnabled ? '1' : '0', { expires: 999 });

  if (Settings.isDoubleClickZoomEnabled) {
    MapBase.map.doubleClickZoom.enable();
  } else {
    MapBase.map.doubleClickZoom.disable();
  }
});

/**
 * User Pins
 */

$('#pins-place-mode').on("change", function () {
  Settings.isPinsPlacingEnabled = $("#pins-place-mode").prop('checked');
  $.cookie('pins-place-enabled', Settings.isPinsPlacingEnabled ? '1' : '0', { expires: 999 });
});

$('#pins-edit-mode').on("change", function () {
  Settings.isPinsEditingEnabled = $("#pins-edit-mode").prop('checked');
  $.cookie('pins-edit-enabled', Settings.isPinsEditingEnabled ? '1' : '0', { expires: 999 });

  Pins.addToMap();
});

$('#pins-place-new').on("click", function () {
  Pins.addPinToCenter();
});

$('#pins-export').on("click", function () {
  try {
    Pins.exportPins();
  } catch (error) {
    console.error(error);
    alert(Language.get('alerts.feature_not_supported'));
  }
});

$('#pins-import').on('click', function () {
  try {
    var file = $('#pins-import-file').prop('files')[0];
    var fallback = false;

    if (!file) {
      alert(Language.get('alerts.file_not_found'));
      return;
    }

    try {
      file.text().then((text) => {
        Pins.importPins(text);
      });
    } catch (error) {
      fallback = true;
    }

    if (fallback) {
      var reader = new FileReader();

      reader.addEventListener('loadend', (e) => {
        var text = e.srcElement.result;
        Pins.importPins(text);
      });

      reader.readAsText(file);
    }
  } catch (error) {
    console.error(error);
    alert(Language.get('alerts.feature_not_supported'));
  }
});

/**
 * Cookie import/exporting
 */

$('#cookie-export').on("click", function () {
  try {
    var cookies = $.cookie();
    var storage = localStorage;

    // Remove irrelevant properties (permanently from localStorage):
    delete cookies['_ga'];
    delete storage['randid'];
    delete storage['inventory'];

    // TODO: Need to more differentiate settings form RDO and Collectors map, to don't add hundreds of settings to this list (add prefix or sth)
    // Remove irrelevant properties (from COPY of localStorage, only to do not export them):
    storage = $.extend(true, {}, localStorage);
    delete storage['pinned-items'];
    delete storage['routes.customRoute'];
    delete storage['importantItems'];
    delete storage['enabled-categories'];

    for (var key in storage) {
      if (storage.hasOwnProperty(key) && key.includesOneOf('collected.', 'routes.', 'shown.', 'amount.')) {
        delete storage[key];
      }
    }

    var settings = {
      'cookies': cookies,
      'local': storage
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
  $.each(settings.cookies, function (key, value) {
    $.cookie(key, value, { expires: 999 });
  });

  $.each(settings.local, function (key, value) {
    localStorage.setItem(key, value);
  });

  location.reload();
}

$('#cookie-import').on('click', function () {
  try {
    var settings = null;
    var file = $('#cookie-import-file').prop('files')[0];
    var fallback = false;

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
    }
    catch (error) {
      fallback = true;
    }

    if (fallback) {
      var reader = new FileReader();

      reader.addEventListener('loadend', (e) => {
        var text = e.srcElement.result;

        try {
          settings = JSON.parse(text);
          setSettings(settings);
        }
        catch (error) {
          alert(Language.get('alerts.file_not_valid'));
          return;
        }
      });

      reader.readAsText(file);
    }
  }
  catch (error) {
    console.error(error);
    alert(Language.get('alerts.feature_not_supported'));
  }
});

/**
 * Tutorial logic
 */
var defaultHelpTimeout;
$('[data-help]').hover(function (e) {
  var attr = $(this).attr('data-help');
  clearTimeout(defaultHelpTimeout);
  $('#help-container p').attr('data-text', `help.${attr}`).text(Language.get(`help.${attr}`));
}, function () {
  defaultHelpTimeout = setTimeout(function () {
    $('#help-container p').attr('data-text', `help.default`).text(Language.get(`help.default`));
  }, 100);
});

$('#show-help').on("change", function () {
  Settings.showHelp = $("#show-help").prop('checked');
  $.cookie('show-help', Settings.showHelp ? '1' : '0', { expires: 999 });

  $("#help-container").toggle(Settings.showHelp);
});

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
  }
});

L.LayerGroup.include({
  getLayerById: function (id) {
    for (var i in this._layers) {
      if (this._layers[i].id == id) {
        return this._layers[i];
      }
    }
  }
});

// Disable annoying menu on right mouse click
$('*').on('contextmenu', function (e) {
  if ($.cookie('right-click') == null)
    e.preventDefault();
});

// reset all settings & cookies
$('#delete-all-settings').on('click', function () {
  var cookies = $.cookie();
  for (var cookie in cookies) {
    $.removeCookie(cookie);
  }

  $.each(localStorage, function (key) {
    localStorage.removeItem(key);
  });

  location.reload(true);
});

/**
 * Modals
 */
$('#open-clear-important-items-modal').on('click', function () {
  $('#clear-important-items-modal').modal();
});

$('#open-delete-all-settings-modal').on('click', function () {
  $('#delete-all-settings-modal').modal();
});

/**
 * Event listeners
 */

$(function () {
  init();
  Heatmap.load();
  MapBase.loadFastTravels();
  MapBase.loadShops();
  MapBase.loadCamps();
  MadamNazar.loadMadamNazar();
  Treasures.load();
  Legendary.load();
  Encounters.load();
  MapBase.loadMarkers();
  MapBase.loadDiscoverables();
  FME.init();
});
