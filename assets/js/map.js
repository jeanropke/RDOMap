/**
 * Created by Jean on 2019-10-09.
 */

var Map = {
    minZoom: 2,
    maxZoom: 7
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

    map = L.map('map', {
        preferCanvas: true,
        minZoom: Map.minZoom,
        maxZoom: Map.maxZoom,
        zoomControl: false,
        crs: L.CRS.Simple,
        layers: [mapLayers[Cookies.get('map-layer')]]
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

    map.on('popupopen', function()
    {
        $('.remove-button').click(function(e)
        {
            Map.removeItemFromMap($(event.target).data("item"));
        });
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

Map.addMarkers = function()
{
    ciLayer.addTo(map);
    ciLayer.clearLayers();

    ciMarkers = [];

    $.each(markers, function (key, value)
    {
        if(enabledTypes.includes(value.icon))
        {
            if (languageData[value.text+'.name'] == null)
            {
                console.error(`[LANG][${lang}]: Text not found: '${value.text}.name'`);
                languageData[value.text+'.name'] = `${value.text}.name`;
            }

            if (languageData[value.text+'.desc'] == null)
            {
                console.error(`[LANG][${lang}]: Text not found: '${value.text}.desc'`);
                languageData[value.text+'.desc'] = `${value.text}.desc`;
            }

            if (searchTerms.length > 0)
            {
                $.each(searchTerms, function (id, term)
                {
                    if (languageData[value.text+'.name'].toLowerCase().indexOf(term.toLowerCase()) !== -1)
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

Map.addMarkerOnMap = function(value)
{
    var icon = L.icon({
        iconUrl: `assets/images/markers/${value.icon}.png`,
        iconSize:[42,42],
        iconAnchor:[42/2,42],
        popupAnchor:[0,-40]
    });
    var tempMarker = L.marker([value.lat, value.lng],
        {
            icon: icon
        });

    tempMarker.bindPopup(`<h1> ${languageData[value.text + '.name']}</h1><p>  ${languageData[value.text + '.desc']} </p>`);
    visibleMarkers[value.text] = tempMarker;
    ciMarkers.push(tempMarker);

};

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

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

Map.debugMarker = function (lat, long)
{
    var marker = L.marker([lat, long], {
    icon: L.AwesomeMarkers.icon({
        iconUrl: './assets/images/icons/help.png',
        markerColor: 'darkblue'
    })
});

    marker.bindPopup(`<h1>Debug Marker</h1><p>  </p>`);
    markersLayer.addLayer(marker);
};

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

    console.log(`{"text": "campfire_", "icon": "campfires", "lat": "${coords.latlng.lat}", "lng": "${coords.latlng.lng}"},`);
};

