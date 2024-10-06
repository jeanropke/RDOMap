const MapBase = {
  minZoom: Settings.isDebugEnabled ? 0 : 2,
  maxZoom: Settings.isDebugEnabled ? 10 : 7,
  map: null,
  overlays: [],
  isDarkMode: false,
  interiors: false,
  updateLoopAvailable: true,
  updateTippyTimer: null,
  requestLoopCancel: false,
  showAllMarkers: false,
  filtersData: [],
  loadedFallbackFonts: [],

  // Query adjustable parameters
  isPreviewMode: false,
  colorOverride: null,
  themeOverride: null,
  viewportX: -70,
  viewportY: 111.75,
  viewportZoom: 3,

  init: function () {
    'use strict';

    // Parses and properly sets map preferences from query parameters.
    this.beforeLoad();

    this.tippyInstances = [];
    const mapBoundary = L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176));

    //Download map tiles here https://github.com/jeanropke/RDOMap#map-tiles
    const mapLayers = {
      'map.layers.default': L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://www.rockstargames.com/" target="_blank">Rockstar Games</a>',
      }),
      'map.layers.detailed': L.tileLayer((isLocalHost() ? 'assets/maps/' : 'https://map-tiles.b-cdn.net/assets/rdr3/') + 'webp/detailed/{z}/{x}_{y}.webp', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://rdr2map.com/" target="_blank">RDR2Map</a>',
      }),
      'map.layers.dark': L.tileLayer((isLocalHost() ? 'assets/maps/' : 'https://map-tiles.b-cdn.net/assets/rdr3/') + 'webp/darkmode/{z}/{x}_{y}.webp', {
        noWrap: true,
        bounds: mapBoundary,
        attribution: '<a href="https://github.com/TDLCTV" target="_blank">TDLCTV</a>',
      }),
      'map.layers.black': L.tileLayer((isLocalHost() ? 'assets/maps/' : 'https://map-tiles.b-cdn.net/assets/rdr3/') + 'webp/black/{z}/{x}_{y}.webp', {
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

          document.querySelectorAll('.leaflet-popup').forEach(el => {
            el.addEventListener('mouseover', function mouseOverHandler(e) {
              clearTimeout(timeout);
              el.removeEventListener('mouseover', mouseOverHandler);
            });
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
      layers: [mapLayers[this.themeOverride || Settings.baseLayer]],
      zoomSnap: Settings.zoomSnap,
      zoomDelta: Settings.zoomDelta,
      wheelPxPerZoomLevel: Settings.wheelPxPerZoomLevel,
      wheelDebounceTime: Settings.wheelDebounceTime,
    }).setView([this.viewportX, this.viewportY], this.viewportZoom);

    MapBase.map.addControl(
      L.control.attribution({
        position: 'bottomright',
        prefix: '<a target="_blank" href="https://github.com/jeanropke/RDOMap/blob/master/CONTRIBUTORS.md" data-text="map.attribution_prefix">RDOMap Contributors</a>',
      })
    );

    new L.Control.ZoomEx({
      position: 'bottomright',
      className: 'leaflet-zoomex-rightbottom',
    }).addTo(MapBase.map);

    L.control.layers(mapLayers).addTo(MapBase.map);

    // Leaflet leaves the layer names here, with a space in front of them.
    document.querySelectorAll('.leaflet-control-layers-list span span').forEach(node => {
      // changes: Apply double span selector here using Leaflet 1.8.0+
      // Move the layer name (which is chosen to be our language key) into a
      // new tightly fitted span for use with our localization.
      const langKey = node.textContent.trim();
      node.innerHTML = ` <span data-text="${langKey}">${langKey}</span>`;
    });

    MapBase.map.on('baselayerchange', function (e) {
      Settings.baseLayer = e.name;
      MapBase.setMapBackground();

      Discoverable.updateLayers();
      Overlay.onSettingsChanged();
      Legendary.onSettingsChanged();
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

    MapBase.map.on('resize', MapBase.map.invalidateSize);

    Layers.debugLayer.addTo(MapBase.map);

    // Enable this and disable the above to see cool stuff.
    // MapBase.loadOverlaysBeta();
    MapBase.setMapBackground();
  },

  setMapBackground: function () {
    'use strict';
    MapBase.isDarkMode = ['map.layers.dark', 'map.layers.black'].includes(this.themeOverride || Settings.baseLayer) ? true : false;

    const mapEl = document.getElementById('map');
    if (MapBase.isDarkMode) {
      mapEl.style.backgroundColor =
        (this.themeOverride || Settings.baseLayer) === 'map.layers.black' ?
          '#000' :
          '#3d3d3d';
    } else {
      mapEl.style.backgroundColor = '#d2b790';
    }
  },

  setFallbackFonts: async function () {
    const fontsData = {
      ja: {
        content: 'MotoyaExGothic',
        contentUrls: { woff2: 'assets/fonts/fallback/MotoyaExGothic-W4-KP.woff2' },
        title: 'MotoyaAporo',
        titleUrls: { woff2: 'assets/fonts/fallback/MotoyaAporo-Std-W7.woff2' },
      },
      ko: {
        content: 'YDMyungjo240Pro',
        contentUrls: { woff2: 'assets/fonts/fallback/YDMyungjo-240-Pro.woff2' },
        title: 'Yoon-GogooryoM',
        titleUrls: { woff2: 'assets/fonts/fallback/Yoon-GogooryoM.woff2' },
      },
      'zh-Hans': {
        content: 'LXGWNeoZhiSong',
        contentUrls: { woff2: 'assets/fonts/fallback/LXGWNeoZhiSong.woff2' },
        title: 'MLiPRC',
        titleUrls: { woff2: 'assets/fonts/fallback/MLiPRC-Bold.woff2' },
      },
      'zh-Hant': {
        content: 'MSungHK',
        contentUrls: { woff2: 'assets/fonts/fallback/MSungHK-Medium.woff2' },
        title: 'YaYuanGuYin',
        titleUrls: { woff2: 'assets/fonts/fallback/YaYuanGuYin.woff2' },
      },
    };

    this.loadedFallbackFonts.forEach(font => document.fonts.delete(font));
    this.loadedFallbackFonts = [];
    const rootStyles = document.documentElement.style;

    if (fontsData[Settings.language]) {
      const { content, contentUrls, title, titleUrls } = fontsData[Settings.language];
      const [contentFontFace, titleFontFace] = await Promise.all([
        loadFont(content, contentUrls),
        loadFont(title, titleUrls),
      ]);
      this.loadedFallbackFonts.push(contentFontFace, titleFontFace);

      rootStyles.setProperty('--content-font', `var(--default-content-font), ${content}, serif`);
      rootStyles.setProperty('--title-font', `var(--default-title-font), ${title}, serif`);
    }
  },

  beforeLoad: function () {
    // Set map to preview mode before loading.
    const previewParam = getParameterByName('q');
    if (previewParam) this.isPreviewMode = true;

    // Set map theme according to param.
    const themeParam = getParameterByName('theme');
    if (themeParam && ['default', 'detailed', 'dark', 'black'].includes(themeParam))
      this.themeOverride = `map.layers.${themeParam}`;

    // Sets the map's default zoom level to anywhere between minZoom and maxZoom.
    const zoomParam = Number.parseInt(getParameterByName('z'));
    if (!isNaN(zoomParam) && this.minZoom <= zoomParam && zoomParam <= this.maxZoom)
      this.viewportZoom = zoomParam;

    // Pans the map to a specific coordinate location on the map for default focussing.
    const flyParam = getParameterByName('ft');
    if (flyParam) {
      const latLng = flyParam.split(',');
      if (latLng.filter(Number).length === 2) {
        this.viewportX = latLng[0];
        this.viewportY = latLng[1];
      }
    }

    // Sets all marker colors (except for plant markers) to static color.
    const colorParam = getParameterByName('c');
    if (colorParam) {
      const validColors = [
        'aquagreen', 'beige', 'black', 'blue', 'brown', 'cadetblue', 'darkblue', 'darkgreen', 'darkorange', 'darkpurple',
        'darkred', 'gray', 'green', 'lightblue', 'lightdarkred', 'lightgray', 'lightgreen', 'lightorange', 'lightred',
        'orange', 'pink', 'purple', 'red', 'white', 'yellow',
      ];

      if (validColors.includes(colorParam)) this.colorOverride = colorParam;
    }
  },

  afterLoad: function () {
    // Preview mode parameter.
    const quickParam = getParameterByName('q');
    if (quickParam) {
      MapBase.isPreviewMode = true;

      document.querySelector('.menu-toggle').remove();
      document.querySelector('.top-widget').remove();
      document.getElementById('fme-container').remove();
      sideMenu.classList.remove('menu-opened');
      document.querySelector('.leaflet-top.leaflet-right').remove();
      document.querySelector('.leaflet-zoomex.leaflet-zoomex-rightbottom.leaflet-control').remove();

      this.disableAll();

      function locationMarkerFilter(item) {
        if (item.key !== quickParam) return;
        item.onMap = true;
        if (item.markers.length !== 1) return;
        MapBase.map.setView({ lat: item.markers[0].lat, lng: item.markers[0].lng }, 5);
      }

      if (Location.quickParams.indexOf(quickParam) !== -1) {
        Location.locations.filter(locationMarkerFilter);
      } else if (CampCollection.quickParams.indexOf(quickParam) !== -1) {
        CampCollection.locations.filter(locationMarkerFilter);
      } else if (Shop.quickParams.indexOf(quickParam) !== -1) {
        Shop.locations.filter(locationMarkerFilter);
      } else if (Encounter.quickParams.indexOf(quickParam) !== -1) {
        Encounter.locations.filter(locationMarkerFilter);
      } else if (GunForHire.quickParams.indexOf(quickParam) !== -1) {
        GunForHire.locations.filter(locationMarkerFilter);
      } else if (Singleplayer.quickParams.indexOf(quickParam) !== -1) {
        Singleplayer.locations.filter(locationMarkerFilter);
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
      } else if (BountyCollection.quickParams.indexOf(quickParam) !== -1) {
        Object.keys(BountyCollection.collection).filter(item => {
          BountyCollection.collection[item].bounties.filter(bounty => {
            if (`${bounty.type}_${bounty.text}` !== quickParam) return;
            bounty.onMap = true;
            MapBase.map.setView({ lat: bounty.x, lng: bounty.y }, 5);
          });
        });
      } else if (CondorEgg.quickParams.indexOf(quickParam) !== -1) {
        CondorEgg.condorEggOnMap = true;
        CondorEgg.condorEggs.filter(item => {
          if (item.text !== quickParam) {
            item.onMap = false;
            return;
          }
          item.onMap = true;
          MapBase.map.setView({ lat: item.x, lng: item.y }, 5);
        });
      } else if (Salvage.quickParams.indexOf(quickParam) !== -1) {
        Salvage.salvageOnMap = true;
        Salvage.salvages.filter(item => {
          if (item.text !== quickParam) {
            item.onMap = false;
            return;
          }
          item.onMap = true;
          MapBase.map.setView({ lat: item.x, lng: item.y }, 5);
        });
      }
    }

    Menu.updateTippy();
    Menu.updateRangeTippy();
    MapBase.updateTippy('afterLoad');

    // Puppeteer hack and utility for other extensions.
    // Allows utilities to wait for this global to then do their stuff.
    window.loaded = true;
  },

  disableAll: function (toShow = false) {
    CampCollection.locations.forEach(camp => camp.onMap = toShow);
    CondorEgg.condorEggOnMap = toShow;
    Encounter.locations.forEach(encounter => encounter.onMap = toShow);
    GunForHire.locations.forEach(gfh => gfh.onMap = toShow);
    Location.locations.forEach(location => location.onMap = toShow);
    Legendary.animals.forEach(animal => animal.onMap = toShow);
    MadamNazar.onMap = toShow;
    Salvage.salvageOnMap = toShow;
    Shop.locations.forEach(shop => shop.onMap = toShow);
    PlantsCollection.locations.forEach(plants => plants.onMap = toShow);
    Singleplayer.locations.forEach(sp => sp.onMap = toShow);
  },

  loadOverlaysBeta: function () {
    return Loader.promises['overlays_beta'].consumeJson(data => {
      MapBase.overlaysBeta = data;
      MapBase.setOverlaysBeta(Settings.overlayOpacity);
      console.info('%c[Overlays] Loaded!', 'color: #bada55; background: #242424');
    });
  },

  setOverlaysBeta: function (opacity = 0.5) {
    Layers.overlaysLayer.clearLayers();

    if (opacity === 0) return;

    MapBase.overlaysBeta.forEach(value => {
      const overlay = `assets/overlays/${(MapBase.isDarkMode ? 'dark' : 'normal')}/game/${value.name}.png?nocache=${nocache}`;

      const x = (value.width / 2);
      const y = (value.height / 2);
      const scaleX = 0.00076;
      const scaleY = scaleX;

      Layers.overlaysLayer.addLayer(L.imageOverlay(overlay, [
        [(parseFloat(value.lat) + (y * scaleY)), (parseFloat(value.lng) - (x * scaleX))],
        [(parseFloat(value.lat) - (y * scaleY)), (parseFloat(value.lng) + (x * scaleX))],
      ], {
        opacity: opacity,
      }));
    });

    Layers.overlaysLayer.addTo(MapBase.map);
  },

  onSearch: function(searchString) {
    'use strict';

    let searchTerms = [];
    searchString.split(';').forEach(value => {
      const trimmedValue = value.trim();
      if (!searchTerms.includes(trimmedValue) && trimmedValue.length > 0)
        searchTerms.push(trimmedValue);
    });

    let uniqueSearchMarkers = [];
    if (searchTerms.length === 0) {
      uniqueSearchMarkers = MapBase.markers;
    } else {
      Layers.itemMarkersLayer.clearLayers();
      Layers.plantsLayer.clearLayers();

      searchTerms.forEach(term => {
        const searchMarkers = MapBase.markers.filter(function (_marker) {
          return _marker.title != null && _marker.title.toLowerCase().includes(term.toLowerCase());
        }

        );

        searchMarkers.forEach(marker => {
          if (!uniqueSearchMarkers.includes(marker))
            uniqueSearchMarkers.push(marker);
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
    const lat = parseFloat(document.querySelector('input[name="debug-marker-lat"]').value);
    const lng = parseFloat(document.querySelector('input[name="debug-marker-lng"]').value);

    if (!isNaN(lat) && !isNaN(lng))
      MapBase.debugMarker(lat, lng);
  },

  debugMarker: function (lat, long, name = 'Debug Marker') {
    const shadow = Settings.isShadowsEnabled ?
      `<img class="shadow" width="${35 * Settings.markerSize}" height="${16 * Settings.markerSize}" src="./assets/images/markers-shadow.png" alt="Shadow">` : '';
    const marker = L.marker([lat, long], {
      icon: L.divIcon({
        iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
        iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
        popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
        html: `
          <img class="icon" src="./assets/images/icons/random.png" alt="Icon">
          <img class="background" src="./assets/images/icons/marker_${MapBase.colorOverride || 'darkblue'}.png" alt="Background">
          ${shadow}
        `,
      }),
      draggable: Settings.isDebugEnabled,
    });

    marker.bindPopup(`<h1>${name}</h1><p>Lat.: ${lat}<br>Long.: ${long}</p>`, {
      minWidth: 300,
    });
    Layers.debugLayer.addLayer(marker);

    MapBase.updateTippy('debugMarker');
  },

  testData: { data: [] },
  addCoordsOnMap: function (coords) {
    // Show clicked coordinates (like google maps)
    const container = document.querySelector('.lat-lng-container');

    if (Settings.isCoordsOnClickEnabled) {
      if (container.style.display = 'none') container.style.display = 'block';
      container.title ||= Language.get('map.draggable');
      draggableLatLngCtn ||= new PlainDraggable(container);

      const lat = coords.latlng.lat.toFixed(4);
      const lng = coords.latlng.lng.toFixed(4);
      document.querySelector('.lat-value').textContent = lat;
      document.querySelector('.lng-value').textContent = lng;
      
      ['click', 'touchend'].forEach((event) => {
        document.getElementById('lat-lng-container-close-button').addEventListener((event), () =>{ 
          container.style.display = 'none';
          if (draggableLatLngCtn) {
            draggableLatLngCtn.remove();
            draggableLatLngCtn = null;
          }
        }, { once: true });
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
    if (MapBase.isPreviewMode) chunksize = count;
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

  updateTippy: function (loc = '') {
    if (Settings.isDebugEnabled)
      console.log('UpdateTippy called from', loc);

    // This is here to deal with stacked onMap updates (show all/hide all)
    // TODO: Have a generic hook for "after update" in both all and single updates.
    // TODO: See if we can't go ahead and filter based on marker cat.
    clearTimeout(MapBase.updateTippyTimer);
    MapBase.updateTippyTimer = setTimeout(function () {
      if (Settings.isDebugEnabled)
        console.log('Updating MapBase Tippy...');

      MapBase.tippyInstances.forEach(instance => instance.destroy());
      MapBase.tippyInstances = [];

      if (!Settings.showTooltipsMap || Settings.isPopupsHoverEnabled) return;

      MapBase.tippyInstances = tippy('[data-tippy]', {
        theme: 'map-theme',
        placement: 'right',
        arrow: false,
        distance: 0,
        zIndex: 910,
        content(ref) {
          return ref.getAttribute('data-tippy');
        },
      });
    }, 300);
  },

  // Rectangle for testing.
  _rectangle: function (x, y, width, height) {
    const currentPoint = this.map.latLngToContainerPoint([x, y]);

    const xDifference = width / 2;
    const yDifference = height / 2;

    const southWest = L.point((currentPoint.x - xDifference), (currentPoint.y - yDifference));
    const northEast = L.point((currentPoint.x + xDifference), (currentPoint.y + yDifference));

    const bounds = L.latLngBounds(this.map.containerPointToLatLng(southWest), this.map.containerPointToLatLng(northEast));
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
