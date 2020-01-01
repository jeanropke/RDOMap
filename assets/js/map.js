/**
 * Created by Jean on 2019-10-09.
 */

var MapBase = {
    minZoom: 2,
    maxZoom: 7,
    heatmapData: []
};

MapBase.init = function () {
    var southWestTiles = L.latLng(-144, 0),
        northEastTiles = L.latLng(0, 176),
        boundsTiles = L.latLngBounds(southWestTiles, northEastTiles);

    var mapLayers = [];
    mapLayers['Default'] = L.tileLayer('https://s.rsg.sc/sc/images/games/RDR2/map/game/{z}/{x}/{y}.jpg', { noWrap: true, bounds: boundsTiles });
    mapLayers['Detailed'] = L.tileLayer('assets/maps/detailed/{z}/{x}_{y}.jpg', { noWrap: true, bounds: boundsTiles });
    mapLayers['Dark'] = L.tileLayer('assets/maps/darkmode/{z}/{x}_{y}.jpg', { noWrap: true, bounds: boundsTiles });

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
        position: 'bottomright'
    }).addTo(map);

    L.control.layers(baseMaps).addTo(map);

    map.on('click', function (e) {
        MapBase.addCoordsOnMap(e);
    });

    map.on('baselayerchange', function (e) {
        setMapBackground(e.name);
    });

    var southWest = L.latLng(-170.712, -25.227),
        northEast = L.latLng(10.774, 200.125),
        bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);

    MapBase.loadMarkers();
};

MapBase.addGoose = function (offsetX, posX, offsetY, posY) {
    ciLayer.clearLayers();
    //{"text": "earring_duchess_emerald","tool": "2","lat": "-1170.441","lng": "85.439"},
    //MapBase.debugMarker(offsetX * 2431.102 + posX, 	offsetY * 1748.229 + posY);
    //MapBase.debugMarker(offsetX * -5807.756 + posX, 	offsetY * -2853.925 + posY);
    //MapBase.debugMarker(offsetX * 687.0368 + posX, 	offsetY * 1429.984 + posY);
    //MapBase.debugMarker(offsetX * -1170.441 + posX, 	offsetY * 85.439 + posY);
    //MapBase.debugMarker(offsetX * -2731.12 + posX, 	offsetY * -2522.983 + posY);
    //MapBase.debugMarker(offsetX * 2258.174 + posX, 	offsetY * 740.849 + posY);
    //MapBase.debugMarker(offsetX * -2258.174 + posX, 	offsetY * 740.849 + posY);

    /*MapBase.debugMarker(offsetX * 2384.636+ posX, 	offsetY * 702.7831+ posY);
    MapBase.debugMarker(offsetX * 1413.694 + posX, 	offsetY * -1774.543 + posY);
    MapBase.debugMarker(offsetX * -2715.088 + posX, 	offsetY * 716.8932 + posY);
    MapBase.debugMarker(offsetX * -4687.155 + posX, 	offsetY * -3742.616 + posY);
    MapBase.debugMarker(offsetX * 2305.91 + posX, 	offsetY * 2000.815 + posY);
    MapBase.debugMarker(offsetX * 2465.432 + posX, 	offsetY * -991.1915 + posY);*/
    MapBase.gameToMap(1249.602, 1156.183, '0');
    MapBase.gameToMap(2294.689, 2076.941, '1');
    MapBase.gameToMap(2479.74, 2000.122, '2');
    MapBase.gameToMap(1588.217, 2192.406, '3');
    MapBase.gameToMap(-1188.505, 326.9177, '4');
    MapBase.gameToMap(2063.751, -1761.572, '5');
    MapBase.gameToMap(804.661, 831.088, '3');

};
MapBase.gameToMap = function (lat, lng, name) {
    MapBase.debugMarker(offsetX * lat + posX, offsetY * lng + posY, name);
};

MapBase.convertCoords = function (lat, lng) {
    console.log(`"lat": "${0.01554 * lng + -63.6}", "lng": "${0.01554 * lat + 111.35}"`);
};

MapBase.loadMarkers = function () {
    $.getJSON(`data/items.json?nocache=${nocache}`)
        .done(function (data) {
            $.each(enabledTypes, function (eKey, eValue) {
                if (subCategories.includes(eValue)) {
                    $.each(data['plants'][eValue], function (mKey, mValue) {
                        markers.push({ icon: 'plants', sub_data: eValue, lat: mValue.lat, lng: mValue.lng, count: mValue.count });
                    });
                }
                else {
                    if (eValue == 'plants') return;

                    $.each(data[eValue], function (mKey, mValue) {
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

MapBase.addMarkers = function () {
    ciLayer.addTo(map);
    ciLayer.clearLayers();

    ciMarkers = [];
    //markers = markers.sort((a ,b) => (a.lat > b.lat) ? 1 : ((b.lat > a.lat) ? -1 : 0));
    finalText = '';

    $.each(markers, function (key, value) {
        if (enabledTypes.includes(value.icon)) {
            if (value.sub_data != null) {
                if (!enabledTypes.includes(value.sub_data))
                    return;
            }
            if (searchTerms.length > 0) {
                $.each(searchTerms, function (id, term) {
                    var tempName = (value.sub_data == null) ? Language.get('menu.' + value.icon) : Language.get('menu.plant.' + value.sub_data);
                    if (tempName.toLowerCase().indexOf(term.toLowerCase()) !== -1) {
                        if (visibleMarkers[value.text] !== null) {
                            MapBase.addMarkerOnMap(value);
                        }
                    }
                });
            }
            else {
                MapBase.addMarkerOnMap(value);
            }
        }
    });

    if (ciMarkers.length > 0)
        ciLayer.addLayers(ciMarkers);

    Menu.refreshMenu(firstLoad);
    firstLoad = false;
};

MapBase.populate = function (max = 10000) {

    ciLayer.clearLayers();
    ciMarkers = [];


    var icon = L.icon({
        iconUrl: `assets/images/markers/random.png`,
        iconSize: [42, 42],
        iconAnchor: [42 / 2, 42],
        popupAnchor: [0, -40]
    });
    for (var i = 0; i < max; i++) {
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
MapBase.getRandom = function (min, max) {
    return Math.random() * (max - min) + min;
};

MapBase.addMarkerOnMap = function (value) {
    var icon = L.icon({
        iconUrl: `assets/images/markers/${value.icon}.png`,
        iconSize: [31.5, 42],
        iconAnchor: [31.5 / 2, 42],
        popupAnchor: [0, -38]
    });

    var tempMarker = L.marker([value.lat, value.lng],
        {
            icon: icon
        });


    var popupTitle = (value.sub_data != null) ? Language.get('menu.plant.' + value.sub_data) : Language.get('menu.' + value.icon);
    var popupContent = (value.count != null) ? Language.get('map.plant.count').replace('{count}', value.count).replace('{plant}', Language.get('menu.plant.' + value.sub_data)) : '';
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

MapBase.removeCollectedMarkers = function () {
    $.each(markers, function (key, value) {
        if (visibleMarkers[value.text] != null) {
            if (disableMarkers.includes(value.text.toString())) {
                $(visibleMarkers[value.text]._icon).css('opacity', '.35');
            }
            else {
                $(visibleMarkers[value.text]._icon).css('opacity', '1');
            }
        }
    });
};

MapBase.removeItemFromMap = function (value) {
    if (enabledTypes.includes(value)) {
        enabledTypes = $.grep(enabledTypes, function (data) {
            return data != value;
        });
    }
    else {
        enabledTypes.push(value);
    }

    MapBase.addMarkers();
};

MapBase.debugMarker = function (lat, long, name = 'Debug Marker') {
    var icon = L.icon({
        iconUrl: `assets/images/markers/random.png`,
        iconSize: [42, 42],
        iconAnchor: [42 / 2, 42],
        popupAnchor: [0, -40]
    });
    var marker = L.marker([long, lat], {
        icon: icon
    });

    marker.bindPopup(`<h1>${name}</h1><p>  </p>`);
    ciLayer.addLayer(marker);
};

MapBase.setHeatmap = function (value, category) {
    heatmapLayer.setData({ min: 10, data: Heatmap.data[category][value].data });
};

MapBase.removeHeatmap = function () {
    heatmapLayer.setData({ min: 10, data: [] });
};

var testData = { max: 10, data: [] };
MapBase.addCoordsOnMap = function (coords) {
    // Show clicked coordinates (like google maps)
    if (showCoordinates) {
        $('.lat-lng-container').css('display', 'block');

        $('.lat-lng-container p').html(`lat: ${coords.latlng.lat} <br> lng: ${coords.latlng.lng}`);

        $('#lat-lng-container-close-button').click(function () {
            $('.lat-lng-container').css('display', 'none');
        });
    }

    if (debug == 'addMarker') {
        console.log(`{"lat": "${coords.latlng.lat}", "lng": "${coords.latlng.lng}"},`);
    }
    if (debug == 'addPlant') {
        console.log(`{"count": "", "lat": "${coords.latlng.lat}", "lng": "${coords.latlng.lng}"},`);
    }
    if (debug == 'addHeatmap') {
        console.log(`{"lat":"${coords.latlng.lat}","lng":"${coords.latlng.lng}","count":"${heatmapCount}"},`);
        testData.data.push({ lat: coords.latlng.lat, lng: coords.latlng.lng, count: heatmapCount });
        heatmapLayer.setData(testData);
    }
};
