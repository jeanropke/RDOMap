var Heatmap = {
  state: 0,
  data: null,
  staticMarkers: null,

  load: function () {
    $.getJSON(`data/hm.json?nocache=${nocache}`)
      .done(function (data) {
        Heatmap.data = data;
        Heatmap.init();
        Heatmap.state++;
      });

    $.getJSON(`data/animal_spawns.json?nocache=${nocache}`)
      .done(function (data) {
        Heatmap.staticMarkers = data;
        Heatmap.state++;
      });
  },

  init: function () {
    $.each(Heatmap.data, function (heatmapKey, heatmapValue) {
      $.each(heatmapValue, function (key, value) {
        var animalText = key;
        var animalTitle = Language.get(`menu.cmpndm.${key}`);
        var animalImage = $('<img>').attr('src', `./assets/images/icons/game/animals/${key}.png`).addClass('animal-icon');

        var animalElement = $('<div>').addClass('animal-wrapper').attr('data-help', 'item').attr('data-tippy-content', animalTitle).attr('data-type', animalText);
        var animalTextWrapperElement = $('<span>').addClass('animal-text disabled');
        var animalTextElement = $('<p>').addClass('animal').text(animalTitle);

        $(`.menu-hidden[data-type=${heatmapKey}]`).append(animalElement.append(animalImage).append(animalTextWrapperElement.append(animalTextElement)));
      });
      Menu.reorderMenu(`.menu-hidden[data-type=${heatmapKey}]`);
      if(Settings.toolTip == 1)
        tippy('[data-tippy-content]', {theme: 'rdr2-theme'});
    });
  },

  initLayer: function () {
    Layers.heatmapLayer = new HeatmapOverlay({
      radius: 1.5,
      maxOpacity: 0.5,
      minOpacity: 0.1,
      scaleRadius: true,
      useLocalExtrema: false,
      latField: 'lat',
      lngField: 'lng',
      valueField: 'count',
      gradient: {
        0.25: "rgb(125, 125, 125)",
        0.55: "rgb(48, 25, 52)",
        1.0: "rgb(255, 42, 32)"
      }
    });
  },

  setHeatmap: function (value, category) {
    var origData = Heatmap.data[category][value].data;

    MapBase.map.closePopup();
    Layers.animalsLayer.addTo(MapBase.map);

    if (Layers.animalsLayer != null)
      Layers.animalsLayer.clearLayers();

    if (category === "fish") {
      Layers.heatmapLayer.setData({
        data: origData
      });
      return;
    }

    animalMarkers = [];
    Heatmap.data[category][value].groups.forEach((el, i) => {
      animalMarkers = animalMarkers.concat(Heatmap.staticMarkers[el]);
    });

    if (animalMarkers.length > 0) {
      var animalMarkersInst = [];
      var textVal = value;
      var catVal = category;
      MapBase.yieldingLoop(animalMarkers.length, 25, function (i) {
        var preMarker = animalMarkers[i];
        var marker = new Marker(textVal, preMarker.x, preMarker.y, catVal, [preMarker.start, preMarker.end])
        marker.isVisible = false;
        var markerInst = Heatmap.createCanvasMarker(marker);
        if (typeof markerInst == 'undefined') return;
        animalMarkersInst.push(markerInst);
        origData.push({lat: preMarker.x, lng: preMarker.y});
      }, function () {
        Layers.animalsLayer.addLayers(animalMarkersInst);
        Layers.heatmapLayer.setData({
          data: origData
        });
      });
    }
  },

  removeHeatmap: function (reset = false) {
    if (reset) {
      $('.menu-hidden .animal-wrapper').each(function (key, value) {
        $(value).children('span').addClass('disabled');
      });
    }

    Layers.heatmapLayer.setData({
      min: 10,
      data: []
    });

    MapBase.map.closePopup();

    if (Layers.animalsLayer != null)
      Layers.animalsLayer.clearLayers();
  },

  updateMarkerContent: function (marker) {
    var categoryText = Language.get(`menu.cmpndm.${marker.text}`);

    var popupTitle = Language.get(`map.animal_spawns.name`).replace('{animal}', categoryText);
    var popupContent = Language.get(`map.animal_spawns.desc`).replace('{animal}', categoryText);
    var debugDisplayLatLng = $('<small>').text(`Latitude: ${marker.lat} / Longitude: ${marker.lng}`);

    if (marker.subdata[0] !== undefined && marker.subdata[1] !== undefined) {
      var startTime = (marker.subdata[0] > 12) ? (marker.subdata[0]-12 + ':00 PM') : (marker.subdata[0] + ':00 AM');
      var endTime = (marker.subdata[1] > 12) ? (marker.subdata[1]-12 + ':00 PM') : (marker.subdata[1] + ':00 AM');
      popupContent = Language.get(`map.animal_spawns_timed.desc`).replace('{animal}', categoryText).replace('{start}', startTime).replace('{end}', endTime);
    }
    
    return `
      <h1>${popupTitle}</h1>
      <span class="marker-content-wrapper">
        <p>${popupContent}</p>
      </span>
      ${Settings.isDebugEnabled ? debugDisplayLatLng.prop('outerHTML') : ''}
    `;
  },

  createCanvasMarker: function (marker, opacity = 0.75) {
    var tempMarker = L.marker([marker.lat, marker.lng], {
      opacity: opacity,
      icon: new L.divIcon({
        iconUrl: `assets/images/icons/animal.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -8]
      })
    });

    marker.isVisible = true;
    tempMarker.id = marker.text;
    tempMarker.bindPopup(Heatmap.updateMarkerContent(marker), {
      minWidth: 300,
      maxWidth: 400
    });

    return tempMarker;
  },
};