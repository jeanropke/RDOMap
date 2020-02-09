var Encounters = {
  markers: [],
  load: function () {
    $.getJSON('data/encounters.json?nocache=' + nocache)
      .done(function (data) {
        Encounters.set(data);
      });
    console.info('%c[Encounters] Loaded!', 'color: #bada55; background: #242424');
  },
  set: function (data) {
    $.each(data, function (_category, _markers) {
      $.each(_markers, function (key, marker) {
        Encounters.markers.push(new Marker(marker.text, marker.x, marker.y, _category));
      });
    });

    Encounters.addToMap();
  },

  updateMarkerContent: function (marker) {
    var popupContent = marker.description;

    // TODO: Fix later. :-)
    // var shareText = `<a href="javascript:void(0)" onclick="setClipboardText('https://jeanropke.github.io/RDOMap/?m=${marker.text}')">${Language.get('map.copy_link')}</a>`;
    // var importantItem = ` | <a href="javascript:void(0)" onclick="MapBase.highlightImportantItem('${marker.text || marker.subdata}', '${marker.category}')">${Language.get('map.mark_important')}</a>`;
    // var linksElement = $('<p>').addClass('marker-popup-links').append(shareText).append(importantItem);
    var linksElement = $('<p>');
    var debugDisplayLatLng = $('<small>').text(`Latitude: ${marker.lat} / Longitude: ${marker.lng}`);

    return `<h1>${marker.title}</h1>
        <span class="marker-content-wrapper">
        <p>${popupContent}</p>
        </span>
        ${linksElement.prop('outerHTML')}
        ${Settings.isDebugEnabled ? debugDisplayLatLng.prop('outerHTML') : ''}
        `;
  },

  addToMap: function () {
    Layers.encountersLayer.clearLayers();
    $.each(Encounters.markers, function (key, marker) {
      if (!enabledCategories.includes(marker.category)) return;

      var shadow = Settings.isShadowsEnabled ? '<img class="shadow" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
      var tempMarker = L.marker([marker.lat, marker.lng], {
        icon: L.divIcon({
          iconSize: [35, 45],
          iconAnchor: [17, 42],
          popupAnchor: [0, -28],
          shadowAnchor: [10, 12],
          html: `
            <img class="icon" src="./assets/images/icons/${marker.category}.png" alt="Icon">
            <img class="background" src="./assets/images/icons/marker_${Encounters.getIconColor(marker.category)}.png" alt="Background">
            ${shadow}
          `
        })
      });

      tempMarker.bindPopup(Encounters.updateMarkerContent(marker), { minWidth: 300, maxWidth: 400 });
      Layers.encountersLayer.addLayer(tempMarker);
    });
    Layers.encountersLayer.addTo(MapBase.map);
  },

  getIconColor: function (value) {
    switch (value) {
      case "escort":
        return "blue";
      case "defend_campsite":
        return "orange";
      case "ambush":
        return "red";
      case "people_in_need":
      case "runaway_wagon":
      case "hogtied_lawman":
      case "rescue":
        return "blue";
      case "fame_seeker":
      case "hostile_conversation":
        return "lightgray";
      case "tree_map":
      case "treasure_hunter":
      case "egg_encounter":
      case "grave_robber":
      case "dog_encounter":
      case "wounded_animal":
      case "rival_collector":
      case "moonshiner_camp":
        return "purple";
      default:
        return "lightred";
    }
  }
};
