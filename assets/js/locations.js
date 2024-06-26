class Location {
  static init() {
    this.quickParams = [];
    this.locations = [];

    return Loader.promises['items'].consumeJson(data => {
      data.forEach(item => {
        this.locations.push(new Location(item));
        this.quickParams.push(item.key);
      });
      console.info('%c[Locations] Loaded!', 'color: #bada55; background: #242424');
    });
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.layer = L.layerGroup();

    this.onLanguageChanged();

    this.element = document.querySelector(`.menu-option[data-type="${this.key}"]`);
    this.element.classList.toggle('disabled', !this.onMap);
    this.element.addEventListener('click', () => this.onMap = !this.onMap);
    Language.translateDom(this.element);

    if (this.onMap)
      this.layer.addTo(MapBase.map);
  }

  onLanguageChanged() {
    this.markers = [];
    this.locations.forEach(item => this.markers.push(new Marker(item.text, item.x, item.y, this.key, item.time)));

    this.reinitMarker();
  }

  reinitMarker() {
    this.layer.clearLayers();
    this.markers.forEach(marker => {
      const shadow = Settings.isShadowsEnabled ?
        `<img class="shadow" width="${35 * Settings.markerSize}" height="${16 * Settings.markerSize}" src="./assets/images/markers-shadow.png" alt="Shadow">` : '';
      const tempMarker = L.marker([marker.lat, marker.lng], {
        opacity: Settings.markerOpacity,
        icon: new L.DivIcon.DataMarkup({
          iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
          iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
          popupAnchor: [1 * Settings.markerSize, -29 * Settings.markerSize],
          html: `<div>
            <img class="icon" src="assets/images/icons/${this.key}.png" alt="Icon">
            <img class="background" src="assets/images/icons/marker_${MapBase.colorOverride || this.color}.png" alt="Background">
            ${shadow}
          </div>`,
          marker: this.key,
          tippy: marker.title,
          time: marker.subdata,
        }),
      });
      tempMarker.bindPopup(marker.updateMarkerContent.bind(marker, () => this.onMap = false), { minWidth: 300, maxWidth: 400 });

      this.layer.addLayer(tempMarker);
      if (Settings.isMarkerClusterEnabled)
        Layers.oms.addMarker(tempMarker);
    });
  }

  set onMap(state) {
    if (state) {
      this.layer.addTo(MapBase.map);
      this.element.classList.remove('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo.${this.key}`, 'true');
    } else {
      this.layer.remove();
      this.element.classList.add('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo.${this.key}`, 'false');
    }
    MapBase.updateTippy('location');
  }

  get onMap() {
    const value = JSON.parse(localStorage.getItem(`rdo.${this.key}`));
    return value || (value == null && !this.disabled);
  }

  static onLanguageChanged() {
    Location.locations.forEach(location => location.onLanguageChanged());
  }

  static onSettingsChanged() {
    Location.locations.forEach(location => location.reinitMarker());
  }
}
