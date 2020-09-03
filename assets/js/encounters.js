class Encounter {
  static start = Date.now();
  static init() {
    this.locations = [];
    this.quickParams = [];
    this.context = $('.menu-hidden[data-type=encounters]');

    return Loader.promises['encounters'].consumeJson(data => {
      data.forEach(item => { 
        this.locations.push(new Encounter(item));
        this.quickParams.push(item.key);
      });
      console.info(`%c[Encounters] Loaded in ${Date.now() - Encounter.start}ms!`, 'color: #bada55; background: #242424');
      Menu.reorderMenu(this.context);
    });
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.layer = L.layerGroup();

    this.markers = [];
    this.locations.forEach(item => this.markers.push(new Marker(item.text, item.x, item.y, this.key, item.type)));

    this.element = $(`<div class="collectible-wrapper" data-help="item" data-type="${this.key}">`)
      .toggleClass('disabled', !this.onMap)
      .on('click', () => this.onMap = !this.onMap)
      .append($(`<img src="./assets/images/icons/${this.key}.png" class="collectible-icon">`))
      .append($('<p class="collectible">').attr('data-text', 'menu.' + this.key))
      .translate();

    this.element.appendTo(Encounter.context);

    this.reinitMarker();

    if (this.onMap)
      this.layer.addTo(MapBase.map);
  }

  reinitMarker() {
    this.layer.clearLayers();
    this.markers.forEach(
      marker => {
        var shadow = Settings.isShadowsEnabled ? '<img class="shadow" width="' + 35 * Settings.markerSize + '" height="' + 16 * Settings.markerSize + '" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
        this.layer.addLayer(L.marker([marker.lat, marker.lng], {
          opacity: Settings.markerOpacity,
          icon: new L.DivIcon.DataMarkup({
            iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
            iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
            popupAnchor: [1 * Settings.markerSize, -29 * Settings.markerSize],
            html: `<div>
              ${marker.subdata == 'mission_giver' ? '<img class="overlay" src="assets/images/icons/overlay_giver.png" alt="Mission giver">' : ''}
              <img class="icon" src="assets/images/icons/${this.key}.png" alt="Icon">
              <img class="background" src="assets/images/icons/marker_${this.color}.png" alt="Background">
              ${shadow}
            </div>`,
            marker: this.key
          })
        })
          .bindPopup(marker.updateMarkerContent(), { minWidth: 300, maxWidth: 400 }));
      }
    );
  }

  set onMap(state) {
    if (state) {
      this.layer.addTo(MapBase.map);
      this.element.removeClass('disabled');
      if (!MapBase.isPrewviewMode)
        localStorage.setItem(`rdo:${this.key}`, 'true');
    } else {
      this.layer.remove();
      this.element.addClass('disabled');
      if (!MapBase.isPrewviewMode)
        localStorage.removeItem(`rdo:${this.key}`);
    }
  }
  get onMap() {
    return !!localStorage.getItem(`rdo:${this.key}`);
  }
}