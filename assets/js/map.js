/**
 * Created by Jean on 2019-10-09.
 */

var MapBase = {
  minZoom: 2,
  maxZoom: 7,
  map: null,
  markers: [],
  itemsMarkedAsImportant: [],
  isDarkMode: false,

  init: function () {

    //Please, do not use the GitHub map tiles. Thanks
    var mapLayers = [
      L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', {
        noWrap: true,
        bounds: L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176)),
        attribution: '<a href="https://www.rockstargames.com/" target="_blank">Rockstar Games</a>'
      }),
      L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/detailed/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176)),
        attribution: '<a href="https://rdr2map.com/" target="_blank">RDR2Map</a>'
      }),
      L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/darkmode/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176)),
        attribution: '<a href="https://github.com/TDLCTV" target="_blank">TDLCTV</a>'
      })
    ];

    Heatmap.initLayer();

    MapBase.map = L.map('map', {
      preferCanvas: true,
      attributionControl: false,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      zoomControl: false,
      crs: L.CRS.Simple,
      layers: [mapLayers[parseInt($.cookie('map-layer'))], Layers.heatmapLayer]
    }).setView([-70, 111.75], 3);

    MapBase.map.addControl(
      L.control.attribution({
        position: 'bottomleft',
        prefix: '<span data-text="map.attribution_prefix">Tiles provided by</span>'
      })
    );

    L.control.zoom({
      position: 'bottomright'
    }).addTo(MapBase.map);

    var baseMapsLayers = {
      'map.layers.default': mapLayers[0],
      'map.layers.detailed': mapLayers[1],
      'map.layers.dark': mapLayers[2]
    };

    L.control.layers(baseMapsLayers).addTo(MapBase.map);

    MapBase.map.on('baselayerchange', function (e) {
      var mapIndex;

      switch (e.name) {
        case 'map.layers.default':
          mapIndex = 0;
          break;
        case 'map.layers.dark':
          mapIndex = 2;
          break;
        case 'map.layers.detailed':
        default:
          mapIndex = 1;
          break;
      }

      setMapBackground(mapIndex);
    });

    MapBase.map.on('click', function (e) {
      MapBase.addCoordsOnMap(e);
    });

    if (Settings.isDoubleClickZoomEnabled) {
      MapBase.map.doubleClickZoom.enable();
    } else {
      MapBase.map.doubleClickZoom.disable();
    }

    var southWest = L.latLng(-160, -50),
      northEast = L.latLng(25, 250),
      bounds = L.latLngBounds(southWest, northEast);
    MapBase.map.setMaxBounds(bounds);

    Layers.oms = new OverlappingMarkerSpiderfier(MapBase.map, { keepSpiderfied: true });
    Layers.oms.addListener('spiderfy', function (markers) {
      MapBase.map.closePopup();
    });
  },

  loadMarkers: function () {
    $.getJSON('data/items.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.setMarkers(data);
      });
  },

  setMarkers: function (data) {
    if (Settings.isDebugEnabled)
      console.log(`Categories disabled: ${categoriesDisabledByDefault}`);

    $.each(data, function (_category, _markers) {
      $.each(_markers, function (_key, marker) {
        if (Array.isArray(marker)) {
          $.each(marker, function (_, submarkers) {
            MapBase.markers.push(new Marker(_key, submarkers.lat, submarkers.lng, _category, _key, submarkers.count));
          });
        } else {
          MapBase.markers.push(new Marker(_category, marker.lat, marker.lng, _category));
        }
      });
    });
    uniqueSearchMarkers = MapBase.markers;

    MapBase.addMarkers(true);

    // Do search via URL.
    var searchParam = getParameterByName('search');
    if (searchParam != null && searchParam) {
      $('#search').val(searchParam);
      MapBase.onSearch(searchParam);
    }

    // Navigate to marker via URL.
    var markerParam = getParameterByName('m');
    if (markerParam != null && markerParam != '') {
      var goTo = MapBase.markers.filter(_m => _m.text == markerParam)[0];

      //if a marker is passed on url, check if is valid
      if (typeof goTo == 'undefined' || goTo == null) return;

      //set map view with marker lat & lng
      MapBase.map.setView([goTo.lat, goTo.lng], 6);

      //check if marker category is enabled, if not, enable it
      if (Layers.itemMarkersLayer.getLayerById(goTo.text) == null) {
        enabledCategories.push(goTo.category);
        MapBase.addMarkers();
        $(`[data-type="${goTo.category}"]`).removeClass('disabled');
      }

      //open marker popup
      Layers.itemMarkersLayer.getLayerById(goTo.text).openPopup();
    }
  },

  onSearch: function (searchString) {
    searchTerms = [];
    $.each(searchString.split(';'), function (key, value) {
      if ($.inArray(value.trim(), searchTerms) == -1) {
        if (value.length > 0)
          searchTerms.push(value.trim());
      }
    });

    if (searchTerms.length == 0) {
      uniqueSearchMarkers = MapBase.markers;
    } else {
      Layers.itemMarkersLayer.clearLayers();
      Layers.plantsLayer.clearLayers();
      var searchMarkers = [];
      uniqueSearchMarkers = [];
      $.each(searchTerms, function (id, term) {
        searchMarkers = searchMarkers.concat(MapBase.markers.filter(function (_marker) {
          if (_marker.title != null)
            return _marker.title.toLowerCase().includes(term.toLowerCase());
        }));

        $.each(searchMarkers, function (i, el) {
          if ($.inArray(el, uniqueSearchMarkers) === -1) uniqueSearchMarkers.push(el);
        });
      });
    }

    MapBase.addMarkers();
  },

  addMarkers: function (refreshMenu = false) {
    Layers.plantsLayer.addTo(MapBase.map);

    if (Layers.itemMarkersLayer != null)
      Layers.itemMarkersLayer.clearLayers();
    if (Layers.plantsLayer != null)
      Layers.plantsLayer.clearLayers();
    if (Layers.miscLayer != null)
      Layers.miscLayer.clearLayers();

    var opacity = Settings.markerOpacity;

    var baseMarkers = MapBase.markers.filter(_m => { return enabledCategories.includes(_m.category) && _m.category != 'plants'; });
    var plantMarkers = MapBase.markers.filter(_m => { return enabledCategories.includes('plants') && enabledPlants.includes(_m.subdata) && _m.category == 'plants'; });

    $.each(baseMarkers, function (key, marker) {
      //Set isVisible to false. addMarkerOnMap will set to true if needs
      marker.isVisible = false;

      if (marker.subdata != null)
        if (categoriesDisabledByDefault.includes(marker.subdata))
          return;

      MapBase.addMarkerOnMap(marker, opacity);
    });

    if (plantMarkers.length > 0) {
      var plantMarkersInst = [];
      MapBase.yieldingLoop(plantMarkers.length, 25, function (i) {
        var marker = plantMarkers[i];
        marker.isVisible = false;
        var markerInst = MapBase.createCanvasMarker(marker, opacity);
        if (typeof markerInst == 'undefined') return;
        plantMarkersInst.push(markerInst);
      }, function () {
        Layers.plantsLayer.addLayers(plantMarkersInst);
      });
    }

    Layers.itemMarkersLayer.addTo(MapBase.map);
    Layers.pinsLayer.addTo(MapBase.map);

    MapBase.addFastTravelMarker();

    Treasures.addToMap();
    Encounters.addToMap();

    if (refreshMenu)
      Menu.refreshMenu();

    MapBase.loadImportantItems();
  },

  removeItemFromMap: function (text, subdata, category) {
    if (category == 'treasure') {
      if (Treasures.enabledTreasures.includes(text))
        Treasures.enabledTreasures = $.grep(Treasures.enabledTreasures, function (treasure) {
          return treasure !== text;
        });
      else
        Treasures.enabledTreasures.push(text);

      $(`[data-type=${text}]`).toggleClass('disabled');

      Treasures.addToMap();
      Treasures.save();
    }
  },

  getIconColor: function (value) {
    switch (value) {
      case "campfires":
        return "cadetblue";
      case "hideouts":
        return "darkred";
      case "boats":
        return "darkblue";
      case "trains":
        return "darkblue";
      case "plants":
        return "green";
      default:
        return "red";
    }
  },

  updateMarkerContent: function (marker) {
    var popupContent = marker.description;

    // TODO: Fix later. :-)
    // var shareText = `<a href="javascript:void(0)" onclick="setClipboardText('https://jeanropke.github.io/RDOMap/?m=${marker.text}')">${Language.get('map.copy_link')}</a>`;
    // var importantItem = ` | <a href="javascript:void(0)" onclick="MapBase.highlightImportantItem('${marker.text || marker.subdata}', '${marker.category}')">${Language.get('map.mark_important')}</a>`;
    // var linksElement = $('<p>').addClass('marker-popup-links').append(shareText).append(importantItem);
    var linksElement = $('<p>');
    var debugDisplayLatLng = $('<small>').text(`Latitude: ${marker.lat} / Longitude: ${marker.lng}`);

    return `<h1>${marker.title}</h1>
        <span class="marker-content-wrapper">
        <p>${popupContent}</p>
        </span>
        ${linksElement.prop('outerHTML')}
        ${Settings.isDebugEnabled ? debugDisplayLatLng.prop('outerHTML') : ''}
        `;
  },

  addMarkerOnMap: function (marker, opacity = 1) {
    if (!uniqueSearchMarkers.includes(marker)) return;
    if (!enabledCategories.includes(marker.category)) return;

    var overlay = '';
    var icon = `./assets/images/icons/${marker.category}.png`;
    var background = `./assets/images/icons/marker_${MapBase.getIconColor(marker.category)}.png`;
    var shadow = Settings.isShadowsEnabled ? '<img class="shadow" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';

    // Height overlays
    if (marker.height == '1') {
      overlay = '<img class="overlay" src="./assets/images/icons/overlay_high.png" alt="Overlay">';
    }

    if (marker.height == '-1') {
      overlay = '<img class="overlay" src="./assets/images/icons/overlay_low.png" alt="Overlay">';
    }

    var tempMarker = L.marker([marker.lat, marker.lng], {
      opacity: marker.canCollect ? opacity : opacity / 3,
      icon: new L.DivIcon.DataMarkup({
        iconSize: [35, 45],
        iconAnchor: [17, 42],
        popupAnchor: [1, -32],
        shadowAnchor: [10, 12],
        html: `
          ${overlay}
          <img class="icon" src="${icon}" alt="Icon">
          <img class="background" src="${background}" alt="Background">
          ${shadow}
        `,
        marker: marker.text
      })
    });

    marker.isVisible = true;
    tempMarker.id = marker.text;
    tempMarker.bindPopup(MapBase.updateMarkerContent(marker), { minWidth: 300, maxWidth: 400 });

    Layers.itemMarkersLayer.addLayer(tempMarker);
    if (Settings.markerCluster)
      Layers.oms.addMarker(tempMarker);

    MapBase.loadImportantItems();
  },

  createCanvasMarker: function (marker, opacity = 1) {
    if (!uniqueSearchMarkers.includes(marker)) return;
    if (!enabledCategories.includes(marker.category)) return;

    var tempMarker = L.marker([marker.lat, marker.lng], {
      opacity: marker.canCollect ? opacity : opacity / 3,
      icon: new L.divIcon({
        iconUrl: `assets/images/markers/plants.png`,
        iconSize: [30, 40],
        iconAnchor: [17, 42],
        popupAnchor: [1, -32]
      })
    });

    marker.isVisible = true;
    tempMarker.id = marker.text;
    tempMarker.bindPopup(MapBase.updateMarkerContent(marker), { minWidth: 300, maxWidth: 400 });

    return tempMarker;
  },

  gameToMap: function (lat, lng, name = "Debug Marker") {
    MapBase.debugMarker((0.01552 * lng + -63.6), (0.01552 * lat + 111.29), name);
  },

  game2Map: function ({ x, y, z }) {
    MapBase.debugMarker((0.01552 * y + -63.6), (0.01552 * x + 111.29), z);
  },

  highlightImportantItem(text, category) {
    if (category === 'american_flowers' || category === 'bird_eggs')
      text = text.replace(/(egg_|flower_)(\w+)(_\d)/, '$2');

    $(`[data-type=${text}]`).toggleClass('highlight-important-items-menu');

    if (text === 'eagle') // prevent from highlight eagle coins and eggs together
      text = 'egg_eagle';

    $(`[data-marker*=${text}]`).toggleClass('highlight-items');

    if ($(`[data-marker*=${text}].highlight-items`).length)
      MapBase.itemsMarkedAsImportant.push(text);
    else
      MapBase.itemsMarkedAsImportant.splice(MapBase.itemsMarkedAsImportant.indexOf(text), 1);

    $.each(localStorage, function (key) {
      localStorage.removeItem('importantItems');
    });

    localStorage.setItem('importantItems', JSON.stringify(MapBase.itemsMarkedAsImportant));
  },

  loadImportantItems() {
    if (typeof localStorage.importantItems === 'undefined')
      localStorage.importantItems = "[]";

    MapBase.itemsMarkedAsImportant = JSON.parse(localStorage.importantItems) || [];

    $.each(MapBase.itemsMarkedAsImportant, function (key, value) {
      $(`[data-marker*=${value}]`).addClass('highlight-items');
      $(`[data-type=${value}]`).addClass('highlight-important-items-menu');
    });
  },

  loadFastTravels: function () {
    $.getJSON('data/fasttravels.json?nocache=' + nocache)
      .done(function (data) {
        fastTravelData = data;
      });
    console.info('%c[Fast travels] Loaded!', 'color: #bada55; background: #242424');
  },

  addFastTravelMarker: function () {
    if (enabledCategories.includes('fast_travel')) {
      $.each(fastTravelData, function (key, value) {
        var shadow = Settings.isShadowsEnabled ? '<img class="shadow" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
        var marker = L.marker([value.x, value.y], {
          icon: L.divIcon({
            iconSize: [35, 45],
            iconAnchor: [17, 42],
            popupAnchor: [1, -32],
            shadowAnchor: [10, 12],
            html: `
              <img class="icon" src="./assets/images/icons/fast_travel.png" alt="Icon">
              <img class="background" src="./assets/images/icons/marker_gray.png" alt="Background">
              ${shadow}
            `
          })
        });

        marker.bindPopup(`<h1>${Language.get(value.text + '.name')}</h1>`);

        Layers.itemMarkersLayer.addLayer(marker);
      });
    }
  },

  submitDebugForm: function () {
    var lat = $('input[name=debug-marker-lat]').val();
    var lng = $('input[name=debug-marker-lng]').val();
    if (!isNaN(lat) && !isNaN(lng))
      MapBase.debugMarker(lat, lng);
  },

  debugMarker: function (lat, long, name = 'Debug Marker') {
    var shadow = Settings.isShadowsEnabled ? '<img class="shadow" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
    var marker = L.marker([lat, long], {
      icon: L.divIcon({
        iconSize: [35, 45],
        iconAnchor: [17, 42],
        popupAnchor: [1, -32],
        shadowAnchor: [10, 12],
        html: `
          <img class="icon" src="./assets/images/icons/random.png" alt="Icon">
          <img class="background" src="./assets/images/icons/marker_darkblue.png" alt="Background">
          ${shadow}
        `
      })
    });
    var customMarkerName = ($('#debug-marker-name').val() != '' ? $('#debug-marker-name').val() : name);
    marker.bindPopup(`<h1>${customMarkerName}</h1><p>Lat.: ${lat}<br>Long.: ${long}</p>`, { minWidth: 300, maxWidth: 400 });
    Layers.itemMarkersLayer.addLayer(marker);
    var tempArray = [];
    tempArray.push(lat || 0, long || 0, customMarkerName);
    debugMarkersArray.push(tempArray);
  },

  addCoordsOnMap: function (coords) {
    // Show clicked coordinates (like google maps)
    if (Settings.isCoordsEnabled) {
      $('.lat-lng-container').css('display', 'block');

      $('.lat-lng-container p').html(`Latitude: ${parseFloat(coords.latlng.lat.toFixed(4))}<br>Longitude: ${parseFloat(coords.latlng.lng.toFixed(4))}`);

      $('#lat-lng-container-close-button').click(function () {
        $('.lat-lng-container').css('display', 'none');
      });

      // Auto fill debug markers inputs
      Menu.liveUpdateDebugMarkersInputs(coords.latlng.lat, coords.latlng.lng);
    }

    if (Settings.isPinsPlacingEnabled)
      Pins.addPin(coords.latlng.lat, coords.latlng.lng);
  },

  formatDate: function (date) {
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var _day = date.split('/')[2];
    var _month = monthNames[date.split('/')[1] - 1];
    var _year = date.split('/')[0];
    return `${_month} ${_day}, ${_year}`;
  },

  yieldingLoop: function (count, chunksize, callback, finished) {
    var i = 0;
    (function chunk() {
      var end = Math.min(i + chunksize, count);
      for (; i < end; ++i) {
        callback.call(null, i);
      }
      if (i < count) {
        setTimeout(chunk, 0);
      } else {
        finished.call(null);
      }
    })();
  }
};