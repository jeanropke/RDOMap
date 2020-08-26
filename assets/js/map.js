/**
 * Created by Jean on 2019-10-09.
 */

var MapBase = {
  minZoom: Settings.isDebugEnabled ? 0 : 2,
  maxZoom: Settings.isDebugEnabled ? 10 : 7,
  map: null,
  overlays: [],
  markers: [],
  discoverables: [],
  importantItems: [],
  isDarkMode: false,
  fastTravelData: null,
  shopData: null,
  campData: null,
  campDisabled: [],
  dailyData: null,
  updateLoopAvailable: true,
  requestLoopCancel: false,

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
      }),
      L.tileLayer((isLocalHost() ? '' : 'https://jeanropke.b-cdn.net/') + 'assets/maps/black/{z}/{x}_{y}.jpg', {
        noWrap: true,
        bounds: L.latLngBounds(L.latLng(-144, 0), L.latLng(0, 176)),
        attribution: '<a href="https://github.com/AdamNortonUK" target="_blank">AdamNortonUK</a>'
      }),
    ];

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
        position: 'bottomright',
        prefix: '<a target="_blank" href="https://github.com/jeanropke/RDOMap/blob/master/CONTRIBUTORS.md" data-text="map.attribution_prefix">RDO Map Contributors</a>'
      })
    );

    L.control.zoom({
      position: 'bottomright'
    }).addTo(MapBase.map);

    var baseMapsLayers = {
      'map.layers.default': mapLayers[0],
      'map.layers.detailed': mapLayers[1],
      'map.layers.dark': mapLayers[2],
      'map.layers.black': mapLayers[3]
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
        case 'map.layers.black':
          mapIndex = 3;
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
    /*$.getJSON('data/items.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.setMarkers(data);
      });*/
  },

  setMarkers: function (data) {
    $.each(data, function (_category, _markers) {
      $.each(_markers, function (_key, marker) {
        if (Array.isArray(marker)) {
          $.each(marker, function (_, submarker) {
            MapBase.markers.push(new Marker(marker.text || _key, submarker.lat, submarker.lng, _category, _key, null, submarker.size));
          });
        } else {
          MapBase.markers.push(new Marker(marker.text || _category, marker.lat, marker.lng, _category, null, marker.size));
        }
      });
    });
    uniqueSearchMarkers = MapBase.markers;

    MapBase.addMarkers(true);
  },

  loadDiscoverables: function () {
    if (!Settings.isDebugEnabled) return;
    $.getJSON('data/discoverables.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.setDiscoverables(data);
      });
  },

  setDiscoverables: function (data) {
    $.each(data, function (_key, marker) {
      MapBase.discoverables.push(new Marker(marker.name, marker.lat, marker.lng, "discoverables", null, [marker.width, marker.height]));
    });

    MapBase.addMarkers(true);
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
    // Do search via URL.
    var quickParam = getParameterByName('q');
    if (refreshMenu && quickParam != null && quickParam) {
      $('.menu-toggle').remove();
      $('.clock-container').remove();
      $('#fme-container').remove();
      $('.side-menu').removeClass('menu-opened');
      $('.leaflet-top.leaflet-right, .leaflet-control-zoom').remove();

      if (categories.indexOf(quickParam) !== -1) {
        enabledCategories = [quickParam];
      } else if (plants.indexOf(quickParam) !== -1) {
        enabledCategories = ["plants"];
        enabledPlants = [quickParam];
      } else if (shops.indexOf(quickParam) !== -1) {
        enabledCategories = ["shops"];
        enabledShops = [quickParam];
      } else if (camps.indexOf(quickParam) !== -1) {
        enabledCategories = ["camps"];
        enabledCamps = [quickParam];
      } else if (gfh.indexOf(quickParam) !== -1) {
        enabledCategories = ["gfh"];
        enabledGfh = [quickParam];
      } else if (Treasures.treasures.indexOf(quickParam) !== -1) {
        enabledCategories = ["treasure"];
        Treasures.enabledTreasures = [quickParam];
        Treasures.addToMap(true);
      } else if (Legendary.legendaries.indexOf(quickParam) !== -1) {
        enabledCategories = ["legendary_animals"];
        Legendary.enabledLegendaries = [quickParam];
        Legendary.addToMap(true);
      } else {
        enabledCategories = [];

        if (Heatmap.state !== 2) {
          // A bit sloppy, but it works.
          setTimeout(() => {
            MapBase.addMarkers(refreshMenu);
          }, 50);
          return;
        }

        if (Heatmap.data.animals.hasOwnProperty(quickParam)) {
          Heatmap.setHeatmap(quickParam, "animals");
        } else if (Heatmap.data.birds.hasOwnProperty(quickParam)) {
          Heatmap.setHeatmap(quickParam, "birds");
        } else if (Heatmap.data.fish.hasOwnProperty(quickParam)) {
          Heatmap.setHeatmap(quickParam, "fish");
        }
      }
    }

    if (Settings.isDebugEnabled)
      console.log(`Categories disabled: ${categoriesDisabledByDefault}`);

    Layers.plantsLayer.addTo(MapBase.map);
    Layers.discoverablesLayer.addTo(MapBase.map);

    MapBase.map.on('zoom', function () {
      if (MapBase.map.getZoom() > 5)
        return Layers.discoverablesLayer.addTo(MapBase.map);

      return Layers.discoverablesLayer.removeFrom(MapBase.map);
    });

    if (Layers.itemMarkersLayer != null)
      Layers.itemMarkersLayer.clearLayers();
    if (Layers.plantsLayer != null)
      Layers.plantsLayer.clearLayers();
    if (Layers.discoverablesLayer != null)
      Layers.discoverablesLayer.clearLayers();
    if (Layers.miscLayer != null)
      Layers.miscLayer.clearLayers();
    if (Layers.legendaryLayers != null)
      Layers.legendaryLayers.clearLayers();
    if (Layers.legendaryLayers != null)
      Layers.legendaryLayers.clearLayers();

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

    if (MapBase.discoverables.length > 0) {
      var discoverableMarkersInst = [];
      MapBase.yieldingLoop(MapBase.discoverables.length, 25, function (i) {
        var marker = MapBase.discoverables[i];
        marker.isVisible = false;
        var markerInst = MapBase.createDiscoverableMarker(marker, opacity);
        if (typeof markerInst == 'undefined') return;
        discoverableMarkersInst.push(markerInst);
      }, function () {
        try {
          Layers.discoverablesLayer.addLayers(discoverableMarkersInst);
        } catch (error) {
          // 
        }

        if (MapBase.map.getZoom() <= 5)
          Layers.discoverablesLayer.removeFrom(MapBase.map);
      });
    }

    Layers.itemMarkersLayer.addTo(MapBase.map);
    Layers.pinsLayer.addTo(MapBase.map);

    if (refreshMenu)
      Menu.refreshMenu();
  },

  removeItemFromMap: function (text, subdata, category) {

    if (category == 'treasure') {
      if (Treasures.enabledTreasures.includes(text))
        Treasures.enabledTreasures = $.grep(Treasures.enabledTreasures, function (treasure) {
          return treasure !== text;
        });
      else {
        Treasures.enabledTreasures.push(text);
      }

      $(`[data-type=${text}]`).toggleClass('disabled');

      Treasures.addToMap();
      Treasures.save();
    }
    else if (category == 'legendary_animals') {
      if (Legendary.enabledLegendaries.includes(text))
        Legendary.enabledLegendaries = $.grep(Legendary.enabledLegendaries, function (animal) {
          return animal !== text;
        });
      else {
        Legendary.enabledLegendaries.push(text);
      }

      $(`[data-type=${text}]`).toggleClass('disabled');

      Legendary.addToMap();
      Legendary.save();
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
      case "camps":
        return "blue";
      default:
        return "red";
    }
  },

  updateMarkerContent: function (marker) {
    var popupContent = marker.description;

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
        category: marker.category
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

  createDiscoverableMarker: function (marker, opacity = 1) {
    if (!enabledCategories.includes('discoverables')) return;

    var overlay = `assets/overlays/${(MapBase.isDarkMode ? 'dark' : 'normal')}/discoveries/${marker.text}.png?nocache=${nocache}`;
    var tempMarker = L.marker([marker.lat, marker.lng], {
      opacity: opacity,
      icon: new L.divIcon({
        iconUrl: overlay,
        iconSize: [marker.size[0], marker.size[1]],
        iconAnchor: [marker.size[0] / 2, marker.size[1] / 2],
        popupAnchor: [0, 0]
      })
    });

    marker.isVisible = true;
    tempMarker.id = marker.text;

    // Maybe at some point make these display the text.
    // tempMarker.bindPopup(`<h1>${marker.title}</h1>`, {
    //   minWidth: 300,
    //   maxWidth: 400
    // });

    return tempMarker;
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
          marker.bindPopup(`
          <h1>${Language.get(`map.shops.${category}.name`)}</h1>
          <p>${Language.get(`map.shops.${category}.desc`)}</p>
          `);

          Layers.itemMarkersLayer.addLayer(marker);
        });
      });
    }
  },

  loadCamps: function () {
    $.getJSON('data/camps.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.campData = data;
      });
    console.info('%c[camps] Loaded!', 'color: #bada55; background: #242424');
  },

  addCamps: function () {
    if (enabledCategories.includes('camps')) {
      $.each(MapBase.campData, function (category, categoryValue) {
        if (!enabledCamps.includes(category)) return;
        $.each(categoryValue, function (key, value) {
          if (MapBase.campDisabled.includes(value.id)) return;

          var shadow = Settings.isShadowsEnabled ? '<img class="shadow" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
          var marker = L.marker([value.lat, value.lng], {
            opacity: Settings.markerOpacity,
            icon: L.divIcon({
              iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
              iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
              popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
              html: `
                <img class="icon" src="./assets/images/icons/camps.png" alt="Icon">
                <img class="background" src="./assets/images/icons/marker_blue.png" alt="Background">
                ${shadow}
              `
            })
          });

          marker.bindPopup(`<h1>${Language.get(`map.camps.${category}.name`)} - ${Language.get(`map.camps.sizes.${this.size}`)}</h1><p>${Language.get(`map.camps.desc`)}</p>`);

          Layers.itemMarkersLayer.addLayer(marker);
        });
      });
    }
  },

  loadGfh: function () {
    $.getJSON('data/gfh.json?nocache=' + nocache)
      .done(function (data) {
        MapBase.gfhData = data;
      });
    console.info('%c[Gfh] Loaded!', 'color: #bada55; background: #242424');
  },

  addGfh: function () {
    if (enabledCategories.includes('gfh')) {
      $.each(MapBase.gfhData, function (category, categoryValue) {
        if (!enabledGfh.includes(category)) return;
        $.each(categoryValue, function (key, value) {
          var shadow = Settings.isShadowsEnabled ? '<img class="shadow" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
          var marker = L.marker([value.lat, value.lng], {
            opacity: Settings.markerOpacity,
            icon: L.divIcon({
              iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
              iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
              popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
              html: `
                <img class="icon" src="./assets/images/icons/gfh.png" alt="Icon">
                <img class="background" src="./assets/images/icons/marker_red.png" alt="Background">
                ${shadow}
              `
            })
          });
          marker.bindPopup(`
            <h1>${Language.get(`map.gfh.${category}.name`)}</h1>
            <p>${Language.get(`map.gfh.${category}.desc`)}</p>
          `);

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