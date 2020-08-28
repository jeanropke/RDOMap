class MadamNazar {
  static start = Date.now();
  static init() {
    this.possibleLocations = [
      { "x": -40.7817, "y": 109.4863, "id": "der" },
      { "x": -43.1046, "y": 132.8263, "id": "grz" },
      { "x": -36.5097, "y": 154.1859, "id": "bbr" },
      { "x": -56.1619, "y": 78.5000, "id": "bgv" },
      { "x": -63.8927, "y": 105.3496, "id": "hrt_w" },
      { "x": -60.9622, "y": 130.6067, "id": "hrt_e" },
      { "x": -65.9688, "y": 150.4468, "id": "blu" },
      { "x": -84.2973, "y": 82.4512, "id": "tal" },
      { "x": -90.0802, "y": 135.6969, "id": "scm" },
      { "x": -100.0742, "y": 49.0765, "id": "cho" },
      { "x": -104.7679, "y": 85.7222, "id": "hen" },
      { "x": -123.9039, "y": 34.8213, "id": "rio" }
    ];

    this.currentLocation = null;
    this.currentDate = null;

    this.layer = L.layerGroup();
    this.layer.addTo(MapBase.map);

    this.context = $('.menu-option[data-type=nazar]');

    this.context.toggleClass('disabled', !MadamNazar.onMap)
      .on('click', () => MadamNazar.onMap = !MadamNazar.onMap)      
      .translate();

    return Loader.promises['nazar'].consumeJson(nazar => {
      var _nazarParam = getParameterByName('nazar');
      if (_nazarParam < MadamNazar.possibleLocations.length && _nazarParam)
        this.currentLocation = _nazarParam;
      else
        this.currentLocation = nazar.nazar_id - 1;        

      this.currentDate = new Date(nazar.date).toLocaleString(Settings.language, {
        day: "2-digit", month: "long", year: "numeric"
      });
      MadamNazar.addMadamNazar();
      console.info(`%c[Nazar] Loaded in ${Date.now() - MadamNazar.start}ms!`, 'color: #bada55; background: #242424');
    });
  }

  static addMadamNazar() {
    if (this.currentLocation == null || !MadamNazar.onMap)
      return;

      MadamNazar.layer.clearLayers();

    var shadow = Settings.isShadowsEnabled ? '<img class="shadow" width="' + 35 * Settings.markerSize + '" height="' + 16 * Settings.markerSize + '" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
    var marker = L.marker([MadamNazar.possibleLocations[MadamNazar.currentLocation].x, MadamNazar.possibleLocations[MadamNazar.currentLocation].y], {
      icon: L.divIcon({
        opacity: Settings.markerOpacity,
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

    marker.bindPopup(`<h1>${Language.get('menu.madam_nazar')} - ${MadamNazar.currentDate}</h1><p style="text-align: center;">${Language.get('map.madam_nazar.desc').replace('{link}', '<a href="https://twitter.com/MadamNazarIO" target="_blank">@MadamNazarIO</a>')}</p>`, { minWidth: 300 });
    MadamNazar.layer.addLayer(marker);
  }

  static set onMap(state) {
    if (state) {
      MadamNazar.layer.addTo(MapBase.map);
      this.context.removeClass('disabled');
      localStorage.setItem(`rdo:nazar`, 'true');
      MadamNazar.addMadamNazar();
    } else {
      MadamNazar.layer.remove();
      this.context.addClass('disabled');
      localStorage.setItem(`rdo:nazar`, 'false');
    }
  }
  static get onMap() {
    return JSON.parse(localStorage.getItem(`rdo:nazar`)) || JSON.parse(localStorage.getItem(`rdo:nazar`)) == null;
  }
}