/**
 * Created by Jean on 2019-10-09.
 */

var Menu = {
  reorderMenu: function (menu) {
    $(menu).children().sort(function (a, b) {
      return a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase());
    }).appendTo(menu);
  },

  refreshEncounters: function () {
    $('.menu-hidden[data-type=encounters]').children('.collectible-wrapper').remove();

    Object.keys(Encounters.data).forEach(function (element) {
      var collectibleTitle = Language.get(`menu.${element}`);
      var collectibleElement = $('<div>').addClass('collectible-wrapper').attr('data-help', 'item').attr('data-tippy-content', collectibleTitle).attr('data-type', element);
      var collectibleTextElement = $('<p>').addClass('collectible').text(collectibleTitle);
      var collectibleImage = $('<img>').attr('src', `./assets/images/icons/${element}.png`).addClass('collectible-icon');

      if (!enabledCategories.includes(element))
        collectibleElement.addClass('disabled');

      $('.menu-hidden[data-type=encounters]').append(collectibleElement.append(collectibleImage).append(collectibleTextElement));
    });

    tippy('[data-tippy-content]', {theme: 'rdr2-theme'});
  },


  refreshTreasures: function () {
    $('.menu-hidden[data-type=treasure]').children('.collectible-wrapper').remove();

    Treasures.data.filter(function (item) {
      var collectibleTitle = Language.get(item.text);
      var collectibleElement = $('<div>').addClass('collectible-wrapper').attr('data-help', 'item').attr('data-tippy-content', collectibleTitle).attr('data-type', item.text);
      var collectibleTextElement = $('<p>').addClass('collectible').text(collectibleTitle);

      if (!Treasures.enabledTreasures.includes(item.text))
        collectibleElement.addClass('disabled');

      $('.menu-hidden[data-type=treasure]').append(collectibleElement.append(collectibleTextElement));
    });

    Menu.reorderMenu('.menu-hidden[data-type=treasure]');
    tippy('[data-tippy-content]', {theme: 'rdr2-theme'});
  },

  refreshLegendaries: function () {
    $('.menu-hidden[data-type=legendary_animals]').children('.collectible-wrapper').remove();

    Legendary.data.filter(function (item) {
      var collectibleTitle = Language.get(item.text);
      var collectibleElement = $('<div>').addClass('collectible-wrapper').attr('data-help', 'item').attr('data-tippy-content', collectibleTitle).attr('data-type', item.text);
      var collectibleTextElement = $('<p>').addClass('collectible').text(collectibleTitle);

      if (!Legendary.enabledLegendaries.includes(item.text))
        collectibleElement.addClass('disabled');

      $('.menu-hidden[data-type=legendary_animals]').append(collectibleElement.append(collectibleTextElement));
    });

    Menu.reorderMenu('.menu-hidden[data-type=legendary_animals]');
    tippy('[data-tippy-content]', {theme: 'rdr2-theme'});
  },

  refreshShops: function () {
    $('.menu-hidden[data-type=shop]').children('.collectible-wrapper').remove();

    Object.keys(MapBase.shopData).forEach(function (element) {
      var collectibleTitle = Language.get(`map.shops.${element}.name`);
      var collectibleElement = $('<div>').addClass('collectible-wrapper').attr('data-help', 'item').attr('data-tippy-content', collectibleTitle).attr('data-type', element);
      var collectibleTextElement = $('<p>').addClass('collectible').text(collectibleTitle);
      var collectibleImage = $('<img>').attr('src', `./assets/images/icons/${element}.png`).addClass('collectible-icon');

      if (!enabledShops.includes(element))
        collectibleElement.addClass('disabled');

      $('.menu-hidden[data-type=shops]').append(collectibleElement.append(collectibleImage).append(collectibleTextElement));
    });
  },

  refreshCamps: function () {
    $('.menu-hidden[data-type=camp]').children('.collectible-wrapper').remove();

    Object.keys(MapBase.campData).forEach(function (element) {
      var collectibleTitle = Language.get(`map.camps.${element}.name`);
      var collectibleElement = $('<div>').addClass('collectible-wrapper').attr('data-help', 'item').attr('data-tippy-content', collectibleTitle).attr('data-type', element);
      var collectibleTextElement = $('<p>').addClass('collectible').text(collectibleTitle);

      if (!enabledCamps.includes(element))
        collectibleElement.addClass('disabled');

      $('.menu-hidden[data-type=camps]').append(collectibleElement.append(collectibleTextElement));
    });
  },

  showHideAllPlants: function (isToHide) {
    if (isToHide) {
      enabledPlants = [];
      plantsDisabledByDefault = plants;

      $('[data-type="plants"] .collectible-wrapper').addClass('disabled');
    } else {
      enabledPlants = plants;
      plantsDisabledByDefault = [];
      $('[data-type="plants"] .collectible-wrapper').removeClass('disabled');
    }

    $.cookie('disabled-plants', plantsDisabledByDefault.join(','), { expires: 999 });
    MapBase.addMarkers();
  },

  showHideAllShops: function (isToHide) {
    if (isToHide) {
      enabledShops = [];
      shopsDisabledByDefault = shops;

      $('[data-type="shops"] .collectible-wrapper').addClass('disabled');
    } else {
      enabledShops = shops;
      shopsDisabledByDefault = [];
      $('[data-type="shops"] .collectible-wrapper').removeClass('disabled');
    }

    $.cookie('disabled-shops', shopsDisabledByDefault.join(','), { expires: 999 });
    MapBase.addMarkers();
  },

  showHideAllCamps: function (isToHide) {
    if (isToHide) {
      enabledCamps = [];
      campsDisabledByDefault = camps;

      $('[data-type="camps"] .collectible-wrapper').addClass('disabled');
    } else {
      enabledCamps = camps;
      campsDisabledByDefault = [];
      $('[data-type="camps"] .collectible-wrapper').removeClass('disabled');
    }

    $.cookie('disabled-camps', campsDisabledByDefault.join(','), { expires: 999 });
    MapBase.addMarkers();
  },
};

Menu.refreshMenu = function () {
  $('.menu-hidden[data-type]').children('.collectible-wrapper').remove();
  var anyUnavailableCategories = [];

  $.each(MapBase.markers, function (_key, marker) {
    // Only add subdata markers once.
    if (marker.subdata && $(`.menu-hidden[data-type=${marker.category}]`).children(`[data-type=${marker.subdata}]`).length > 0) return;

    var collectibleKey = marker.text;
    var collectibleText = null;
    var collectibleTitle = marker.title;
    var collectibleImage = null;

    if (marker.subdata) {
      collectibleText = marker.subdata;
      collectibleImage = $('<img>').attr('src', `./assets/images/icons/game/${collectibleKey}.png`).addClass('collectible-icon');
    } else {
      collectibleText = marker.text;
    }

    var collectibleElement = $('<div>').addClass('collectible-wrapper').attr('data-help', 'item').attr('data-tippy-content', collectibleTitle).attr('data-type', collectibleText);
    var collectibleTextWrapperElement = $('<span>').addClass('collectible-text');
    var collectibleTextElement = $('<p>').addClass('collectible').text(collectibleTitle);

    collectibleElement.on('contextmenu', function (e) {
      if ($.cookie('right-click') == null)
        e.preventDefault();
    });

    var collectibleCategory = $(`.menu-option[data-type=${marker.category}]`);
    if (marker.lat && marker.lat.length == 0) {
      if (!anyUnavailableCategories.includes(marker.category))
        anyUnavailableCategories.push(marker.category);

      collectibleElement.attr('data-help', 'item_unavailable').addClass('not-found');
      collectibleCategory.attr('data-help', 'item_category_unavailable_items').addClass('not-found');
    }

    if (collectibleCategory.hasClass('not-found') && !anyUnavailableCategories.includes(marker.category))
      collectibleCategory.attr('data-help', 'item_category').removeClass('not-found');

    if (marker.subdata) {
      var currentSubdataMarkers = MapBase.markers.filter(function (_marker) {
        if (marker.subdata != _marker.subdata)
          return false;

        return true;
      });

      if (currentSubdataMarkers.every(function (marker) { return !marker.canCollect; }))
        collectibleElement.addClass('disabled');
    } else {
      if (!marker.canCollect)
        collectibleElement.addClass('disabled');
    }

    collectibleElement.hover(function (e) {
      var language = Language.get(`help.${$(this).data('help')}`);
      $('#help-container p').text(language);
    }, function () {
      $('#help-container p').text(Language.get(`help.default`));
    });

    $(`.menu-hidden[data-type=${marker.category}]`).append(collectibleElement.append(collectibleImage).append(collectibleTextWrapperElement.append(collectibleTextElement)));
  });

  Menu.refreshEncounters();
  Menu.refreshTreasures();
  Menu.refreshShops();
  Menu.refreshCamps();
  Menu.refreshLegendaries();

  $.each(categoriesDisabledByDefault, function (key, value) {
    if (value.length > 0) {
      $('[data-type=' + value + ']').addClass('disabled');
    }
  });

  $.each(plantsDisabledByDefault, function (key, value) {
    if (value.length > 0) {
      $('[data-type=' + value + ']').addClass('disabled');
    }
  });

  Menu.reorderMenu('.menu-hidden[data-type=animals]');
  Menu.reorderMenu('.menu-hidden[data-type=birds]');
  Menu.reorderMenu('.menu-hidden[data-type=fish]');
  Menu.reorderMenu('.menu-hidden[data-type=plants]');
  Menu.reorderMenu('.menu-hidden[data-type=shops]');
  Menu.reorderMenu('.menu-hidden[data-type=camps]');
  Menu.reorderMenu('.menu-hidden[data-type=treasure]');
  Menu.reorderMenu('.menu-hidden[data-type=legendary_animals]');
  Menu.reorderMenu('.menu-hidden[data-type=encounters]');
  Menu.reorderMenu('.menu-hidden[data-type=moonshiner_missions]');

  tippy('[data-tippy-content]', {theme: 'rdr2-theme'});
};

Menu.showAll = function () {
  $.each(categoryButtons, function (key, value) {
    $(value).removeClass("disabled");
    $(`.menu-hidden[data-type=${$(value).attr('data-type')}]`).removeClass("disabled");
  });

  enabledCategories = categories;

  MapBase.addMarkers();
  Treasures.addToMap();
  Encounters.addToMap();
  Legendary.addToMap();
};

Menu.hideAll = function () {
  $.each(categoryButtons, function (key, value) {
    $(value).addClass("disabled");
    $(`.menu-hidden[data-type=${$(value).attr('data-type')}]`).addClass("disabled");
  });

  enabledCategories = [];

  MapBase.addMarkers();
  Treasures.addToMap();
  Encounters.addToMap();
  Legendary.addToMap();
  Heatmap.removeHeatmap(true);
};

// Remove highlight from all important items
$('#clear_highlights').on('click', function () {
  var tempArray = MapBase.itemsMarkedAsImportant;
  $.each(tempArray, function () {
    MapBase.highlightImportantItem(tempArray[0]);
  });
});