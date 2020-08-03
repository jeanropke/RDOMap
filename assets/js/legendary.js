var Legendary = {
    enabledLegendaries: $.cookie('legendary-enabled') ? $.cookie('legendary-enabled').split(';') : [],
    data: [],
    markers: [],
    load: function () {
      $.getJSON('data/animal_legendary.json?nocache=' + nocache)
        .done(function (data) {
          Legendary.data = data;
          Legendary.set();
        });
      console.info('%c[Legendary Animals] Loaded!', 'color: #bada55; background: #242424');
    },
    set: function (inPreview = false) {
      Legendary.markers = [];
      var shadow = Settings.isShadowsEnabled ? '<img class="shadow" width="' + 35 * Settings.markerSize + '" height="' + 16 * Settings.markerSize + '" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';
      var treasureIcon = L.divIcon({
        iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
        iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
        popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
        html: `
          <img class="icon" src="./assets/images/icons/legendary_animals.png" alt="Icon">
          <img class="background" src="./assets/images/icons/marker_black.png" alt="Background">
          ${shadow}
        `
      });

      $.each(Legendary.data, function (key, value) {
        var circle = L.circle([value.x, value.y], {
          color: "#fdc607",
          fillColor: "#fdc607",
          fillOpacity: 0.5,
          radius: value.radius
        });
  
        var marker = L.marker([value.x, value.y], {
          icon: treasureIcon
        });
  
        marker.bindPopup(`<h1>${Language.get(value.text)}</h1><p>${Language.get(value.text+'.desc')}</p><br><p><a href="https://www.reddit.com/r/RedDeadOnline/comments/i2aqhe/version_3/">Credits to lucas756</a></p><button type="button" class="btn btn-info remove-button" onclick="MapBase.removeItemFromMap('${value.text}', '${value.text}', 'legendary_animals')" data-item="${marker.text}">${Language.get("map.remove_add")}</button>`, {
          minWidth: 400,
          maxWidth: 400
        });
  
        Legendary.markers.push({
          animal: value.text,
          marker: marker,
          circle: circle
        });
      });
  
      Legendary.addToMap();
    },
  
    addToMap: function (inPreview = false) {
  
      Layers.legendaryLayers.clearLayers();
  
      if (!enabledCategories.includes('legendary_animals'))
        return;
  
      var previewLoc = null;
      $.each(Legendary.markers, function (key, value) { 
          if (Legendary.enabledLegendaries.includes(value.animal)) {
            Layers.legendaryLayers.addLayer(value.marker);
            Layers.legendaryLayers.addLayer(value.circle); 
          }   
      });
  
      if (inPreview)
        MapBase.map.setView(previewLoc._latlng, 6);
  
      Layers.legendaryLayers.addTo(MapBase.map);

      Menu.refreshLegendaries();
    },
    save: function () {
      $.cookie('legendary-enabled', Legendary.enabledLegendaries.join(';'), {
        expires: 999
      });
    },
    showHideAll: function (isToHide) {
      if (isToHide) {
        Legendary.enabledLegendaries = [];
      } else {
        Legendary.enabledLegendaries = Legendary.data.map(_legendary => _legendary.text);
      }
      Legendary.addToMap();
      Legendary.save();
    }
  };