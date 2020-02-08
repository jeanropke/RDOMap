var searchTerms = [];
var uniqueSearchMarkers = [];

var categories = [
  'ambush', 'boats', 'campfires', 'defend_campsite', 'dog_encounter', 'egg_encounter',
  'escort', 'fame_seeker', 'fast_travel', 'grave_robber', 'hideouts', 'hogtied_lawman',
  'hostile_conversation', 'moonshiner_camp', 'people_in_need', 'plants', 'rescue',
  'rival_collector', 'runaway_wagon', 'trains', 'treasure', 'treasure_hunter',
  'tree_map', 'user_pins', 'wounded_animal',
];

var categoriesDisabledByDefault = [
  'treasure_hunter', 'tree_map', 'egg_encounter', 'dog_encounter', 'grave_robber',
  'wounded_animal', 'fame_seeker', 'hostile_conversation', 'rival_collector',
  'moonshiner_camp', 'treasure'
];

var plants = [
  'alaskan_ginseng', 'american_ginseng', 'bay_bolete', 'black_berry', 'black_currant', 'burdock_root',
  'chanterelles', 'common_bulrush', 'creeping_thyme', 'desert_sage', 'english_mace', 'evergreen_huckleberry',
  'golden_currant', 'hummingbird_sage', 'milkweed', 'parasol_mushroom', 'oleander_sage', 'oregano',
  'prairie_poppy', 'red_raspberry', 'rams_head', 'red_sage', 'indian_tobacco', 'vanilla_flower',
  'violet_snowdrop', 'wild_carrots', 'wild_feverfew', 'wild_mint', 'wintergreen_berry', 'yarrow'
];

var plantsDisabledByDefault = plants;

var enabledCategories = categories;
var enabledPlants = plants;
var categoryButtons = $(".clickable[data-type]");

var fastTravelData;

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

  if (typeof $.cookie('map-layer') === 'undefined' || isNaN(parseInt($.cookie('map-layer'))))
    $.cookie('map-layer', 0, { expires: 999 });

  if (!Language.availableLanguages.includes(Settings.language))
    Settings.language = 'en-us';

  if (typeof $.cookie('remove-markers-daily') === 'undefined') {
    Settings.resetMarkersDaily = true;
    $.cookie('remove-markers-daily', '1', { expires: 999 });
  }

  if (typeof $.cookie('marker-cluster') === 'undefined') {
    Settings.markerCluster = true;
    $.cookie('marker-cluster', '1', { expires: 999 });
  }

  if (typeof $.cookie('enable-marker-shadows') === 'undefined') {
    Settings.isShadowsEnabled = true;
    $.cookie('enable-marker-shadows', '1', { expires: 999 });
  }

  if (typeof $.cookie('enable-dclick-zoom') === 'undefined') {
    Settings.isDoubleClickZoomEnabled = true;
    $.cookie('enable-dclick-zoom', '1', { expires: 999 });
  }

  if (typeof $.cookie('show-help') === 'undefined') {
    Settings.showHelp = true;
    $.cookie('show-help', '1', { expires: 999 });
  }

  if (typeof $.cookie('marker-opacity') === 'undefined') {
    Settings.markerOpacity = 1;
    $.cookie('marker-opacity', '1', { expires: 999 });
  }

  if (typeof $.cookie('fme-display') === 'undefined') {
    FME.display = 3;
    $.cookie('fme-display', '3', { expires: 999 });
  }

  MapBase.init();

  Language.setMenuLanguage();

  setMapBackground($.cookie('map-layer'));

  if (Settings.isMenuOpened)
    $('.menu-toggle').click();

  $('#language').val(Settings.language);
  $('#marker-opacity').val(Settings.markerOpacity);
  $('#fme-display').val(FME.display);

  $('#reset-markers').prop("checked", Settings.resetMarkersDaily);
  $('#marker-cluster').prop("checked", Settings.markerCluster);
  $('#enable-marker-shadows').prop("checked", Settings.isShadowsEnabled);
  $('#enable-dclick-zoom').prop("checked", Settings.isDoubleClickZoomEnabled);
  $('#pins-place-mode').prop("checked", Settings.isPinsPlacingEnabled);
  $('#pins-edit-mode').prop("checked", Settings.isPinsEditingEnabled);
  $('#show-help').prop("checked", Settings.showHelp);
  $('#show-coordinates').prop("checked", Settings.isCoordsEnabled);
  $("#enable-right-click").prop('checked', $.cookie('right-click') != null);
  $("#enable-debug").prop('checked', $.cookie('debug') != null);

  if (Settings.showHelp) {
    $("#help-container").show();
  } else {
    $("#help-container").hide();
  }

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
  }

  $.cookie('map-layer', mapIndex, { expires: 999 });
}

function changeCursor() {
  if (Settings.isCoordsEnabled)
    $('.leaflet-grab').css('cursor', 'pointer');
  else
    $('.leaflet-grab').css('cursor', 'grab');
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
  const el = document.createElement('textarea');
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

setInterval(function () {

  // Clock in game created by Michal__d
  var display_24 = false,
    newDate = new Date(),
    startTime = newDate.valueOf(),
    factor = 30,
    correctTime = new Date(startTime * factor);
  correctTime.setHours(correctTime.getUTCHours());
  correctTime.setMinutes(correctTime.getUTCMinutes() - 3); //for some reason time in game is 3 sec. delayed to normal time

  if (display_24) {
    $('#time-in-game').text(addZeroToNumber(correctTime.getHours()) + ":" + addZeroToNumber(correctTime.getMinutes()));
  } else {
    $('#time-in-game').text(addZeroToNumber(correctTime.getHours() % 12) + ":" + addZeroToNumber(correctTime.getMinutes()) + " " + ((correctTime.getHours() < 12) ? "AM" : "PM"));
  }

  if (correctTime.getHours() >= 22 || correctTime.getHours() < 5) {
    $('.day-cycle').css('background', 'url(assets/images/moon.png)');
  } else {
    $('.day-cycle').css('background', 'url(assets/images/sun.png)');
  }
}, 1000);

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

//Change & save language option
$("#language").on("change", function () {
  Settings.language = $("#language").val();
  $.cookie('language', Settings.language, { expires: 999 });
  Language.setMenuLanguage();
  MapBase.addMarkers();
  Menu.refreshMenu();
});

//Change & save opacity
$("#marker-opacity").on("change", function () {
  var parsed = parseFloat($("#marker-opacity").val());
  Settings.markerOpacity = parsed ? parsed : 1;
  $.cookie('marker-opacity', Settings.markerOpacity, { expires: 999 });
  MapBase.addMarkers();
});

// Toggle visibility of FME cards.
$("#fme-display").on("change", function () {
  var parsed = parseInt($("#fme-display").val());
  FME.display = !isNaN(parsed) ? parsed : 3;
  $.cookie('fme-display', FME.display, { expires: 999 });
  FME.update();
});

//Disable & enable collection category
$('.clickable').on('click', function () {
  var menu = $(this);
  if (typeof menu.data('type') === 'undefined') return;

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
  else
    MapBase.addMarkers();
});

//Disable & enable collection category
$(document).on('click', '.animal-wrapper[data-type]', function (e) {
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

  if (category == 'plants') {
    $('[data-type=' + collectible + ']').toggleClass('disabled');
    var isDisabled = menu.hasClass('disabled');

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

    if (!file) {
      alert(Language.get('alerts.file_not_found'));
      return;
    }

    file.text().then(function (text) {
      Pins.importPins(text);
    });
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

    // Remove irrelevant properties.
    delete cookies['_ga'];
    delete storage['randid'];
    delete storage['pinned-items'];

    var settings = {
      'cookies': cookies,
      'local': storage
    };

    var settingsJson = JSON.stringify(settings, null, 4);

    downloadAsFile("collectible-map-settings.json", settingsJson);
  } catch (error) {
    console.error(error);
    alert(Language.get('alerts.feature_not_supported'));
  }
});

$('#cookie-import').on('click', function () {
  try {
    var file = $('#cookie-import-file').prop('files')[0];

    if (!file) {
      alert(Language.get('alerts.file_not_found'));
      return;
    }

    file.text().then(function (res) {
      var settings = null;

      try {
        settings = JSON.parse(res);
      } catch (error) {
        alert(Language.get('alerts.file_not_valid'));
        return;
      }

      // Remove all current settings.
      $.each($.cookie(), function (key, value) {
        $.removeCookie(key);
      });

      $.each(localStorage, function (key, value) {
        localStorage.removeItem(key);
      });

      // Import all the settings from the file.
      if (typeof settings.cookies === 'undefined' && typeof settings.local === 'undefined') {
        $.each(settings, function (key, value) {
          $.cookie(key, value, { expires: 999 });
        });
      }

      $.each(settings.cookies, function (key, value) {
        $.cookie(key, value, { expires: 999 });
      });

      $.each(settings.local, function (key, value) {
        localStorage.setItem(key, value);
      });

      // Do this for now, maybe look into refreshing the menu completely (from init) later.
      location.reload();
    });
  } catch (error) {
    console.error(error);
    alert(Language.get('alerts.feature_not_supported'));
  }
});

/**
 * Tutorial logic
 */
$('[data-help]').hover(function (e) {
  var attr = $(this).attr('data-help');
  $('#help-container p').attr('data-text', `help.${attr}`).text(Language.get(`help.${attr}`));
}, function () {
  $('#help-container p').attr('data-text', `help.default`).text(Language.get(`help.default`));
});

$('#show-help').on("change", function () {
  Settings.showHelp = $("#show-help").prop('checked');
  $.cookie('show-help', Settings.isHelpEnabled ? '1' : '0', { expires: 999 });

  if (Settings.showHelp) {
    $("#help-container").show();
  } else {
    $("#help-container").hide();
  }
});

/**
 * Leaflet plugins
 */
L.DivIcon.DataMarkup = L.DivIcon.extend({
  _setIconStyles: function (img, name) {
    L.DivIcon.prototype._setIconStyles.call(this, img, name);
    if (this.options.marker)
      img.dataset.marker = this.options.marker;
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
$('*').on('contextmenu', function (event) {
  if ($.cookie('right-click') != null)
    return;
  event.preventDefault();
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
 * Event listeners
 */

$(function () {
  init();
  MapBase.loadFastTravels();
  Treasures.load();
  Encounters.load();
  Heatmap.load();
  MapBase.loadMarkers();
  FME.init();
});
