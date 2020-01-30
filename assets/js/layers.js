var Layers = {
  itemMarkersLayer: new L.LayerGroup(),
  plantsLayer: L.canvasIconLayer({zoomAnimation: true}),
  miscLayer: new L.LayerGroup(),
  encountersLayer: new L.LayerGroup(),
  pinsLayer: new L.LayerGroup(),
  heatmapLayer: null,
  oms: null
};
