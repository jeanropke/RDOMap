var Layers = {
  itemMarkersLayer: new L.LayerGroup(),
  overlaysLayer: new L.LayerGroup(),
  animalsLayer: L.canvasIconLayer({ zoomAnimation: true }),
  plantsLayer: L.canvasIconLayer({ zoomAnimation: true }),
  discoverablesLayer: L.canvasIconLayer({ zoomAnimation: true }),
  miscLayer: new L.LayerGroup(),
  encountersLayer: new L.LayerGroup(),
  pinsLayer: new L.LayerGroup(),
  heatmapLayer: null,
  oms: null,
};
