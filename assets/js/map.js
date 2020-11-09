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
  isPreviewMode: false,
  colorOverride: null,

  init: function () {
    'use strict';

    this.tippyInstances = [];
    const mapBoundary = L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176));

    //Please, do not use the GitHub map tiles. Thanks
    const mapLayers = {
      'map.layers.default': L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://www.rockstargames.com/" target="_blank">Rockstar Games</a>',
      }),
      'map.layers.detailed': L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/detailed/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://rdr2map.com/" target="_blank">RDR2Map</a>',
      }),
      'map.layers.dark': L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/darkmode/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://github.com/TDLCTV" target="_blank">TDLCTV</a>',
      }),
      'map.layers.black': L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/black/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://github.com/AdamNortonUK" target="_blank">AdamNortonUK</a>',
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
            move: this._movePopup,
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
      },
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
        prefix: '<a target="_blank" href="https://github.com/jeanropke/RDR2CollectorsMap/blob/master/CONTRIBUTORS.md" data-text="map.attribution_prefix">Collectors Map Contributors</a>',
      })
    );

    L.control.zoom({
      position: 'bottomright',
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

      Discoverable.updateLayers();
      Overlay.onSettingsChanged();
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
      keepSpiderfied: true,
    });
    Layers.oms.addListener('spiderfy', function (markers) {
      MapBase.map.closePopup();
    });

    Layers.debugLayer.addTo(MapBase.map);

    // Enable this and disable the above to see cool stuff.
    // MapBase.loadOverlaysBeta();
    MapBase.setMapBackground();
  },

  setMapBackground: function () {
    'use strict';
    MapBase.isDarkMode = ['map.layers.dark', 'map.layers.black'].includes(Settings.baseLayer) ? true : false;
    $('#map').css('background-color', (() => {
      if (MapBase.isDarkMode)
        return Settings.baseLayer === 'map.layers.black' ? '#000' : '#3d3d3d';
      else
        return '#d2b790';
    }));
  },

  beforeLoad: function () {
    // Sets all marker colors (except for plant markers) to static color.
    var colorParam = getParameterByName('c');
    if (colorParam) {
      const validColors = [
        'aquagreen', 'beige', 'black', 'blue', 'brown', 'cadetblue', 'darkblue', 'darkgreen', 'darkorange', 'darkpurple',
        'darkred', 'gray', 'green', 'lightblue', 'lightdarkred', 'lightgray', 'lightgreen', 'lightorange', 'lightred',
        'orange', 'pink', 'purple', 'red', 'white', 'yellow'
      ];

      if (validColors.includes(colorParam)) this.colorOverride = colorParam;
    }

    // Sets the map's default zoom level to anywhere between minZoom and maxZoom.
    var zoomParam = Number.parseInt(getParameterByName('z'));
    if (!isNaN(zoomParam) && MapBase.minZoom <= zoomParam && zoomParam <= MapBase.maxZoom) {
      MapBase.map.setZoom(zoomParam);
    }

    // Pans the map to a specific coordinate location on the map for default focussing.
    var flyParam = getParameterByName('ft');
    if (flyParam) {
      const latLng = flyParam.split(',');
      if (latLng.filter(Number).length === 2)
        MapBase.map.flyTo(latLng);
    }

    var quickParam = getParameterByName('q');
    if (quickParam) this.isPreviewMode = true;
  },

  afterLoad: function () {
    // Preview mode parameter.
    var quickParam = getParameterByName('q');
    if (quickParam) {
      $('.menu-toggle').remove();
      $('.top-widget').remove();
      $('#fme-container').remove();
      $('.side-menu').removeClass('menu-opened');
      $('.leaflet-top.leaflet-right, .leaflet-control-zoom').remove();

      this.disableAll();

      function locationMarkerFilter(item) {
        if (item.key !== quickParam) return;
        item.onMap = true;
        if (item.markers.length !== 1) return;
        MapBase.map.setView({ lat: item.markers[0].lat, lng: item.markers[0].lng }, 5);
      }

      if (Location.quickParams.indexOf(quickParam) !== -1) {
        Location.locations.filter(locationMarkerFilter);
      } else if (Camp.quickParams.indexOf(quickParam) !== -1) {
        Camp.locations.filter(locationMarkerFilter);
      } else if (Shop.quickParams.indexOf(quickParam) !== -1) {
        Shop.locations.filter(locationMarkerFilter);
      } else if (Encounter.quickParams.indexOf(quickParam) !== -1) {
        Encounter.locations.filter(locationMarkerFilter);
      } else if (GunForHire.quickParams.indexOf(quickParam) !== -1) {
        GunForHire.locations.filter(locationMarkerFilter);
      } else if (AnimalCollection.quickParams.indexOf(quickParam) !== -1) {
        AnimalCollection.collection.filter(collection => {
          collection.animals.filter(animal => {
            if (animal.key !== quickParam) return;
            animal.isEnabled = true;
          });
        });
      } else if (Legendary.quickParams.indexOf(quickParam) !== -1) {
        Legendary.animals.filter(item => {
          if (item.text !== quickParam) return;
          item.onMap = true;
          MapBase.map.setView({ lat: item.x, lng: item.y }, 5);
        });
      } else if (PlantsCollection.quickParams.indexOf(quickParam) !== -1) {
        Plants.onMap = true;
        PlantsCollection.locations.filter(item => {
          if (item.key !== quickParam) return;
          item.onMap = true;
        });
      } else if (quickParam === 'nazar') {
        MadamNazar.onMap = true;
        const loc = MadamNazar.possibleLocations[MadamNazar.currentLocation];
        MapBase.map.setView({ lat: loc.x, lng: loc.y }, 5);
      } else if (Treasure.quickParams.indexOf(quickParam) !== -1) {
        Treasure.treasures.filter(item => {
          if (item.text !== quickParam) return;
          item.onMap = true;
          MapBase.map.setView({ lat: item.x, lng: item.y }, 5);
        });
      }
    }

    Menu.updateTippy();
    MapBase.updateTippy();
  },

  disableAll: function (toShow = false) {
    Camp.locations.forEach(camp => camp.onMap = toShow);
    Encounter.locations.forEach(encounter => encounter.onMap = toShow);
    GunForHire.locations.forEach(gfh => gfh.onMap = toShow);
    Location.locations.forEach(location => location.onMap = toShow);
    Legendary.animals.forEach(animal => animal.onMap = toShow);
    MadamNazar.onMap = toShow;
    Shop.locations.forEach(shop => shop.onMap = toShow);
    PlantsCollection.locations.forEach(plants => plants.onMap = toShow);
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

    if (opacity === 0) return;

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
        opacity: opacity,
      }));
    });

    Layers.overlaysLayer.addTo(MapBase.map);
  },

  onSearch: function (searchString) {
    searchTerms = [];
    $.each(searchString.split(';'), function (key, value) {
      if ($.inArray(value.trim(), searchTerms) === -1) {
        if (value.length > 0)
          searchTerms.push(value.trim());
      }
    });

    if (searchTerms.length === 0) {
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

  gameToMap: function (lat, lng, name = 'Debug Marker') {
    const lati = (0.01552 * lng + -63.6).toFixed(4);
    const long = (0.01552 * lat + 111.29).toFixed(4);
    MapBase.debugMarker(lati, long, name);
    return { name, lati, long };
  },

  submitDebugForm: function () {
    var lat = $('input[name=debug-marker-lat]').val();
    var lng = $('input[name=debug-marker-lng]').val();
    if (!isNaN(lat) && !isNaN(lng))
      MapBase.debugMarker(lat, lng);
  },

  debugMarker: function (lat, long, name = 'Debug Marker') {
    const shadow = Settings.isShadowsEnabled ?
      `<img class="shadow" width="${35 * Settings.markerSize}" height="${16 * Settings.markerSize}" src="./assets/images/markers-shadow.png" alt="Shadow">` : '';
    var marker = L.marker([lat, long], {
      icon: L.divIcon({
        iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
        iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
        popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
        html: `
          <img class="icon" src="./assets/images/icons/random.png" alt="Icon">
          <img class="background" src="./assets/images/icons/marker_${MapBase.colorOverride || 'darkblue'}.png" alt="Background">
          ${shadow}
        `,
        tippy: marker.title,
      }),
      draggable: Settings.isDebugEnabled,
    });

    marker.bindPopup(`<h1>${name}</h1><p>Lat.: ${lat}<br>Long.: ${long}</p>`, {
      minWidth: 300,
    });
    Layers.debugLayer.addLayer(marker);

    MapBase.updateTippy();
  },

  testData: { data: [] },
  addCoordsOnMap: function (coords) {

    // Show clicked coordinates (like google maps)
    if (Settings.isCoordsOnClickEnabled) {
      $('.lat-lng-container').css('display', 'block');

      $('.lat-lng-container p').html(`
          Latitude: ${parseFloat(coords.latlng.lat.toFixed(4))}
          <br>Longitude: ${parseFloat(coords.latlng.lng.toFixed(4))}
        `);

      $('#lat-lng-container-close-button').click(function () {
        $('.lat-lng-container').css('display', 'none');
      });
    }

    // Remove this false if you want to manually create the heatmap.
    if (false && Settings.isDebugEnabled) {
      console.log(`{ "lat": ${coords.latlng.lat.toFixed(4)}, "lng": ${coords.latlng.lng.toFixed(4)} },`);
      MapBase.testData.data.push({
        lat: coords.latlng.lat.toFixed(4),
        lng: coords.latlng.lng.toFixed(4),
      });
      AnimalCollection.heatmapLayer.setData(MapBase.testData);
    }

    if (Settings.isPinsPlacingEnabled) {
      Pins.onMap = true;
      Pins.addPin(coords.latlng);
    }
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
  },

  updateTippy: function () {
    // Needs some more update points:
    // - on marker update
    // - on menu state change
    // - on language state change
    // Just debug for now.
    if (!Settings.isDebugEnabled) return;

    MapBase.tippyInstances.forEach(instance => instance.destroy());
    MapBase.tippyInstances = [];

    if (!Settings.showTooltipsMap || Settings.isPopupsHoverEnabled) return;

    MapBase.tippyInstances = tippy('[data-tippy]', {
      theme: 'map-theme',
      placement: 'right',
      arrow: false,
      distance: 0,
      content(ref) {
        return ref.getAttribute('data-tippy');
      },
    });
  },

  // Rectangle for testing.
  _rectangle: function (x, y, width, height) {
    var currentPoint = this.map.latLngToContainerPoint([x, y]);

    var xDifference = width / 2;
    var yDifference = height / 2;

    var southWest = L.point((currentPoint.x - xDifference), (currentPoint.y - yDifference));
    var northEast = L.point((currentPoint.x + xDifference), (currentPoint.y + yDifference));

    var bounds = L.latLngBounds(this.map.containerPointToLatLng(southWest), this.map.containerPointToLatLng(northEast));
    L.rectangle(bounds).addTo(this.map);
  },

  //R* converting stuff
  _debugMarker: function (coords) {
    let temp = MapBase.map.unproject(this._gameToMap(coords), 8);
    MapBase.debugMarker(temp.lat, temp.lng);
    return { 'lat': temp.lat.toFixed(4), 'lng': temp.lng.toFixed(4) };
  },

  _gameToMap: function (coords) {
    let image = [48841, 38666],
      topLeft = [-7168, 4096],
      bottomRight = [5120, -5632];

    let i = image[0],
      n = image[1],
      e = this._normal_xy(topLeft, bottomRight),
      s = this._normal_xy(topLeft, coords);
    return [i * (s[0] / e[0]), n * (s[1] / e[1])];
  },

  _normal_xy: function (t, i) {
    return [this._num_distance(t[0], i[0]), this._num_distance(t[1], i[1])];
  },

  _num_distance: function (t, i) {
    return t > i ? t - i : i - t;
  },
};
