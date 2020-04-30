/**
 * Created by Jean on 2019-10-09.
 */

var MapBase = {
  minZoom: 2,
  maxZoom: 7,
  map: null,
  overlays: [],
  markers: [],
  importantItems: [],
  isDarkMode: false,
  fastTravelData: null,
  shopData: null,
  dailyData: null,
  updateLoopAvailable: true,
  requestLoopCancel: false,

  init: function () {

    const mapBoundary = L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176));
    //Please, do not use the GitHub map tiles. Thanks
    const mapLayers = {
      'map.layers.default':
        L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', {
          noWrap: true,
          bounds: mapBoundary,
          attribution: '<a href="https://www.rockstargames.com/" target="_blank">Rockstar Games</a>'
        }),
      'map.layers.detailed':
        L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/detailed/{z}/{x}_{y}.jpg', {
          noWrap: true,
          bounds: mapBoundary,
          attribution: '<a href="https://rdr2map.com/" target="_blank">RDR2Map</a>'
        }),
      'map.layers.dark':
        L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/darkmode/{z}/{x}_{y}.jpg', {
          noWrap: true,
          bounds: mapBoundary,
          attribution: '<a href="https://github.com/TDLCTV" target="_blank">TDLCTV</a>'
        }),
    };

    Heatmap.initLayer();

    // Override bindPopup to include mouseover and mouseout logic.
    L.Layer.include({
      bindPopup: function (content, options) {
        // TODO: Check if we can move this from here.
        if (content instanceof L.Popup) {
          Util.setOptions(content, options);
          this._popup = content;
          content._source = this;
        } else {
          if (!this._popup || options) {
            this._popup = new L.Popup(options, this);
          }
          this._popup.setContent(content);
        }

        if (!this._popupHandlersAdded) {
          this.on({
            click: this._openPopup,
            keypress: this._onKeyPress,
            remove: this.closePopup,
            move: this._movePopup
          });
          this._popupHandlersAdded = true;
        }

        this.on('mouseover', function (e) {
          if (!Settings.isPopupsHoverEnabled) return;
          this.openPopup();
        });

        this.on('mouseout', function (e) {
          if (!Settings.isPopupsHoverEnabled) return;

          var that = this;
          var timeout = setTimeout(function () {
            that.closePopup();
          }, 100);

          $('.leaflet-popup').on('mouseover', function (e) {
            clearTimeout(timeout);
            $('.leaflet-popup').off('mouseover');
          });
        });

        return this;
      }
    });

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

    L.control.layers(mapLayers).addTo(MapBase.map);

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

    Layers.oms = new OverlappingMarkerSpiderfier(MapBase.map, {
      keepSpiderfied: true
    });
    Layers.oms.addListener('spiderfy', function (markers) {
      MapBase.map.closePopup();
    });

    MapBase.loadOverlays();

    // Enable this and disable the above to see cool stuff.
    // MapBase.loadOverlaysBeta();
  },

  loadOverlays: function () {
    $.getJSON('data/overlays.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.overlays = data;
        MapBase.setOverlays(Settings.overlayOpacity);
        console.info('%c[Overlays] Loaded!', 'color: #bada55; background: #242424');
      });
  },

  setOverlays: function (opacity = 0.5) {
    Layers.overlaysLayer.clearLayers();

    if (opacity == 0) return;

    $.each(MapBase.overlays, function (key, value) {
      var overlay = `assets/overlays/${(MapBase.isDarkMode ? 'dark' : 'normal')}/${key}.png?nocache=${nocache}`;
      Layers.overlaysLayer.addLayer(L.imageOverlay(overlay, value, {
        opacity: opacity
      }));
    });

    Layers.overlaysLayer.addTo(MapBase.map);
  },

  loadOverlaysBeta: function () {
    $.getJSON('data/overlays_beta.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.overlaysBeta = data;
        MapBase.setOverlaysBeta(Settings.overlayOpacity);
        console.info('%c[Overlays] Loaded!', 'color: #bada55; background: #242424');
      });
  },

  setOverlaysBeta: function (opacity = 0.5) {
    Layers.overlaysLayer.clearLayers();

    if (opacity == 0) return;

    $.each(MapBase.overlaysBeta, function (key, value) {
      var overlay = `assets/overlays/${(MapBase.isDarkMode ? 'dark' : 'normal')}/game/${value.name}.png?nocache=${nocache}`;

      var x = (value.width / 2);
      var y = (value.height / 2);
      var scaleX = 0.00076;
      var scaleY = scaleX;

      Layers.overlaysLayer.addLayer(L.imageOverlay(overlay, [
        [(parseFloat(value.lat) + (y * scaleY)), (parseFloat(value.lng) - (x * scaleX))],
        [(parseFloat(value.lat) - (y * scaleY)), (parseFloat(value.lng) + (x * scaleX))]
      ], {
        opacity: opacity
      }));
    });

    Layers.overlaysLayer.addTo(MapBase.map);
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
          $.each(marker, function (_, submarker) {
            MapBase.markers.push(new Marker(marker.text || _key, submarker.lat, submarker.lng, _category, _key));
          });
        } else {
          MapBase.markers.push(new Marker(marker.text || _category, marker.lat, marker.lng, _category, null, marker.time));
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
      if (goTo === undefined || goTo === null) return;

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

    var baseMarkers = MapBase.markers.filter(_m => enabledCategories.includes(_m.category) && _m.category != 'plants');
    var plantMarkers = MapBase.markers.filter(_m => enabledCategories.includes('plants') && enabledPlants.includes(_m.subdata) && _m.category == 'plants');

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
    MapBase.addShops();

    Treasures.addToMap();
    Encounters.addToMap();
    MadamNazar.addMadamNazar();

    if (refreshMenu)
      Menu.refreshMenu();
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
      case "daily_locations":
      case "sightseeing":
        return "lightgray";
      default:
        return "red";
    }
  },

  updateMarkerContent: function (marker) {
    var popupContent = marker.description;

    if (marker.category == 'hideouts') {
      var time = marker.time + '';
      var timeString = '';

      if (time.indexOf("1") >= 0)
        timeString += Language.get('map.hideouts.desc.sunrise') + ', ';
      if (time.indexOf("2") >= 0)
        timeString += Language.get('map.hideouts.desc.day') + ', ';
      if (time.indexOf("3") >= 0)
        timeString += Language.get('map.hideouts.desc.sunset') + ', ';
      if (time.indexOf("4") >= 0)
        timeString += Language.get('map.hideouts.desc.night') + ', ';

      timeString = timeString.substring(0, timeString.length - 2);

      popupContent = Language.get(`map.hideouts.desc`).replace('{times}', timeString);
    }

    // TODO: Fix later. :-)
    // var shareText = `<a href="javascript:void(0)" onclick="setClipboardText('https://jeanropke.github.io/RDOMap/?m=${marker.text}')">${Language.get('map.copy_link')}</a>`;
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
      opacity: opacity,
      icon: new L.DivIcon.DataMarkup({
        iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
        iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
        popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
        html: `
          ${overlay}
          <img class="icon" src="${icon}" alt="Icon">
          <img class="background" src="${background}" alt="Background">
          ${shadow}
        `,
        marker: marker.text,
        category: marker.category,
        time: marker.time
      })
    });

    marker.isVisible = true;
    tempMarker.id = marker.text;
    tempMarker.bindPopup(MapBase.updateMarkerContent(marker), {
      minWidth: 300,
      maxWidth: 400
    });

    Layers.itemMarkersLayer.addLayer(tempMarker);
    if (Settings.markerCluster)
      Layers.oms.addMarker(tempMarker);
  },

  createCanvasMarker: function (marker, opacity = 1) {
    if (!uniqueSearchMarkers.includes(marker)) return;
    if (!enabledCategories.includes(marker.category)) return;

    var tempMarker = L.marker([marker.lat, marker.lng], {
      opacity: opacity,
      icon: new L.divIcon({
        iconUrl: `assets/images/markers/${marker.text}.png`,
        iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
        iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
        popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize]
      })
    });

    marker.isVisible = true;
    tempMarker.id = marker.text;
    tempMarker.bindPopup(MapBase.updateMarkerContent(marker), {
      minWidth: 300,
      maxWidth: 400
    });

    return tempMarker;
  },

  gameToMap: function (lat, lng, name = "Debug Marker") {
    MapBase.debugMarker((0.01552 * lng + -63.6), (0.01552 * lat + 111.29), name);
  },

  game2Map: function ({
    x,
    y,
    z
  }) {
    MapBase.debugMarker((0.01552 * y + -63.6), (0.01552 * x + 111.29), z);
  },

  loadFastTravels: function () {
    $.getJSON('data/fasttravels.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.fastTravelData = data;
      });
    console.info('%c[Fast travels] Loaded!', 'color: #bada55; background: #242424');
  },

  addFastTravelMarker: function () {
    if (enabledCategories.includes('fast_travel')) {
      $.each(MapBase.fastTravelData, function (key, value) {
        var shadow = Settings.isShadowsEnabled ? '<img class="shadow" width="' + 35 * Settings.markerSize + '" height="' + 16 * Settings.markerSize + '" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
        var marker = L.marker([value.x, value.y], {
          icon: L.divIcon({
            iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
            iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
            popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
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

  loadShops: function () {
    $.getJSON('data/shops.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.shopData = data;
      });
    console.info('%c[Shops] Loaded!', 'color: #bada55; background: #242424');
  },

  addShops: function () {
    if (enabledCategories.includes('shops')) {
      $.each(MapBase.shopData, function (category, categoryValue) {
        if (!enabledShops.includes(category)) return;
        $.each(categoryValue, function (key, value) {
          var shadow = Settings.isShadowsEnabled ? '<img class="shadow" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
          var marker = L.marker([value.lat, value.lng], {
            opacity: Settings.markerOpacity,
            icon: L.divIcon({
              iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
              iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
              popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
              html: `
                <img class="icon" src="./assets/images/icons/${category}.png" alt="Icon">
                <img class="background" src="./assets/images/icons/marker_black.png" alt="Background">
                ${shadow}
              `
            })
          });

          marker.bindPopup(`<h1>${Language.get(`map.shops.${category}.name`)}</h1><p>${Language.get(`map.shops.${value.text}.desc`)} ${Language.get(`map.shops.${category}.desc`)}</p>`);

          Layers.itemMarkersLayer.addLayer(marker);
        });
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
    var shadow = Settings.isShadowsEnabled ? '<img class="shadow" width="' + 35 * Settings.markerSize + '" height="' + 16 * Settings.markerSize + '" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
    var marker = L.marker([lat, long], {
      icon: L.divIcon({
        iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
        iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
        popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
        html: `
          <img class="icon" src="./assets/images/icons/random.png" alt="Icon">
          <img class="background" src="./assets/images/icons/marker_darkblue.png" alt="Background">
          ${shadow}
        `
      })
    });

    marker.bindPopup(`<h1>${name}</h1><p>Lat.: ${lat}<br>Long.: ${long}</p>`, {
      minWidth: 300
    });
    Layers.itemMarkersLayer.addLayer(marker);
  },

  testData: {
    max: 10,
    data: []
  },
  heatmapCount: 10,
  addCoordsOnMap: function (coords) {
    // Show clicked coordinates (like google maps)
    if (Settings.isCoordsEnabled) {
      $('.lat-lng-container').css('display', 'block');

      $('.lat-lng-container p').html(`Latitude: ${parseFloat(coords.latlng.lat.toFixed(4))}<br>Longitude: ${parseFloat(coords.latlng.lng.toFixed(4))}`);

      $('#lat-lng-container-close-button').click(function () {
        $('.lat-lng-container').css('display', 'none');
      });
    }

    if (Settings.isDebugEnabled) {
      console.log(`{"lat":"${coords.latlng.lat.toFixed(4)}","lng":"${coords.latlng.lng.toFixed(4)}","count":"${MapBase.heatmapCount}"},`);
      MapBase.testData.data.push({
        lat: coords.latlng.lat.toFixed(4),
        lng: coords.latlng.lng.toFixed(4),
        count: MapBase.heatmapCount
      });
      Layers.heatmapLayer.setData(MapBase.testData);
    }

    if (Settings.isPinsPlacingEnabled)
      Pins.addPin(coords.latlng.lat, coords.latlng.lng);
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