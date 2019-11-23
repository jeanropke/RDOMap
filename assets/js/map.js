/**
 * Created by Jean on 2019-10-09.
 */

var MapBase = {
    minZoom: 2,
    maxZoom: 7,
    heatmapData: []
};

MapBase.init = function ()
{
    var southWestTiles = L.latLng(-144, 0),
        northEastTiles = L.latLng(0, 176),
        boundsTiles = L.latLngBounds(southWestTiles, northEastTiles);

    var mapLayers = [];
    mapLayers['Default'] = L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', { noWrap: true, bounds: boundsTiles });
    mapLayers['Detailed'] = L.tileLayer('assets/maps/detailed/{z}/{x}_{y}.jpg', { noWrap: true, bounds: boundsTiles});
    mapLayers['Dark'] = L.tileLayer('assets/maps/darkmode/{z}/{x}_{y}.jpg', { noWrap: true, bounds: boundsTiles});

    var cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        radius: 1.5,
        maxOpacity: .5,
        minOpacity: .1,
        // scales the radius based on map zoom
        "scaleRadius": true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": false,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'count',
        gradient: { 0.25: "rgb(125, 125, 125)", 0.55: "rgb(48, 25, 52)", 1.0: "rgb(255, 42, 32)" }


    };
    heatmapLayer = new HeatmapOverlay(cfg);

    map = L.map('map', {
        preferCanvas: true,
        minZoom: MapBase.minZoom,
        maxZoom: MapBase.maxZoom,
        zoomControl: false,
        crs: L.CRS.Simple,
        layers: [mapLayers[Cookies.get('map-layer')], heatmapLayer]
    }).setView([-70, 111.75], 3);

    var baseMaps = {
        "Default": mapLayers['Default'],
        "Detailed": mapLayers['Detailed'],
        "Dark": mapLayers['Dark']
    };

    L.control.zoom({
        position:'bottomright'
    }).addTo(map);

    L.control.layers(baseMaps).addTo(map);

    map.on('click', function (e)
    {
        MapBase.addCoordsOnMap(e);
    });

    map.on('baselayerchange', function (e)
    {
        setMapBackground(e.name);
    });

    var southWest = L.latLng(-170.712, -25.227),
        northEast = L.latLng(10.774, 200.125),
        bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);

    MapBase.loadMarkers();
};

MapBase.addGoose = function(offsetX, posX, offsetY, posY) {
  ciLayer.clearLayers();

  MapBase.debugMarker(offsetX * 2.38 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.38 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.38 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.39 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.39 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.39 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.39 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.4 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.4 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.4 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.4 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.4 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.41 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.41 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.41 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.41 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.42 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.42 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.42 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.42 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.42 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.43 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.43 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.43 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.43 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.44 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.44 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.44 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.44 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.45 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.45 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.45 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.46 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.46 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.46 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.47 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.47 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.47 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.48 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.48 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.48 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.48 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.48 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.49 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.49 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.49 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.49 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.5 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.5 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.5 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.51 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.51 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.52 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.52 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.52 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.53 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.54 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.55 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.56 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.57 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.58 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 0.99 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.59 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 0.99 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.24 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.6 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 0.99 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.24 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.61 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 0.99 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.24 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.62 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 0.99 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.24 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.63 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 0.99 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.24 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.64 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.33 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 2.65 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.33 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.66 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.67 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.68 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.69 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.7 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.71 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.72 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.73 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.73 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.73 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.73 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.73 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.73 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.74 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.74 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.74 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.74 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.74 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.75 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.75 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.75 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.75 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.75 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.76 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.76 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.76 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.76 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.76 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.77 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.77 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.77 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.77 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.77 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.77 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.77 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.77 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.78 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.78 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.78 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.78 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.78 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.78 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.78 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.78 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.79 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.79 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.79 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.79 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.79 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.79 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.79 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.79 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.8 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.81 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.82 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.83 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.35 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.84 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.01 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.03 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.04 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.05 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.09 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.33 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.35 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.72 + posY);
  MapBase.debugMarker(offsetX * 2.85 + posX, offsetY * 1.73 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.02 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.1 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.11 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.12 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.23 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.33 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.34 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.35 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.72 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.73 + posY);
  MapBase.debugMarker(offsetX * 2.86 + posX, offsetY * 1.74 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.18 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.33 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.34 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.35 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.72 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.73 + posY);
  MapBase.debugMarker(offsetX * 2.87 + posX, offsetY * 1.74 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.33 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.34 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.35 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.72 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.73 + posY);
  MapBase.debugMarker(offsetX * 2.88 + posX, offsetY * 1.74 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.33 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.34 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.35 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.72 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.73 + posY);
  MapBase.debugMarker(offsetX * 2.89 + posX, offsetY * 1.74 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.72 + posY);
  MapBase.debugMarker(offsetX * 2.9 + posX, offsetY * 1.73 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.72 + posY);
  MapBase.debugMarker(offsetX * 2.91 + posX, offsetY * 1.73 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.72 + posY);
  MapBase.debugMarker(offsetX * 2.92 + posX, offsetY * 1.73 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.93 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.19 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.2 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.21 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.22 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.94 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.95 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.5 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.51 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 2.96 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.97 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.08 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.98 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.06 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.07 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.17 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 2.99 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 3 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 3 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 3 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 3 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 3 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 3 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 3 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 3.01 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 3.02 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 3.03 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.13 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.16 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.24 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 3.04 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 3.05 + posX, offsetY * 1.14 + posY);
  MapBase.debugMarker(offsetX * 3.05 + posX, offsetY * 1.15 + posY);
  MapBase.debugMarker(offsetX * 3.05 + posX, offsetY * 1.24 + posY);
  MapBase.debugMarker(offsetX * 3.05 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 3.05 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 3.05 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 3.05 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 3.06 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 3.06 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 3.06 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 3.06 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 3.07 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 3.07 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 3.07 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 3.07 + posX, offsetY * 1.71 + posY);
  MapBase.debugMarker(offsetX * 3.08 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 3.08 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 3.09 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 3.09 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 3.09 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 3.09 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 3.1 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 3.1 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 3.1 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 3.1 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 3.1 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 3.1 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 3.1 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 3.11 + posX, offsetY * 1.36 + posY);
  MapBase.debugMarker(offsetX * 3.11 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 3.11 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 3.11 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 3.11 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 3.11 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 3.11 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.37 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.38 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 3.12 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 3.13 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.24 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.27 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.68 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.69 + posY);
  MapBase.debugMarker(offsetX * 3.14 + posX, offsetY * 1.7 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.25 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.26 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 3.15 + posX, offsetY * 1.67 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.32 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.61 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.62 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.63 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.64 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.65 + posY);
  MapBase.debugMarker(offsetX * 3.16 + posX, offsetY * 1.66 + posY);
  MapBase.debugMarker(offsetX * 3.17 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 3.17 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3.17 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 3.18 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 3.18 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 3.18 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3.18 + posX, offsetY * 1.6 + posY);
  MapBase.debugMarker(offsetX * 3.19 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 3.19 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 3.19 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 3.19 + posX, offsetY * 1.56 + posY);
  MapBase.debugMarker(offsetX * 3.19 + posX, offsetY * 1.57 + posY);
  MapBase.debugMarker(offsetX * 3.19 + posX, offsetY * 1.58 + posY);
  MapBase.debugMarker(offsetX * 3.19 + posX, offsetY * 1.59 + posY);
  MapBase.debugMarker(offsetX * 3.2 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 3.2 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 3.2 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 3.2 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 3.2 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 3.2 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 3.2 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.28 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.3 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.31 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.52 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 3.21 + posX, offsetY * 1.55 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.29 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.53 + posY);
  MapBase.debugMarker(offsetX * 3.22 + posX, offsetY * 1.54 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.39 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.42 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.48 + posY);
  MapBase.debugMarker(offsetX * 3.23 + posX, offsetY * 1.49 + posY);
  MapBase.debugMarker(offsetX * 3.24 + posX, offsetY * 1.4 + posY);
  MapBase.debugMarker(offsetX * 3.24 + posX, offsetY * 1.41 + posY);
  MapBase.debugMarker(offsetX * 3.24 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 3.24 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 3.24 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 3.24 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 3.24 + posX, offsetY * 1.47 + posY);
  MapBase.debugMarker(offsetX * 3.25 + posX, offsetY * 1.43 + posY);
  MapBase.debugMarker(offsetX * 3.25 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 3.25 + posX, offsetY * 1.45 + posY);
  MapBase.debugMarker(offsetX * 3.25 + posX, offsetY * 1.46 + posY);
  MapBase.debugMarker(offsetX * 3.26 + posX, offsetY * 1.44 + posY);
  MapBase.debugMarker(offsetX * 3.26 + posX, offsetY * 1.45 + posY);


};

MapBase.loadMarkers = function()
{
    $.getJSON(`data/items.json?nocache=${nocache}`)
        .done(function(data)
        {
            $.each(enabledTypes, function (eKey, eValue)
            {
                if(subCategories.includes(eValue))
                {
                    $.each(data['plants'][eValue], function(mKey, mValue)
                    {
                        markers.push({icon: 'plants', sub_data: eValue, lat: mValue.lat, lng: mValue.lng, count: mValue.count});
                    });
                }
                else
                {
                    if(eValue == 'plants') return;

                    $.each(data[eValue], function (mKey, mValue)
                    {
                        markers.push({ icon: eValue, lat: mValue.lat, lng: mValue.lng });
                    });
                }
            });

            markers = markers.sort(function (a, b) {
                return b.lat - a.lat;
            });

            MapBase.addMarkers();
        });
};
var finalText = '';

MapBase.addMarkers = function()
{
    ciLayer.addTo(map);
    ciLayer.clearLayers();

    ciMarkers = [];
    //markers = markers.sort((a ,b) => (a.lat > b.lat) ? 1 : ((b.lat > a.lat) ? -1 : 0));
    finalText  = '';

    $.each(markers, function (key, value)
    {
        if(enabledTypes.includes(value.icon))
        {
            if(value.sub_data != null) {
                if(!enabledTypes.includes(value.sub_data))
                    return;
            }
            if (searchTerms.length > 0)
            {
                $.each(searchTerms, function (id, term)
                {
                    var tempName = (value.sub_data == null) ? Language.get('menu.'+value.icon) : Language.get('menu.plant.'+value.sub_data);
                    if (tempName.toLowerCase().indexOf(term.toLowerCase()) !== -1)
                    {
                        if (visibleMarkers[value.text] !== null)
                        {
                            MapBase.addMarkerOnMap(value);
                        }
                    }
                });
            }
            else
            {
                MapBase.addMarkerOnMap(value);
            }
        }
    });

    if(ciMarkers.length > 0)
        ciLayer.addLayers(ciMarkers);

    Menu.refreshMenu(firstLoad);
    firstLoad = false;
};

MapBase.populate = function (max = 10000)
{

    ciLayer.clearLayers();
    ciMarkers = [];


    var icon = L.icon({
        iconUrl: `assets/images/markers/random.png`,
        iconSize: [42, 42],
        iconAnchor: [42 / 2, 42],
        popupAnchor: [0, -40]
    });
    for(var i = 0; i < max; i++) {
        var tempMarker = L.marker([MapBase.getRandom(-120.75, -15.25), MapBase.getRandom(-5.25, 187.5)],
            {
                icon: icon
            });

        tempMarker.bindPopup(`I'm marker ${i}`);
        visibleMarkers['random'] = tempMarker;
        ciMarkers.push(tempMarker);
    }

    ciLayer.addLayers(ciMarkers);
};
MapBase.getRandom = function (min, max)
{
    return Math.random() * (max - min) + min;
};

MapBase.addMarkerOnMap = function(value)
{
    var icon = L.icon({
        iconUrl: `assets/images/markers/${value.icon}.png`,
        iconSize:[31.5,42],
        iconAnchor:[31.5/2,42],
        popupAnchor:[0,-38]
    });

    var tempMarker = L.marker([value.lat, value.lng],
        {
            icon: icon
        });


    var popupTitle = (value.sub_data != null) ? Language.get('menu.plant.'+value.sub_data) : Language.get('menu.'+value.icon);
    var popupContent = (value.count != null) ? Language.get('map.plant.count').replace('{count}', value.count).replace('{plant}', Language.get('menu.plant.'+value.sub_data)) : '';
    popupContent = (popupContent == null) ? '' : popupContent;
    tempMarker.bindPopup(
        `<h1 class="popup-title">${popupTitle}</h1>
        <div class="popup-content">
        ${popupContent}
        </div>`
    );
    visibleMarkers[value.text] = tempMarker;
    ciMarkers.push(tempMarker);

};

MapBase.removeCollectedMarkers = function()
{
    $.each(markers, function (key, value)
    {
        if(visibleMarkers[value.text] != null)
        {
            if (disableMarkers.includes(value.text.toString()))
            {
                $(visibleMarkers[value.text]._icon).css('opacity', '.35');
            }
            else
            {
                $(visibleMarkers[value.text]._icon).css('opacity', '1');
            }
        }
    });
};

MapBase.removeItemFromMap = function(value) {
    if(enabledTypes.includes(value)) {
        enabledTypes = $.grep(enabledTypes, function(data) {
            return data != value;
        });
    }
    else {
        enabledTypes.push(value);
    }

    MapBase.addMarkers();
};

MapBase.debugMarker = function (lat, long)
{
    var icon = L.icon({
        iconUrl: `assets/images/markers/random.png`,
        iconSize:[42,42],
        iconAnchor:[42/2,42],
        popupAnchor:[0,-40]
    });
    var marker = L.marker([lat, long], {
        icon: icon
    });

    marker.bindPopup(`<h1>Debug Marker</h1><p>  </p>`);
    ciLayer.addLayer(marker);
};

MapBase.setHeatmap = function(value, category)
{
    heatmapLayer.setData({min: 10, data: Heatmap.data[category][value].data});
};

MapBase.removeHeatmap = function ()
{
    heatmapLayer.setData({min: 10, data: []});
};

var testData = { max: 10, data: [] };
MapBase.addCoordsOnMap = function(coords)
{
    // Show clicked coordinates (like google maps)
    if (showCoordinates)
    {
        $('.lat-lng-container').css('display', 'block');

        $('.lat-lng-container p').html(`lat: ${coords.latlng.lat} <br> lng: ${coords.latlng.lng}`);

        $('#lat-lng-container-close-button').click(function() {
            $('.lat-lng-container').css('display', 'none');
        });
    }

    if(debug == 'addMarker')
    {
        console.log(`{"lat": "${coords.latlng.lat}", "lng": "${coords.latlng.lng}"},`);
    }
    if(debug == 'addPlant')
    {
        console.log(`{"count": "", "lat": "${coords.latlng.lat}", "lng": "${coords.latlng.lng}"},`);
    }
    if(debug == 'addHeatmap') {
        console.log(`{"lat":"${coords.latlng.lat}","lng":"${coords.latlng.lng}","count":"${heatmapCount}"},`);
        testData.data.push({lat: coords.latlng.lat, lng: coords.latlng.lng, count: heatmapCount});
        heatmapLayer.setData(testData);
    }
};
