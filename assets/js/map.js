/**
 * Created by Jean on 2019-10-09.
 */

var Map = {
    minZoom: 2,
    maxZoom: 7
};
var myRenderer = L.canvas({ padding: 0.5 });
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

Map.addMarkers = function() {

    markersLayer.clearLayers();

    visibleMarkers = [];
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
                        if (visibleMarkers[value.text] == null)
                        {
                            Map.addMarkerOnMap(value);
                        }
                    }
                });
            }
            else {
                Map.addMarkerOnMap(value);
            }
        }
    });

    markersLayer.addTo(map);
    Menu.refreshMenu();

};

Map.removeItemFromMap = function(itemName)
{
    if(disableMarkers.includes(itemName.toString()))
    {
        disableMarkers = $.grep(disableMarkers, function(value) {
            $.each(routesData, function(key, j){
                if (disableMarkers.includes(value.key)){
                    delete value.hidden;
                }
            });
            return value != itemName.toString();

        });

        if(visibleMarkers[itemName] == null)
            console.warn(`[INFO]: '${itemName}' type is disabled!`);
        else
            $(visibleMarkers[itemName]._icon).css('opacity', '1');

        $('[data-type=' + itemName + ']').removeClass('disabled');

    }
    else
    {
        disableMarkers.push(itemName.toString());
        $.each(routesData[day], function(b, value){
            if (disableMarkers.includes(value.key)){
                value.hidden = true;
            }
        });
        if(visibleMarkers[itemName] == null)
            console.warn(`[INFO]: '${itemName}' type is disabled!`);
        else
            $(visibleMarkers[itemName]._icon).css('opacity', '0.35');
        $('[data-type=' + itemName + ']').addClass('disabled');
    }

    Cookies.set('removed-items', disableMarkers.join(';'), { expires: resetMarkersDaily ? 1 : 999});

    if($("#routes").val() == 1)
        Map.drawLines();

    Menu.refreshItemsCounter();
};


Map.addMarkerOnMap = function(value)
{
    var tempMarker = L.marker([value.lat, value.lng],
        {
            icon: L.canvasIcon({
                iconSize: [35,45],
                iconAnchor: [17,45],
                popupAnchor:[1,-32],
                shadowAnchor:[10,12],
                shadowSize:[36,16],
                fillStyle: 'rgba(255,0,0,1)',
                drawIcon: function (icon, type) {
                    if (type == 'icon')
                    {
                        var size = L.point(this.options.iconSize);
                        var center = L.point(Math.floor(size.x / 2), Math.floor(size.y / 2));

                        var base_image = new Image();
                        base_image.src = './assets/images/icons/' + value.icon + '.png';

                        var ctx = icon.getContext('2d');

                        ctx.beginPath();
                        base_image.onload = function() {
                            ctx.drawImage(base_image, -5, 0, 43, 43);
                        };

                        ctx.arc(17, 17, 17, 3.141592653589793, 4.71238898038469);
                        ctx.arc(17, 17, 17, 4.71238898038469,  6.283185307179586);
                        ctx.moveTo(0, 17);
                        ctx.lineTo(0, 19);
                        ctx.lineTo(17, 45);
                        ctx.lineTo(17*2, 19);
                        ctx.lineTo(17*2, 17);
                        ctx.fillStyle = value.color;
                        ctx.fill();
                        ctx.closePath();

                    }
                }
            })
        });




    tempMarker.bindPopup(`<h1> ${languageData[value.text + '.name']}</h1><p>  ${languageData[value.text + '.desc']} </p>`);

    visibleMarkers[value.text] = tempMarker;
    markersLayer.addLayer(tempMarker);
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

    //console.log(`{"text": "_treasure", "x": "${coords.latlng.lat}", "y": "${coords.latlng.lng}", "radius": "5"},`);
};

