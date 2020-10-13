class MadamNazar {
  static init() {
    this.possibleLocations = [
      { 'key': 'MPSW_LOCATION_00', 'x': -123.9039, 'y': 34.8213 },
      { 'key': 'MPSW_LOCATION_01', 'x': -100.0742, 'y': 49.0765 },
      { 'key': 'MPSW_LOCATION_02', 'x': -104.7679, 'y': 85.7222 },
      { 'key': 'MPSW_LOCATION_03', 'x': -84.2973, 'y': 82.4512 },
      { 'key': 'MPSW_LOCATION_04', 'x': -56.1619, 'y': 78.5000 },
      { 'key': 'MPSW_LOCATION_05', 'x': -60.9622, 'y': 130.6067 },
      { 'key': 'MPSW_LOCATION_06', 'x': -63.8927, 'y': 105.3496 },
      { 'key': 'MPSW_LOCATION_07', 'x': -43.1046, 'y': 132.8263 },
      { 'key': 'MPSW_LOCATION_08', 'x': -90.0802, 'y': 135.6969 },
      { 'key': 'MPSW_LOCATION_09', 'x': -65.9688, 'y': 150.4468 },
      { 'key': 'MPSW_LOCATION_10', 'x': -40.7817, 'y': 109.4863 },
      { 'key': 'MPSW_LOCATION_11', 'x': -36.5097, 'y': 154.1859 }
    ];

    this.currentLocation = null;
    this.currentDate = null;

    this.layer = L.layerGroup();

    this.context = $('.menu-option[data-type=nazar]');

    this.context.toggleClass('disabled', !MadamNazar.onMap)
      .on('click', () => MadamNazar.onMap = !MadamNazar.onMap)
      .translate();

    return Loader.promises['nazar'].consumeJson(data => {
      var _nazarParam = getParameterByName('nazar');
      if (_nazarParam < MadamNazar.possibleLocations.length && _nazarParam)
        this.currentLocation = _nazarParam;
      else
        this.currentLocation = this.possibleLocations.findIndex(({ key }) => key === data.nazar);

      this.currentDate = new Date(data.date).toLocaleString(Settings.language, {
        day: '2-digit', month: 'long', year: 'numeric'
      });

      MadamNazar.addMadamNazar();
      console.info('%c[Nazar] Loaded!', 'color: #bada55; background: #242424');
    });
  }

  static addMadamNazar() {
    if (this.currentLocation == null)
      return;

    MadamNazar.layer.clearLayers();
    const cl = MadamNazar.possibleLocations[MadamNazar.currentLocation];

    const shadow = Settings.isShadowsEnabled ?
      `<img class="shadow" width="${35 * Settings.markerSize}" height="${16 * Settings.markerSize}" src="./assets/images/markers-shadow.png" alt="Shadow">` : '';
    var tempMarker = L.marker([cl.x, cl.y], {
      opacity: Settings.markerOpacity,
      icon: L.divIcon({
        iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
        iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
        popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
        html: `
              <img class="icon" src="./assets/images/icons/nazar.png" alt="Icon">
              <img class="background" src="./assets/images/icons/marker_red.png" alt="Background">
              ${shadow}
            `
      })
    });
    tempMarker.bindPopup(`<h1>${Language.get('menu.madam_nazar')} - ${MadamNazar.currentDate}</h1><p style="text-align: center;">${Language.get('map.madam_nazar.desc').replace('{link}', '<a href="https://twitter.com/MadamNazarIO" target="_blank">@MadamNazarIO</a>')}</p>`, { minWidth: 300 });

    MadamNazar.layer.addLayer(tempMarker);
    if (Settings.isMarkerClusterEnabled)
      Layers.oms.addMarker(tempMarker);

    this.onMap = this.onMap;
  }

  static set onMap(state) {
    if (state) {
      MadamNazar.layer.addTo(MapBase.map);
      this.context.removeClass('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem('rdo:nazar', 'true');
    } else {
      MadamNazar.layer.remove();
      this.context.addClass('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem('rdo:nazar', 'false');
    }
  }
  static get onMap() {
    return JSON.parse(localStorage.getItem('rdo:nazar')) || JSON.parse(localStorage.getItem('rdo:nazar')) == null;
  }
}
