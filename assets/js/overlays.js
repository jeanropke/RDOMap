class Overlay {
  static init() {
    this.locations = [];

    this.layer = L.layerGroup();
    this.layer.addTo(MapBase.map);

    return Loader.promises['overlays'].consumeJson(data => {
      data.forEach(item => this.locations.push(item));
      console.info('%c[Overlays] Loaded!', 'color: #bada55; background: #242424');
      this.onSettingsChanged();
    });
  }

  static onSettingsChanged() {
    this.layer.clearLayers();
    this.locations.forEach(item => {
      var overlay = `assets/overlays/${(MapBase.isDarkMode ? 'dark' : 'normal')}/${item.key}.png?nocache=${nocache}`;
      Overlay.layer.addLayer(L.imageOverlay(overlay, item.locations, {
        opacity: Settings.overlayOpacity,
      }));
    });
  }
}
