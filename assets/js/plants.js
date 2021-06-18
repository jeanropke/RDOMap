class Plants {

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.element = $(`<div class="collectible-wrapper" data-help="item" data-type="${this.key}">`)
      .attr('data-tippy-content', Language.get(`map.plants.${this.key}.name`))
      .on('click', () => {
        this.onMap = !this.onMap; setTimeout(() => PlantsCollection.layer.redraw(), 40);
      })
      .append($(`<img class="collectible-icon" src="./assets/images/icons/game/${this.key}.png">`))
      .append($('<span class="collectible-text">')
        .toggleClass('disabled', !this.onMap)
        .append($('<p class="collectible">').attr('data-text', `map.plants.${this.key}.name`)
          .css('color', () => {
            if (this.key === 'harrietum')
              return '#fdc607';
            else
              return null;
          })))
      .translate();

    this.element.appendTo(PlantsCollection.context);

    this.reinitMarker();

    if (this.onMap) {
      this.onMap = this.onMap;
    }
  }

  reinitMarker() {
    this.markers = [];
    this.locations.forEach(_marker => {
      var tempMarker = L.marker([_marker.x, _marker.y], {
        opacity: Settings.markerOpacity,
        icon: L.divIcon({
          iconUrl: `assets/images/markers/${this.key}.png`,
          iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
          iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
          popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize],
          shadowUrl: 'assets/images/markers-shadow.png',
          shadowSize: [35 * Settings.markerSize, 16 * Settings.markerSize],
          shadowAnchor: [10 * Settings.markerSize, 10 * Settings.markerSize],
        }),
      });
      tempMarker.bindPopup(this.popupContent.bind(this, _marker), { minWidth: 300, maxWidth: 400 });
      this.markers.push(tempMarker);
    });
  }

  popupContent(_marker) {
    const description = Language.get('map.plants.desc').replace(/{plant}/, Language.get(`map.plants.${this.key}.name`));
    const popup = $(`
        <div>
          <h1 data-text="map.plants.${this.key}.name"></h1>
          <span class="marker-content-wrapper">
            <p>${description}</p>
          </span>
          <button class="btn btn-default full-popup-width" data-text="map.remove"></button>
          <small>Latitude: ${_marker.x} / Longitude: ${_marker.y}</small>
        </div>
      `)
      .translate()
      .find('small')
      .toggle(Settings.isDebugEnabled)
      .end()
      .find('button')
      .on('click', () => this.onMap = false)
      .end();

    return popup[0];
  }
  set onMap(state) {
    if (!MapBase.isPreviewMode && !PlantsCollection.onMap) return false;
    if (state) {
      if (!PlantsCollection.enabledCategories.includes(this.key)) {
        PlantsCollection.markers = PlantsCollection.markers.concat(this.markers);
        PlantsCollection.enabledCategories.push(this.key);
      }
      PlantsCollection.layer.clearLayers();
      PlantsCollection.layer.addLayers(PlantsCollection.markers);
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo:${this.key}`, 'true');
      this.element.children('span').removeClass('disabled');
    } else {

      PlantsCollection.markers = PlantsCollection.markers.filter((el) => !this.markers.includes(el));
      PlantsCollection.enabledCategories = $.grep(PlantsCollection.enabledCategories, el => el !== this.key);

      PlantsCollection.layer.clearLayers();
      if (PlantsCollection.markers.length > 0)
        PlantsCollection.layer.addLayers(PlantsCollection.markers);

      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo:${this.key}`);
      this.element.children('span').addClass('disabled');
      MapBase.map.closePopup();
    }
  }

  get onMap() {
    return !!localStorage.getItem(`rdo:${this.key}`);
  }
}

class PlantsCollection {
  static init() {
    this.layer = L.canvasIconLayer({ zoomAnimation: true });
    this.enabledCategories = [];
    this.markers = [];
    this.quickParams = [];

    this.element = $('.menu-option.clickable[data-type=plants]')
      .toggleClass('disabled', !PlantsCollection.onMap)
      .on('click', () => PlantsCollection.onMap = !PlantsCollection.onMap)
      .translate();

    PlantsCollection.layer.addTo(MapBase.map);

    this.locations = [];
    this.context = $('.menu-hidden[data-type=plants]');

    return Loader.promises['plants'].consumeJson(data => {
      data.forEach(item => {
        this.locations.push(new Plants(item));
        this.quickParams.push(item.key);
      });
      console.info('%c[Plants] Loaded!', 'color: #bada55; background: #242424');
      setTimeout(() => PlantsCollection.layer.redraw(), 40);
      Menu.reorderMenu(this.context);
    });
  }

  static set onMap(state) {
    if (state) {
      this.layer.addTo(MapBase.map);
    } else {
      this.layer.remove();
    }
    this.element.toggleClass('disabled', !state);
    this.context.toggleClass('disabled', !state);

    if (!MapBase.isPreviewMode)
      localStorage.setItem('rdo:plants', JSON.stringify(state));

    PlantsCollection.locations.forEach(_plants => {
      if (_plants.onMap) _plants.onMap = state;
    });
  }

  static get onMap() {
    const value = JSON.parse(localStorage.getItem('rdo:plants'));
    return value || value == null;
  }

  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
  }
}
