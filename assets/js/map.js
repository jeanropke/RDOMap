/**
 * Created by Jean on 2019-10-09.
 */

var Map = {
    minZoom: 2,
    maxZoom: 7,
    heatmapData: []
};

Map.init = function ()
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
        "radius": 2,
        "maxOpacity": .8,
        // scales the radius based on map zoom
        "scaleRadius": true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": true,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'count',
        gradient: { 0.25: "rgb(125,125,125)", 0.55: "rgb(0,0,125)", 1.0: "rgb(255,42,32)" }
    };
    heatmapLayer = new HeatmapOverlay(cfg);


    map = L.map('map', {
        preferCanvas: true,
        minZoom: Map.minZoom,
        maxZoom: Map.maxZoom,
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
       Map.addCoordsOnMap(e);
    });

    map.on('baselayerchange', function (e)
    {
        setMapBackground(e.name);
    });

    //map.setMaxBounds(bounds);

    Map.loadMarkers();
};

Map.loadMarkers = function()
{
    markers = [];
    $.getJSON(`data/items.json?nocache=${nocache}`)
        .done(function(data) {
            markers = data;
            Map.addMarkers();
        });
};
var finalText = '';
Map.addMarkers = function()
{
    ciLayer.addTo(map);
    ciLayer.clearLayers();

    ciMarkers = [];

    finalText  = '';
    $.each(markers, function (key, value)
    {
        if(enabledTypes.includes(value.icon))
        {
            if (languageData[lang][value.text+'.name'] == null)
            {
                console.error(`[LANG][${lang}]: Text not found: '${value.text}.name'`);
                languageData[lang][value.text+'.name'] = `${value.text}.name`;

                var devName = value.text.replace('plant_', '');
                var plantId = devName.split('_')[devName.split('_').length-1];
                var categoryName = devName.replace('_' + plantId, '');
                var langName = languageData[lang][categoryName];
                finalText +=
                `{"key": "${value.text}.name", "value": "${langName} #${plantId}"},
                 {"key": "${value.text}.desc", "value": ""},
                    `;
                console.log()

            }

            if (languageData[lang][value.text+'.desc'] == null)
            {
                console.error(`[LANG][${lang}]: Text not found: '${value.text}.desc'`);
                languageData[lang][value.text+'.desc'] = `${value.text}.desc`;
            }

            if(value.sub_data != null) {
                if(!enabledTypes.includes(value.sub_data))
                    return;
            }
            if (searchTerms.length > 0)
            {
                $.each(searchTerms, function (id, term)
                {
                    if (languageData[lang][value.text+'.name'].toLowerCase().indexOf(term.toLowerCase()) !== -1)
                    {
                        if (visibleMarkers[value.text] !== null)
                        {
                            Map.addMarkerOnMap(value);
                        }
                    }
                });
            }
            else
            {
                Map.addMarkerOnMap(value);
            }
        }
    });

    if(ciMarkers.length > 0)
        ciLayer.addLayers(ciMarkers);

    Menu.refreshMenu();

};

Map.populate = function (max = 10000)
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
        var tempMarker = L.marker([Map.getRandom(-120.75, -15.25), Map.getRandom(-5.25, 187.5)],
            {
                icon: icon
            });

        tempMarker.bindPopup(`I'm marker ${i}`);
        visibleMarkers['random'] = tempMarker;
        ciMarkers.push(tempMarker);
    }

    ciLayer.addLayers(ciMarkers);
};
Map.getRandom = function (min, max)
{
    return Math.random() * (max - min) + min;
};

Map.addMarkerOnMap = function(value)
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

    tempMarker.bindPopup(`<h1> ${languageData[lang][value.text + '.name']}</h1><p>  ${languageData[lang][value.text + '.desc']} </p>`);
    visibleMarkers[value.text] = tempMarker;
    ciMarkers.push(tempMarker);

};

Map.removeCollectedMarkers = function()
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

Map.removeItemFromMap = function(value) {
    if(enabledTypes.includes(value)) {
        enabledTypes = $.grep(enabledTypes, function(data) {
            return data != value;
        });
    }
    else {
        enabledTypes.push(value);
    }

    Map.addMarkers();
};

Map.debugMarker = function (lat, long)
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

Map.setHeatmap = function(value)
{
    heatmapLayer.setData({max: 800, data: Heatmap.data[value]});
};

Map.removeHeatmap = function ()
{
    heatmapLayer.setData({max: 800, data: []});
};

var testData = { max: 800, data: [] };
Map.addCoordsOnMap = function(coords)
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
        console.log(`{"text": "plant_chanterelle_", "icon": "plants", "sub_data": "chanterelle", "lat": "${coords.latlng.lat}", "lng": "${coords.latlng.lng}"},`);
        //console.log(`{"text": "campfire_", "icon": "campfires", "lat": "${coords.latlng.lat}", "lng": "${coords.latlng.lng}"},`);

    }
    if(debug == 'addHeatmap') {
        console.log(`{"lat": "${coords.latlng.lat}", "lng": "${coords.latlng.lng}", "count": "1"},`);
        testData.data.push({lat: coords.latlng.lat, lng: coords.latlng.lng, count: 1});
        heatmapLayer.setData(testData);
    }
};

