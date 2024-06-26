class Camp {
  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.element = document.createElement('div');
    this.element.className = 'collectible-wrapper';
    Object.assign(this.element.dataset, { help: 'item', type: this.key, tippyContent: Language.get(`map.camps.${this.key}.name`) });
    this.element.innerHTML = `
      <span class="collectible-text ${!this.onMap ? 'disabled' : ''}">
        <p class="collectible" data-text="map.camps.${this.key}.name"></p>
      </span>
    `;
    this.element.addEventListener('click', () => {
      this.onMap = !this.onMap; 
      setTimeout(() => CampCollection.layer.redraw(), 40);
    });
    Language.translateDom(this.element);

    CampCollection.context.appendChild(this.element);

    this.reinitMarker();

    if (this.onMap) {
      this.onMap = this.onMap;
    }
  }

  reinitMarker() {
    this.markers = [];
    const markerSize = Settings.markerSize;
    this.locations.forEach(_marker => {
      if (!CampCollection.isLarge && _marker.type === 'large') return;
      if (!CampCollection.isSmall && _marker.type === 'small') return;
      if (!CampCollection.isWilderness && _marker.type === 'wild') return;
      const tempMarker = L.marker([_marker.x, _marker.y], {
        opacity: Settings.markerOpacity,
        icon: L.divIcon({
          iconUrl: 'assets/images/markers/camp.png',
          iconSize: [35 * markerSize, 45 * markerSize],
          iconAnchor: [17 * markerSize, 42 * markerSize],
          popupAnchor: [0 * markerSize, -28 * markerSize],
          shadowUrl: Settings.isShadowsEnabled ? 'assets/images/markers-shadow.png' : '',
          shadowSize: [35 * markerSize, 16 * markerSize],
          shadowAnchor: [10 * markerSize, 10 * markerSize],
        }),
      });

      tempMarker.bindPopup(this.popupContent.bind(this, _marker), { minWidth: 300, maxWidth: 400 });
      this.markers.push(tempMarker);
    });
  }

  popupContent(_marker) {
    const title = `${Language.get(`map.camps.${this.key}.name`)} - ${Language.get(`map.camps.sizes.${_marker.type}`)}`;
    const description = Language.get('map.camps.desc');
    const popup = document.createElement('div');
    popup.innerHTML = `
      <h1>${title}</h1>
      <span class="marker-content-wrapper">
        <p>${description}</p>
      </span>
      <button class="btn btn-default full-popup-width" data-text="map.remove"></button>
      <small>Latitude: ${_marker.x} / Longitude: ${_marker.y}</small>
    `;
    Language.translateDom(popup);

    if (!Settings.isDebugEnabled)
      popup.querySelector('small').style.display = 'none';
    popup.querySelector('button').addEventListener('click', () => this.onMap = false);

    return popup;
  }

  set onMap(state) {
    if (!MapBase.isPreviewMode && !CampCollection.onMap) return false;
    if (state) {
      if (!CampCollection.enabledCategories.includes(this.key)) {
        CampCollection.markers = CampCollection.markers.concat(this.markers);
        CampCollection.enabledCategories.push(this.key);
      }
      CampCollection.layer.clearLayers();
      if (CampCollection.markers.length > 0)
        CampCollection.layer.addLayers(CampCollection.markers);
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo.${this.key}`, 'true');
      this.element.querySelector('span').classList.remove('disabled');
    } else {
      CampCollection.markers = CampCollection.markers.filter((el) => !this.markers.includes(el));
      CampCollection.enabledCategories = CampCollection.enabledCategories.filter(el => el !== this.key);

      CampCollection.layer.clearLayers();

      if (CampCollection.markers.length > 0)
        CampCollection.layer.addLayers(CampCollection.markers);

      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo.${this.key}`);
      this.element.querySelector('span').classList.add('disabled');
      MapBase.map.closePopup();
    }
  }

  get onMap() {
    return !!localStorage.getItem(`rdo.${this.key}`);
  }
}

class CampCollection {
  static init() {
    this.isLarge = true;
    this.isSmall = true;
    this.isWilderness = true;
    
    this.layer = L.canvasIconLayer({ zoomAnimation: true });
    this.enabledCategories = [];
    this.markers = [];
    this.quickParams = [];

    this.element = document.querySelector('.menu-option.submenu-only[data-type=camps]');
    this.element.classList.toggle('disabled', !CampCollection.onMap);
    this.element.addEventListener('click', () => CampCollection.onMap = !CampCollection.onMap);
    Language.translateDom(this.element);

    CampCollection.layer.addTo(MapBase.map);

    this.locations = [];
    this.context = document.querySelector('.menu-hidden[data-type=camps]');

    return Loader.promises['camps'].consumeJson(data => {
      data.forEach(item => {
        this.locations.push(new Camp(item));
        this.quickParams.push(item.key);
      });
      console.info('%c[Camps] Loaded!', 'color: #bada55; background: #242424');
      setTimeout(() => CampCollection.layer.redraw(), 40);
      Menu.reorderMenu(this.context);
    });
  }

  static set onMap(state) {
    if (state) {
      if (this.markers.length > 0)
        this.layer.addTo(MapBase.map);
    } else {
      this.layer.remove();
    }
    this.element.classList.toggle('disabled', !state);
    this.context.classList.toggle('disabled', !state);

    if (!MapBase.isPreviewMode)
      localStorage.setItem('rdo.camps', JSON.stringify(state));

    CampCollection.locations.forEach(_camps => {
      if (_camps.onMap) _camps.onMap = state;
    });
  }

  static get onMap() {
    const value = JSON.parse(localStorage.getItem('rdo.camps'));
    return value || value == null;
  }

  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
  }

  static onSettingsChanged() {
    this.refresh();
  }

  static refresh() {
    this.markers = [];
    this.locations.forEach(camp => {
      camp.reinitMarker();
      if (camp.onMap)
        this.markers = this.markers.concat(camp.markers);
    });
    this.layer.clearLayers();
    if (this.markers.length > 0)
      this.layer.addLayers(this.markers);
  }
}