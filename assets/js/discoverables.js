class Discoverable {
  static init() {
    this.quickParams = [];
    this.locations = [];
    this.context = $('.menu-hidden[data-type=discoverables]');

    return Loader.promises['discoverables'].consumeJson(data => {
      data.forEach(item => {
        // TODO: Need to remove beta MP treasure iconography.
        if (item.key === 'collectable_treasure_chest') return;

        this.locations.push(new Discoverable(item));
        this.quickParams.push(item.key);
      });

      MapBase.map.on('zoomend', function (e) {
        if (MapBase.map.getZoom() > 5)
          Discoverable.addLayers();
        else
          Discoverable.removeLayers();
      });

      console.info('%c[Discoverables] Loaded!', 'color: #bada55; background: #242424');
      Menu.reorderMenu(this.context);
    });
  }

  static addLayers() {
    this.locations.forEach(location => {
      if (location.onMap)
        location.layer.addTo(MapBase.map);
    });
  }

  static removeLayers() {
    this.locations.forEach(location => {
      location.layer.remove();
    });
  }

  static updateLayers() {
    this.locations.forEach(location => {
      location.createOverlays();
    });
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.layer = L.layerGroup();

    this.createOverlays();

    this.element = $(`<div class="collectible-wrapper" data-help="item" data-type="${this.key}">`)
      .attr('data-tippy-content', Language.get(`menu.discoverables.${this.key}`))
      .toggleClass('disabled', !this.onMap)
      .on('click', () => this.onMap = !this.onMap)
      .append($('<p class="collectible">').attr('data-text', `menu.discoverables.${this.key}`))
      .translate();

    this.element.appendTo(Discoverable.context);

    if (this.onMap && MapBase.map.getZoom() > 5)
      this.layer.addTo(MapBase.map);
  }

  createOverlays() {
    this.layer.clearLayers();
    this.locations.forEach(item => {
      var overlay = `assets/overlays/${(MapBase.isDarkMode ? 'dark' : 'normal')}/discoveries/${item.name}.svg?nocache=${nocache}`;
      let offset = 130;
      var tempMarker = L.imageOverlay(overlay, [
        [item.lat - item.height / offset, item.lng - item.width / offset],
        [item.lat + item.height / offset, item.lng + item.width / offset]
      ], {
        opacity: Settings.markerOpacity,
      });
      this.layer.addLayer(tempMarker);
    });
  }

  set onMap(state) {
    if (state) {
      if (MapBase.map.getZoom() > 5) this.layer.addTo(MapBase.map);
      this.element.removeClass('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo:${this.key}`, 'true');
    } else {
      this.layer.remove();
      this.element.addClass('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo:${this.key}`, 'false');
    }
  }
  get onMap() {
    if (MapBase.isPreviewMode) return false;
    return JSON.parse(localStorage.getItem(`rdo:${this.key}`)) || (JSON.parse(localStorage.getItem(`rdo:${this.key}`)) == null && !this.disabled);
  }
}
