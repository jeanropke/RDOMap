class Treasure {

  // requires MapBase.map, Menu.reorderMenu, Settings.some and DOM ready
  // not idempotent
  static init() {
    this.treasuresParentElement = document.querySelector('.menu-option.clickable[data-type=treasure]');
    this.treasuresParentElement.classList.toggle('disabled', !this.treasuresOnMap);
    this.treasuresParentElement.addEventListener('click', () => this.treasuresOnMap = !this.treasuresOnMap);

    this.treasures = [];
    this.quickParams = [];
    this.layer = L.layerGroup();
    this.layer.addTo(MapBase.map);

    const pane = MapBase.map.createPane('treasureX');
    pane.style.zIndex = 450; // X-markers on top of circle, but behind “normal” markers/shadows
    pane.style.pointerEvents = 'none';

    this.context = document.querySelector('.menu-hidden[data-type=treasure]');
    this.context.classList.toggle('disabled', !this.treasuresOnMap);

    this.crossIcon = L.icon({
      iconUrl: './assets/images/icons/cross.png',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    this.onSettingsChanged();

    document.querySelectorAll('.menu-hidden[data-type="treasure"] > *:first-child button').forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const showAll = e.target.getAttribute('data-text') === 'menu.show_all';
        Treasure.treasures.forEach(treasure => treasure.onMap = showAll);
      })
    );

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
  static onSettingsChanged() {
    this.treasures.forEach(treasure => treasure.reinitMarker());
  }

  // not idempotent (on the environment)
  constructor(preliminary) {
    Object.assign(this, preliminary);
    this._shownKey = `shown.${this.text}`;
    this.element = document.createElement('div');
    this.element.classList.add('collectible-wrapper');
    Object.assign(this.element.dataset, { help: 'item', tippyContent: Language.get(this.text) });
    this.element.addEventListener('click', () => this.onMap = !this.onMap);
    this.element.innerHTML = `<p class="collectible" data-text="${this.text}"></p>`;
    Language.translateDom(this.element);

    this.reinitMarker();

    Treasure.context.appendChild(this.element);
  }

  // auto remove marker? from map, recreate marker, auto add? marker
  // idempotent
  reinitMarker() {
    if (this.marker) Treasure.layer.removeLayer(this.marker);
    this.marker = L.layerGroup();
    this.marker.addLayer(L.circle([this.x, this.y], {
      color: '#f4e98a',
      fillColor: '#f4e98a',
      fillOpacity: linear(Settings.overlayOpacity, 0, 1, 0.1, 0.5),
      radius: this.radius,
    })
      .bindPopup(this.popupContent.bind(this), { minWidth: 300 })
    );
    this.locations.forEach(cross =>
      this.marker.addLayer(L.marker([cross.x, cross.y], {
        icon: Treasure.crossIcon,
        pane: 'treasureX',
      })
        .bindPopup(this.popupContent.bind(this), { minWidth: 300 }))
    );
    this.onMap = this.onMap;
  }

  popupContent() {
    const snippet = document.createElement('div');
    snippet.classList.add('handover-wrapper-with-no-influence');
    snippet.innerHTML = `
        <h1 data-text="${this.text}"></h1>
        <button type="button" class="btn btn-info remove-button" data-text="map.remove">
          </button>
    `;
    Language.translateDom(snippet);
    snippet.querySelector('button').addEventListener('click', () => this.onMap = false);

    return snippet;
  }

  set onMap(state) {
    if (state) {
      if (MapBase.isPreviewMode || Treasure.treasuresOnMap)
        Treasure.layer.addLayer(this.marker);
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo.${this._shownKey}`, 'true');
      this.element.classList.remove('disabled');
    } else {
      if (Treasure.treasuresOnMap)
        Treasure.layer.removeLayer(this.marker);
      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo.${this._shownKey}`);
      this.element.classList.add('disabled');
    }
  }
  get onMap() {
    return !!localStorage.getItem(`rdo.${this._shownKey}`);
  }

  static set treasuresOnMap(state) {
    if (state) {
      MapBase.map.addLayer(Treasure.layer);
      if (!MapBase.isPreviewMode)
        localStorage.setItem('rdo.treasures', 'true');

      this.treasures.forEach(_t => {
        if (_t.onMap) _t.onMap = state;
      });
    } else {
      Treasure.layer.remove();
      if (!MapBase.isPreviewMode)
        localStorage.removeItem('rdo.treasures');
    }

    this.treasuresParentElement.classList.toggle('disabled', !state);
    this.context.classList.toggle('disabled', !state);
  }

  static get treasuresOnMap() {
    return !!localStorage.getItem('rdo.treasures');
  }
}
