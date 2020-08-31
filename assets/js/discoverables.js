class Discoverable {
    static start = Date.now();
    static layer = L.layerGroup();

    static init() {
        
      if(MapBase.map.getZoom() > 5)
        Discoverable.layer.addTo(MapBase.map);

      MapBase.map.on('zoomend', function(e) {
        if(MapBase.map.getZoom() > 5)
          Discoverable.layer.addTo(MapBase.map);
        else
          Discoverable.layer.remove();
      });

      return Loader.promises['discoverables'].consumeJson(data => {
        data.forEach(item => {
            var overlay = `assets/overlays/${(MapBase.isDarkMode ? 'dark' : 'normal')}/discoveries/${item.name}.png?nocache=${nocache}`;
            let offset = 100;
            var tempMarker = L.imageOverlay(overlay, [[item.lat - item.height / offset, item.lng - item.width / offset], [item.lat + item.height / offset, item.lng + item.width / offset]], {
                opacity: Settings.markerOpacity
            });
            Discoverable.layer.addLayer(tempMarker);
        });
        console.info(`%c[Discoverables] Loaded in ${Date.now() - Discoverable.start}ms!`, 'color: #bada55; background: #242424');
      });
    }
  
    set onMap(state) {
      if (state) {
        if(MapBase.map.getZoom() > 5)
          Discoverable.layer.addTo(MapBase.map);
        localStorage.setItem(`rdo:discoverables`, 'true');
      } else {
        Discoverable.layer.remove();
        localStorage.removeItem(`rdo:discoverables`);
      }
    }
    get onMap() {
      return !!localStorage.getItem(`rdo:discoverables`);
    }
  }