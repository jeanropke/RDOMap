class Pin {
  constructor(preliminary) {
    this.lat = preliminary.lat;
    this.lng = preliminary.lng;
    this.id = preliminary.id || this.generateHash(`${this.lat}_${this.lng}_${Date.now()}`);
    this.title = preliminary.title || Language.get('map.user_pins.default_title');
    this.description = preliminary.description || Language.get('map.user_pins.default_desc');
    this.icon = preliminary.icon || 'pin';
    this.color = preliminary.color || 'orange';
  }

  generateHash(str) {
    let hash = 0;

    if (str.length == 0) return hash;

    for (let i = 0, l = str.length; i < l; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash;
  }

  updateMarkerContent() {
    let snippet = $(`
      <div>
        <h1 id="${this.id}_name">${this.title}</h1>
        <p id="${this.id}_desc">${this.description}</p>
      </div>
    `);

    if (Settings.isPinsEditingEnabled) {
      const markerIcons = ["pin", "random", "shovel", "magnet", "flower", "bottle", "arrowhead", "egg", "cups", "pentacles", "swords", "wands", "coin", "heirlooms", "fast_travel", "bracelet", "earring", "necklace", "ring", "nazar", "treasure", "camp"];
      const markerColors = ["aquagreen", "beige", "black", "blue", "brown", "cadetblue", "darkblue", "darkgreen", "darkorange", "darkpurple", "darkred", "gray", "green", "lightblue", "lightdarkred", "lightgray", "lightgreen", "lightorange", "lightred", "orange", "pink", "purple", "red", "white", "yellow"];
      const markerIconSelect = $('<select>').attr('id', `${this.id}_icon`).addClass('marker-popup-pin-input-icon');
      const markerColorSelect = $('<select>').attr('id', `${this.id}_color`).addClass('marker-popup-pin-input-icon');

      markerColors.forEach(color => {
        const option = $('<option></option>').attr('value', color).attr('data-text', `map.user_pins.color.${color}`).text(Language.get(`map.user_pins.color.${color}`));
        if (color == this.color) option.attr('selected', 'selected');
        markerColorSelect.append(option);
      });

      markerIcons.forEach(icon => {
        const option = $('<option></option>').attr('value', icon).attr('data-text', `map.user_pins.icon.${icon}`).text(Language.get(`map.user_pins.icon.${icon}`));
        if (icon == this.icon) option.attr('selected', 'selected');
        markerIconSelect.append(option);
      });

      snippet = $(`
        <div>
          <h1>
            <input id="${this.id}_name" class="marker-popup-pin-input-name" type="text" value="${this.title}" placeholder="${Language.get('map.user_pins.placeholder_title')}">
          </h1>
          <p>
            <textarea id="${this.id}_desc" class="marker-popup-pin-input-desc" rows="5" value="${this.description}" placeholder="${Language.get('map.user_pins.placeholder_desc')}">${this.description}</textarea>
          </p>
          <hr class="marker-popup-pin-input-divider">
          <div style="display: grid;">
            <label for="${this.id}_icon" class="marker-popup-pin-label" data-text="map.user_pins.icon">
              ${Language.get('map.user_pins.icon')}
            </label>
            ${markerIconSelect.prop('outerHTML')}

            <label for="${this.id}_color" class="marker-popup-pin-label" data-text="map.user_pins.color">
              ${Language.get('map.user_pins.color')}
            </label>
            ${markerColorSelect.prop('outerHTML')}
          </div>
          <div style="display: grid;">
            <button type="button" class="btn btn-info save-button" data-text="map.user_pins.save">
              ${Language.get('map.user_pins.save')}
            </button>
            <button type="button" class="btn btn-danger remove-button" data-text="map.user_pins.remove">
              ${Language.get('map.user_pins.remove')}
            </button>            
            <small class="popupContentDebug">
              Latitude: ${this.lat} / Longitude: ${this.lng}
            </small>
          </div>
        </div>
        `);
      snippet.find('button.save-button').on('click', () =>
        this.save($(`#${this.id}_name`).val(), $(`#${this.id}_desc`).val(), $(`#${this.id}_icon`).val(), $(`#${this.id}_color`).val())
      );
      snippet.find('button.remove-button').on('click', () => this.remove());
    }

    return snippet[0];
  }

  save(title, desc, icon, color) {
    this.title = title;
    this.description = desc;
    this.icon = icon;
    this.color = color;

    Pins.layer.removeLayer(
      Object.keys(Pins.layer._layers)
        .find(marker => {
          this.lat = Pins.layer._layers[marker]._latlng.lat;
          this.lng = Pins.layer._layers[marker]._latlng.lng;
          return Pins.layer._layers[marker].options.id == this.id;
        }));

    Pins.pinsList = Pins.pinsList.filter(_pin => _pin.id != this.id);

    Pins.addPin(JSON.parse(JSON.stringify(this)));

    Pins.save();
  }

  remove() {
    let id = this.id;
    Pins.pinsList = Pins.pinsList.filter(function (pin) {
      return pin.id != id;
    });

    Pins.layer.removeLayer(Object.keys(Pins.layer._layers).find(marker => Pins.layer._layers[marker].options.id == this.id));

    Pins.save();
  }
}

class Pins {

  static layer = L.layerGroup();

  static init() {

    $('#pins-place-mode').on("change", function () {
      Settings.isPinsPlacingEnabled = $("#pins-place-mode").prop('checked');
      $.cookie('pins-place-enabled', Settings.isPinsPlacingEnabled ? '1' : '0', { expires: 999 });
    });

    $('#pins-edit-mode').on("change", function () {
      Settings.isPinsEditingEnabled = $("#pins-edit-mode").prop('checked');
      $.cookie('pins-edit-enabled', Settings.isPinsEditingEnabled ? '1' : '0', { expires: 999 });

      Pins.loadPins();
    });

    $('#pins-place-new').on("click", function () {
      Pins.addPinToCenter();
    });

    $('#pins-export').on("click", function () {
      try {
        Pins.exportPins();
      } catch (error) {
        console.error(error);
        alert(Language.get('alerts.feature_not_supported'));
      }
    });

    $('#pins-import').on('click', function () {
      try {
        var file = $('#pins-import-file').prop('files')[0];
        var fallback = false;

        if (!file) {
          alert(Language.get('alerts.file_not_found'));
          return;
        }

        try {
          file.text().then((text) => {
            Pins.importPins(text);
          });
        } catch (error) {
          fallback = true;
        }

        if (fallback) {
          var reader = new FileReader();

          reader.addEventListener('loadend', (e) => {
            var text = e.srcElement.result;
            Pins.importPins(text);
          });

          reader.readAsText(file);
        }
      } catch (error) {
        console.error(error);
        alert(Language.get('alerts.feature_not_supported'));
      }
    });

    $("#pins-place-mode").prop('checked', Settings.isPinsPlacingEnabled);
    $("#pins-edit-mode").prop('checked', Settings.isPinsEditingEnabled);

    this.context = $('.menu-option[data-type=user_pins]');
    this.context.toggleClass('disabled', !this.onMap)
      .on('click', () => this.onMap = !this.onMap)
      .translate();

    this.loadPins();

    if (this.onMap)
      this.layer.addTo(MapBase.map);
  }

  static loadPins() {
    this.layer.clearLayers();
    this.pinsList = [];

    if (Pins.isValidJSON(localStorage.getItem(`rdo:pinned-items`))) {
      JSON.parse(localStorage.getItem(`rdo:pinned-items`)).forEach(pinnedItem => {
        this.addPin(pinnedItem);
      });
    }
  }

  static addPin(data) {
    const pin = new Pin(data);
    this.pinsList.push(pin);

    var shadow = Settings.isShadowsEnabled ? '<img class="shadow" width="' + 35 * Settings.markerSize + '" height="' + 16 * Settings.markerSize + '" src="./assets/images/markers-shadow.png" alt="Shadow">' : '';

    Pins.layer.addLayer(
      L.marker([pin.lat, pin.lng], {
        opacity: Settings.markerOpacity,
        icon: new L.DivIcon.DataMarkup({
          iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
          iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
          popupAnchor: [1 * Settings.markerSize, -29 * Settings.markerSize],
          html: `<div>
            <img class="icon" src="assets/images/icons/${pin.icon}.png" alt="Icon">
            <img class="background" src="assets/images/icons/marker_${pin.color}.png" alt="Background">
            ${shadow}
          </div>`
        }),
        id: pin.id,
        draggable: Settings.isPinsEditingEnabled
      })
        .bindPopup(pin.updateMarkerContent(), { minWidth: 300, maxWidth: 400 })
    );
  }

  static addPinToCenter() {
    const center = MapBase.map.getCenter();
    Pins.addPin({ lat: center.lat, lng: center.lng });
  }

  static save() {
    localStorage.setItem(`rdo:pinned-items`, JSON.stringify(this.pinsList));
  }

  static importPins(text) {
    if (Pins.isValidJSON(text)) {
      console.log(text);
      localStorage.setItem(`rdo:pinned-items`, text);
      this.loadPins();
    }
    else {
      alert(Language.get('alerts.file_not_valid'));
      console.log(ex);
      console.log(text);
    }
  }

  static exportPins() {
    const text = localStorage.getItem("rdo:pinned-items");
    const filename = 'pinned-items.txt';

    if (text === null) {
      alert(Language.get('alerts.nothing_to_export'));
      return;
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  static isValidJSON(str) {
    try {
      if (str == null)
        return false;
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  static set onMap(state) {
    if (state) {
      this.layer.addTo(MapBase.map);
      localStorage.setItem(`rdo:pins-enabled`, 'true');
      this.context.removeClass('disabled');
    } else {
      this.layer.remove();
      localStorage.removeItem(`rdo:pins-enabled`);
      this.context.addClass('disabled');
    }
  }
  static get onMap() {
    return !!localStorage.getItem(`rdo:pins-enabled`);
  }
}
