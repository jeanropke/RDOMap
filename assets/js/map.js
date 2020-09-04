const MapBase = {
  minZoom: Settings.isDebugEnabled ? 0 : 2,
  maxZoom: Settings.isDebugEnabled ? 10 : 7,
  map: null,
  overlays: [],
  isDarkMode: false,
  interiors: false,
  updateLoopAvailable: true,
  requestLoopCancel: false,
  showAllMarkers: false,
  filtersData: [],
  isPrewviewMode: false,

  init: function () {
    'use strict';

    const mapBoundary = L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176));
    //Please, do not use the GitHub map tiles. Thanks
    const mapLayers = {
      'map.layers.default': L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://www.rockstargames.com/" target="_blank">Rockstar Games</a>'
      }),
      'map.layers.detailed': L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/detailed/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://rdr2map.com/" target="_blank">RDR2Map</a>'
      }),
      'map.layers.dark': L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/darkmode/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://github.com/TDLCTV" target="_blank">TDLCTV</a>'
      }),
      'map.layers.black': L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/black/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://github.com/AdamNortonUK" target="_blank">AdamNortonUK</a>'
      }),
    };

    // Override bindPopup to include mouseover and mouseout logic.
    L.Layer.include({
      bindPopup: function (content, options) {
        // TODO: Check if we can move this from here.
        if (content instanceof L.Popup) {
          L.Util.setOptions(content, options);
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

          const that = this;
          const timeout = setTimeout(function () {
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
      layers: [mapLayers[Settings.baseLayer]],
    }).setView([-70, 111.75], 3);

    MapBase.map.addControl(
      L.control.attribution({
        position: 'bottomright',
        prefix: '<a target="_blank" href="https://github.com/jeanropke/RDR2CollectorsMap/blob/master/CONTRIBUTORS.md" data-text="map.attribution_prefix">Collectors Map Contributors</a>'
      })
    );

    L.control.zoom({
      position: 'bottomright'
    }).addTo(MapBase.map);

    L.control.layers(mapLayers).addTo(MapBase.map);

    // Leaflet leaves the layer names here, with a space in front of them.
    $('.leaflet-control-layers-list span').each(function (index, node) {
      // Move the layer name (which is chosen to be our language key) into a
      // new tightly fitted span for use with our localization.
      const langKey = node.textContent.trim();
      $(node).html([' ', $('<span>').attr('data-text', langKey).text(langKey)]);
    });

    MapBase.map.on('baselayerchange', function (e) {
      Settings.baseLayer = e.name;
      MapBase.setMapBackground();
    });

    $('#overlay-opacity').val(Settings.overlayOpacity);
    $("#overlay-opacity").on("change", function () {
      Settings.overlayOpacity = Number($("#overlay-opacity").val());
      MapBase.setOverlays();
    });

    MapBase.map.on('click', function (e) {
      MapBase.addCoordsOnMap(e);
    });

    MapBase.map.doubleClickZoom[Settings.isDoubleClickZoomEnabled ? 'enable' : 'disable']();

    const southWest = L.latLng(-160, -120),
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
    Layers.debugLayer.addTo(MapBase.map);

    // Enable this and disable the above to see cool stuff.
    // MapBase.loadOverlaysBeta();
    MapBase.setMapBackground();
  },

  setMapBackground: function () {
    'use strict';
    MapBase.isDarkMode = ['map.layers.dark', 'map.layers.black'].includes(Settings.baseLayer) ? true : false;
    $('#map').css('background-color', MapBase.isDarkMode ? (Settings.baseLayer === 'map.layers.black' ? '#000' : '#3d3d3d') : '#d2b790');
    MapBase.setOverlays();
  },

  runOncePostLoad: function () {
    var quickParam = getParameterByName('q');
    if (quickParam) {
      $('.menu-toggle').remove();
      $('.top-widget').remove();
      $('#fme-container').remove();
      $('.side-menu').removeClass('menu-opened');
      $('.leaflet-top.leaflet-right, .leaflet-control-zoom').remove();

      this.isPrewviewMode = true;

      this.disableAll();

      if (Location.quickParams.indexOf(quickParam) !== -1) {
        Location.locations.filter(item => item.key == quickParam)[0].onMap = true;
      }
      else if (Camp.quickParams.indexOf(quickParam) !== -1) {
        Camp.locations.filter(item => item.key == quickParam)[0].onMap = true;
      }
      else if (Camp.quickParams.indexOf(quickParam) !== -1) {
        Camp.locations.filter(item => item.key == quickParam)[0].onMap = true;
      }
      else if (Shop.quickParams.indexOf(quickParam) !== -1) {
        Shop.locations.filter(item => item.key == quickParam)[0].onMap = true;
      }
      else if (Encounter.quickParams.indexOf(quickParam) !== -1) {
        Encounter.locations.filter(item => item.key == quickParam)[0].onMap = true;
      }
      else if (GunForHire.quickParams.indexOf(quickParam) !== -1) {
        GunForHire.locations.filter(item => item.key == quickParam)[0].onMap = true;
      }
      else if (AnimalCollection.quickParams.indexOf(quickParam) !== -1) {
        AnimalCollection.collection.filter(collection => collection.animals.filter(
          animal => { if (animal.key == quickParam) animal.isEnabled = true }))
      }
      else if (Legendary.quickParams.indexOf(quickParam) !== -1) {
        Legendary.animals.filter(item => {
          if (item.text == quickParam) {
            item.onMap = true;
            MapBase.map.setView({ lat: item.x, lng: item.y }, 5);
          }
        });
      }
      else if (quickParam == 'nazar') {
        MadamNazar.onMap = true;
        MapBase.map.setView({
          lat: MadamNazar.possibleLocations[MadamNazar.currentLocation].x,
          lng: MadamNazar.possibleLocations[MadamNazar.currentLocation].y
        }, 5);
      }
      else if (Treasure.quickParams.indexOf(quickParam) !== -1) {
        Treasure.treasures.filter(item => {
          if (item.text == quickParam) {
            item.onMap = true;
            MapBase.map.setView({ lat: item.x, lng: item.y }, 5);
          }
        });
      }
    }
  },

  disableAll: function (toShow = false) {
    Camp.locations.forEach(camp => camp.onMap = toShow);
    Encounter.locations.forEach(encounter => encounter.onMap = toShow);
    GunForHire.locations.forEach(gfh => gfh.onMap = toShow);
    Location.locations.forEach(location => location.onMap = toShow);
    Legendary.animals.forEach(animal => animal.onMap = toShow);
    MadamNazar.onMap = toShow;
    Shop.locations.forEach(shop => shop.onMap = toShow);
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

  gameToMap: function (lat, lng, name = "Debug Marker") {
    MapBase.debugMarker((0.01552 * lng + -63.6).toFixed(4), (0.01552 * lat + 111.29).toFixed(4), name);
  },

  game2Map: function ({
    x,
    y,
    z
  }) {
    MapBase.debugMarker((0.01552 * y + -63.6).toFixed(4), (0.01552 * x + 111.29).toFixed(4), z);
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
      }),
      draggable: Settings.isDebugEnabled
    });

    marker.bindPopup(`<h1>${name}</h1><p>Lat.: ${lat}<br>Long.: ${long}</p>`, {
      minWidth: 300
    });
    Layers.debugLayer.addLayer(marker);
  },

  testData: {
    max: 10,
    data: []
  },
  heatmapCount: 10,
  addCoordsOnMap: function (coords) {
    // Show clicked coordinates (like google maps)
    if (Settings.isCoordsOnClickEnabled) {
      $('.lat-lng-container').css('display', 'block');

      $('.lat-lng-container p').html(`Latitude: ${parseFloat(coords.latlng.lat.toFixed(4))}<br>Longitude: ${parseFloat(coords.latlng.lng.toFixed(4))}`);

      $('#lat-lng-container-close-button').click(function () {
        $('.lat-lng-container').css('display', 'none');
      });
    }

    if (false && Settings.isDebugEnabled) {
      console.log(`{"lat":"${coords.latlng.lat.toFixed(4)}","lng":"${coords.latlng.lng.toFixed(4)}","count":"${MapBase.heatmapCount}"},`);
      MapBase.testData.data.push({
        lat: coords.latlng.lat.toFixed(4),
        lng: coords.latlng.lng.toFixed(4),
        count: MapBase.heatmapCount
      });
      Layers.heatmapLayer.setData(MapBase.testData);
    }

    if (Settings.isPinsPlacingEnabled)
      Pins.addPin({ lat: coords.latlng.lat, lng: coords.latlng.lng });
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