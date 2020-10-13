class Camp {
  static init() {
    this.isLarge = true;
    this.isSmall = true;
    this.isWilderness = true;
    this.locations = [];
    this.quickParams = [];
    this.context = $('.menu-hidden[data-type=camps]');

    return Loader.promises['camps'].consumeJson(data => {
      data.forEach(item => {
        this.locations.push(new Camp(item));
        this.quickParams.push(item.key);
      });
      console.info('%c[Camps] Loaded!', 'color: #bada55; background: #242424');
      Menu.reorderMenu(this.context);
    });
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.layer = L.layerGroup();

    this.onLanguageChanged();

    this.element = $(`<div class="collectible-wrapper" data-help="item" data-type="${this.key}">`)
      .toggleClass('disabled', !this.onMap)
      .on('click', () => this.onMap = !this.onMap)
      .append($('<p class="collectible">').attr('data-text', `map.camps.${this.key}.name`))
      .translate();

    this.element.appendTo(Camp.context);

    if (this.onMap)
      this.layer.addTo(MapBase.map);
  }

  onLanguageChanged() {
    this.markers = [];
    this.locations.forEach(item => this.markers.push(new Marker(item.text, item.x, item.y, 'camps', this.key, item.type)));

    this.reinitMarker();
  }

  reinitMarker() {
    this.layer.clearLayers();
    this.markers.forEach(
      marker => {

        if (!Camp.isLarge && marker.size === 'large') return;
        if (!Camp.isSmall && marker.size === 'small') return;
        if (!Camp.isWilderness && marker.size === 'wild') return;

        const shadow = Settings.isShadowsEnabled ?
          `<img class="shadow" width="${35 * Settings.markerSize}" height="${16 * Settings.markerSize}" src="./assets/images/markers-shadow.png" alt="Shadow">` : '';
        var tempMarker = L.marker([marker.lat, marker.lng], {
          opacity: Settings.markerOpacity,
          icon: new L.DivIcon.DataMarkup({
            iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
            iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
            popupAnchor: [1 * Settings.markerSize, -29 * Settings.markerSize],
            html: `<div>
                <img class="icon" src="assets/images/icons/camps.png" alt="Icon">
                <img class="background" src="assets/images/icons/marker_${this.color}.png" alt="Background">
                ${shadow}
              </div>`,
            marker: this.key
          })
        }).bindPopup(marker.updateMarkerContent(), { minWidth: 300, maxWidth: 400 });

        this.layer.addLayer(tempMarker);
        if (Settings.isMarkerClusterEnabled)
          Layers.oms.addMarker(tempMarker);
      }
    );
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
  }
  get onMap() {
    return !!localStorage.getItem(`rdo:${this.key}`);
  }
}
