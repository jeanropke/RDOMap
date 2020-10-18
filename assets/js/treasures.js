class Treasure {

  // requires MapBase.map, Menu.reorderMenu, Settings.some and DOM ready
  // not idempotent
  static init() {
    this.treasuresParentElement = $('.menu-option.clickable[data-type=treasure]')
      .toggleClass('disabled', !this.treasuresOnMap)
      .on('click', () => this.treasuresOnMap = !this.treasuresOnMap);
    this.treasures = [];
    this.quickParams = [];
    this.layer = L.layerGroup();
    this.layer.addTo(MapBase.map);
    const pane = MapBase.map.createPane('treasureX');
    pane.style.zIndex = 450; // X-markers on top of circle, but behind “normal” markers/shadows
    pane.style.pointerEvents = 'none';
    this.context = $('.menu-hidden[data-type=treasure]').toggleClass('disabled', !this.treasuresOnMap);
    this.crossIcon = L.icon({
      iconUrl: './assets/images/icons/cross.png',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    this.onSettingsChanged();
    $('.menu-hidden[data-type="treasure"] > *:first-child a').click(e => {
      e.preventDefault();
      const showAll = $(e.target).attr('data-text') === 'menu.show_all';
      Treasure.treasures.forEach(treasure => treasure.onMap = showAll);
    });
    return Loader.promises['treasures'].consumeJson(data => {
      data.forEach(item => {
        this.treasures.push(new Treasure(item));
        this.quickParams.push(item.text);
      });
      this.onLanguageChanged();
      console.info('%c[Treasures] Loaded!', 'color: #bada55; background: #242424');
    });
  }
  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
  }
  static onSettingsChanged(markerSize = Settings.markerSize, shadow = Settings.isShadowsEnabled) {
    this.mainIcon = L.divIcon({
      iconSize: [35 * markerSize, 45 * markerSize],
      iconAnchor: [17 * markerSize, 42 * markerSize],
      popupAnchor: [1 * markerSize, -29 * markerSize],
      html: `
        <img class="icon" src="./assets/images/icons/treasure.png" alt="Icon">
        <img class="background" src="./assets/images/icons/marker_${MapBase.colorOverride || 'beige'}.png" alt="Background">
        ${shadow ? `<img class="shadow" width="${35 * markerSize}" height="${16 * markerSize}"
            src="./assets/images/markers-shadow.png" alt="Shadow">` : ''}
      `,
    });
    this.treasures.forEach(treasure => treasure.reinitMarker());
  }

  // not idempotent (on the environment)
  constructor(preliminary) {
    Object.assign(this, preliminary);
    this._shownKey = `shown.${this.text}`;
    this.element = $('<div class="collectible-wrapper" data-help="item">')
      .attr('data-tippy-content', Language.get(this.text))
      .on('click', () => this.onMap = !this.onMap)
      .append($('<p class="collectible">').attr('data-text', this.text))
      .translate();
    this.reinitMarker();
    this.element.appendTo(Treasure.context);
  }

  // auto remove marker? from map, recreate marker, auto add? marker
  // idempotent
  reinitMarker() {
    if (this.marker) Treasure.layer.removeLayer(this.marker);
    this.marker = L.layerGroup();
    this.marker.addLayer(L.circle([this.x, this.y], {
      color: '#f4e98a',
      fillColor: '#f4e98a',
      fillOpacity: 0.5,
      radius: this.radius,
    }));
    this.marker.addLayer(L.marker([this.x, this.y], { icon: Treasure.mainIcon })
      .bindPopup(this.popupContent.bind(this), { minWidth: 300 })
    );
    this.locations.forEach(cross =>
      this.marker.addLayer(L.marker([cross.x, cross.y], {
        icon: Treasure.crossIcon,
        pane: 'treasureX',
      }))
    );
    this.onMap = this.onMap;
  }
  popupContent() {
    const snippet = $(`<div class="handover-wrapper-with-no-influence">
        <h1 data-text="${this.text}"></h1>
        <button type="button" class="btn btn-info remove-button" data-text="map.remove">
          </button>
      </div>`).translate();
    snippet.find('button').on('click', () => this.onMap = false);
    return snippet[0];
  }
  set onMap(state) {
    if (state) {
      if (Treasure.treasuresOnMap)
        Treasure.layer.addLayer(this.marker);
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo:${this._shownKey}`, 'true');
      this.element.removeClass('disabled');
    } else {
      if (Treasure.treasuresOnMap)
        Treasure.layer.removeLayer(this.marker);
      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo:${this._shownKey}`);
      this.element.addClass('disabled');
    }
  }
  get onMap() {
    return !!localStorage.getItem(`rdo:${this._shownKey}`);
  }

  static set treasuresOnMap(state) {
    if (state) {
      MapBase.map.addLayer(Treasure.layer);
      if (!MapBase.isPreviewMode)
        localStorage.setItem('rdo:treasures', 'true');

      this.treasures.forEach(_t => {
        if (_t.onMap) _t.onMap = state;
      });
    } else {
      Treasure.layer.remove();
      if (!MapBase.isPreviewMode)
        localStorage.removeItem('rdo:treasures');
    }

    this.treasuresParentElement.toggleClass('disabled', !state);
    this.context.toggleClass('disabled', !state);
  }

  static get treasuresOnMap() {
    return !!localStorage.getItem('rdo:treasures');
  }
}
