var Legendary = {
  // Needed to check against Q param.
  legendaries: [
    'mp_animal_alligator_legendary_01', 'mp_animal_alligator_legendary_02', 'mp_animal_bear_legendary_01',
    'mp_animal_bear_legendary_02', 'mp_animal_beaver_legendary_01', 'mp_animal_beaver_legendary_02',
    'mp_animal_bison_legendary_01', 'mp_animal_bison_legendary_02', 'mp_animal_boar_legendary_01',
    'mp_animal_boar_legendary_02', 'mp_animal_buck_legendary_01', 'mp_animal_buck_legendary_02',
    'mp_animal_cougar_legendary_01', 'mp_animal_cougar_legendary_02', 'mp_animal_coyote_legendary_01',
    'mp_animal_coyote_legendary_02', 'mp_animal_elk_legendary_01', 'mp_animal_elk_legendary_02',
    'mp_animal_fox_legendary_01', 'mp_animal_fox_legendary_02', 'mp_animal_moose_legendary_01',
    'mp_animal_moose_legendary_02', 'mp_animal_panther_legendary_01', 'mp_animal_panther_legendary_02',
    'mp_animal_ram_legendary_01', 'mp_animal_ram_legendary_02', 'mp_animal_wolf_legendary_01',
    'mp_animal_wolf_legendary_02'
  ],

  // Legendary animals not yet released.
  notReleased: [
    'mp_animal_bear_legendary_01', 'mp_animal_bear_legendary_02', 'mp_animal_moose_legendary_01',
    'mp_animal_moose_legendary_02', 'mp_animal_panther_legendary_01', 'mp_animal_panther_legendary_02'
  ],

  // PlayStation 4 exclusives
  psExclusive: ['mp_animal_ram_legendary_01', 'mp_animal_ram_legendary_02'],

  enabledLegendaries: $.cookie('legendary-enabled') ? $.cookie('legendary-enabled').split(';') : [],
  data: [],
  markers: [],
  load: function () {
    $.getJSON('data/animal_legendary.json?nocache=' + nocache)
      .done(function (data) {
        Legendary.data = data;
        Legendary.set();
      });
    console.info('%c[Legendary Animals] Loaded!', 'color: #bada55; background: #242424');
  },
  set: function (inPreview = false) {
    Legendary.markers = [];
    var shadow = Settings.isShadowsEnabled ? '<img class="shadow" width="' + 35 * Settings.markerSize + '" height="' + 16 * Settings.markerSize + '" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';

    var legendaryIcon = L.divIcon({
      iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
      iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
      popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
      html: `
      <img class="icon" src="./assets/images/icons/legendary_animals.png" alt="Icon">
      <img class="background" src="./assets/images/icons/marker_black.png" alt="Background">
      ${shadow}`
    });

    var crossIcon = L.icon({
      iconUrl: './assets/images/icons/cross.png',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    $.each(Legendary.data, function (key, value) {

      if (Legendary.notReleased.includes(value.text) && !Settings.isDebugEnabled)
        return;

      var circle = L.circle([value.x, value.y], {
        color: "#fdc607",
        fillColor: "#fdc607",
        fillOpacity: 0.5,
        radius: value.radius
      });

      var marker = L.marker([value.x, value.y], {
        icon: legendaryIcon
      });

      var locationsCross = [];
      $.each(value.locations, function (crossKey, crossValue) {
        var crossMarker = L.marker([crossValue.x, crossValue.y], {
          icon: crossIcon
        });

        // var debugDisplayLatLng = $('<small>').text(`Latitude: ${crossValue.x} / Longitude: ${crossValue.y}`);
        // var popupContent = Language.get(crossValue.text + '.desc');
        // crossMarker.bindPopup(`<h1>Possible Location</h1>
        //   <span class="marker-content-wrapper">
        //   <p>${popupContent}</p>
        //   </span>
        //   ${Settings.isDebugEnabled ? debugDisplayLatLng.prop('outerHTML') : ''}
        // `, {
        //   minWidth: 400,
        //   maxWidth: 400
        // });

        locationsCross.push(crossMarker);
      });
      marker.bindPopup(
        `<h1>${Language.get(value.text)}</h1>` +
        `<p style='font-size: 16px; text-align: center; padding-bottom: 8px;'>${Legendary.notReleased.includes(value.text) ? Language.get('map.generic_not_released') : Legendary.psExclusive.includes(value.text) ? Language.get('map.generic_ps_exlusive') : ''}</p>` +
        `<p>${Language.get(value.text + '.desc')}</p>` +
        `<br><p>${Language.get('map.legendary_animal.desc')}</p>` +
        `<br><button type="button" class="btn btn-info remove-button" onclick="MapBase.removeItemFromMap('${value.text}', '${value.text}', 'legendary_animals')" data-item="${marker.text}">${Language.get("map.remove_add")}</button>`, {
        minWidth: 400,
        maxWidth: 400
      });

      Legendary.markers.push({
        animal: value.text,
        marker: marker,
        circle: circle,
        locationsCross: locationsCross
      });
    });

    Legendary.addToMap();
  },

  addToMap: function (inPreview = false) {

    Layers.legendaryLayers.clearLayers();

    if (!enabledCategories.includes('legendary_animals'))
      return;

    var previewLoc = null;
    $.each(Legendary.markers, function (key, value) {
      if (Legendary.enabledLegendaries.includes(value.animal)) {
        previewLoc = value.marker;

        Layers.legendaryLayers.addLayer(value.marker);
        Layers.legendaryLayers.addLayer(value.circle);
        $.each(value.locationsCross, function (crossKey, crossValue) {
          Layers.legendaryLayers.addLayer(crossValue);
        });

        var overlay = `assets/images/icons/game/animals/legendaries/${value.animal}.png?nocache=${nocache}`;
        Layers.legendaryLayers.addLayer(L.imageOverlay(overlay, [[value.circle._latlng.lat - value.circle._mRadius, value.circle._latlng.lng - value.circle._mRadius * 2], [value.circle._latlng.lat + value.circle._mRadius, value.circle._latlng.lng + value.circle._mRadius * 2]], {
          opacity: Settings.overlayOpacity
        }));
      }
    });

    if (inPreview)
      MapBase.map.setView(previewLoc._latlng, 6);

    Layers.legendaryLayers.addTo(MapBase.map);

    //Menu.refreshLegendaries();
  },
  save: function () {
    $.cookie('legendary-enabled', Legendary.enabledLegendaries.join(';'), {
      expires: 999
    });
  },
  showHideAll: function (isToHide) {
    if (isToHide) {
      Legendary.enabledLegendaries = [];
    } else {
      Legendary.enabledLegendaries = Legendary.data.map(_legendary => _legendary.text);
    }
    Legendary.addToMap();
    Legendary.save();
  }
};
