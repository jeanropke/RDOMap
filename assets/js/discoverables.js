class Discoverable {
  static init() {
    this.locations = [];
    this.context = document.querySelector('.menu-hidden[data-type=discoverables]');

    return Loader.promises['discoverables'].consumeJson(data => {
      data.forEach(item => {
        this.locations.push(new Discoverable(item));
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

    this.element = document.createElement('div');
    this.element.classList.add('collectible-wrapper');
    Object.assign(this.element.dataset, { help: 'item', type: this.key, tippyContent: Language.get(`menu.discoverables.${this.key}`) });
    this.element.innerHTML = `
    <p class="collectible" data-text="menu.discoverables.${this.key}"></p>
    `;
    this.element.classList.toggle('disabled', !this.onMap);
    this.element.addEventListener('click', () => this.onMap = !this.onMap);
    Language.translateDom(this.element);

    Discoverable.context.appendChild(this.element);

    if (this.onMap && MapBase.map.getZoom() > 5)
      this.layer.addTo(MapBase.map);
  }

  createOverlays() {
    this.layer.clearLayers();
    this.locations.forEach(item => {
      const overlay = `assets/overlays/${(MapBase.isDarkMode ? 'dark' : 'normal')}/discoveries/${item.name}.svg?nocache=${nocache}`;
      const offset = 130;
      const tempMarker = L.imageOverlay(overlay, [
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
      this.element.classList.remove('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo.${this.key}`, 'true');
    } else {
      this.layer.remove();
      this.element.classList.add('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo.${this.key}`, 'false');
    }
  }
  get onMap() {
    if (MapBase.isPreviewMode) return false;
    return JSON.parse(localStorage.getItem(`rdo.${this.key}`)) || (JSON.parse(localStorage.getItem(`rdo.${this.key}`)) == null && !this.disabled);
  }
}
