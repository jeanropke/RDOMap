class GunForHire {

  static init() {
    this.locations = [];
    this.quickParams = [];
    this.context = $('.menu-hidden[data-type=gfh]');

    return Loader.promises['gfh'].consumeJson(data => {
      data.forEach(item => {
        this.locations.push(new GunForHire(item));
        this.quickParams.push(item.key);
      });
      console.info('%c[Freeroam Missions] Loaded!', 'color: #bada55; background: #242424');
      Menu.reorderMenu(this.context);
    });
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.layer = L.layerGroup();

    this.onLanguageChanged();

    this.element = $(`<div class="collectible-wrapper" data-help="item" data-type="${this.key}">`)
      .attr('data-tippy-content', Language.get(`map.gfh.${this.key}.name`))
      .toggleClass('disabled', !this.onMap)
      .on('click', () => this.onMap = !this.onMap)
      .append($('<p class="collectible">').attr('data-text', `map.gfh.${this.key}.name`))
      .translate();

    this.element.appendTo(GunForHire.context);

    if (this.onMap)
      this.layer.addTo(MapBase.map);
  }

  onLanguageChanged() {
    this.markers = [];
    this.locations.forEach(item => this.markers.push(new Marker(item.text, item.x, item.y, 'gfh', this.key, item.types)));

    this.reinitMarker();
  }

  updateMarkerContent(marker) {
    let missionsElement = $('<ul>').addClass('missions-list');
    marker.size
      .map(m => Language.get(`map.gfh.missions.${m}`))
      .sort((a, b) => a.localeCompare(b, {sensitivity: 'base'}))
      .forEach(mission => {
        missionsElement.append(`<li>${mission}</li>`);
      });
    const debugDisplayLatLng = $('<small>').text(`Text: ${marker.text} / Latitude: ${marker.lat} / Longitude: ${marker.lng}`);
    return $(`
        <div>
          <h1>${marker.title}</h1>
          <span class="marker-content-wrapper">
            <p>${marker.description}</p>
          </span>
          <br>
          <p data-text="map.gfh.missions_header"></p>
          ${missionsElement.prop('outerHTML')}
          <button class="btn btn-default full-popup-width" data-text="map.remove"></button>
          ${Settings.isDebugEnabled ? debugDisplayLatLng.prop('outerHTML') : ''}
        </div>
      `)
      .translate()
      .find('button')
      .on('click', () => this.onMap = false)
      .end()[0];
  }

  reinitMarker() {
    this.layer.clearLayers();
    this.markers.forEach(marker => {
      const shadow = Settings.isShadowsEnabled ?
        `<img class="shadow" width="${35 * Settings.markerSize}" height="${16 * Settings.markerSize}" src="./assets/images/markers-shadow.png" alt="Shadow">` : '';
      var tempMarker = L.marker([marker.lat, marker.lng], {
        opacity: Settings.markerOpacity,
        icon: new L.DivIcon.DataMarkup({
          iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
          iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
          popupAnchor: [1 * Settings.markerSize, -29 * Settings.markerSize],
          html: `<div>
            <img class="icon" src="assets/images/icons/gfh.png" alt="Icon">
            <img class="background" src="assets/images/icons/marker_${MapBase.colorOverride || this.color}.png" alt="Background">
            ${shadow}
          </div>`,
          marker: this.key,
          tippy: marker.title,
        }),
      });
      tempMarker.bindPopup(this.updateMarkerContent.bind(this, marker), { minWidth: 300, maxWidth: 400 });

      this.layer.addLayer(tempMarker);
      if (Settings.isMarkerClusterEnabled)
        Layers.oms.addMarker(tempMarker);
    });
  }

  set onMap(state) {
    this.reinitMarker();
    if (state) {
      this.layer.addTo(MapBase.map);
      this.element.removeClass('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo:${this.key}`, 'true');
    } else {
      this.layer.remove();
      this.element.addClass('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo:${this.key}`);
    }
    MapBase.updateTippy('gfh');
  }

  get onMap() {
    return !!localStorage.getItem(`rdo:${this.key}`);
  }

  static onLanguageChanged() {
    GunForHire.locations.forEach(gfh => gfh.onLanguageChanged());
    Menu.reorderMenu(this.context);
  }

  static onSettingsChanged() {
    GunForHire.locations.forEach(gfh => gfh.reinitMarker());
  }
}
