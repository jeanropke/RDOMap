class Plants {
  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.element = document.createElement('div');
    this.element.className = 'collectible-wrapper';
    Object.assign(this.element.dataset, { help: 'item', type: this.key, tippyContent: Language.get(`map.plants.${this.key}.name`) });
    this.element.innerHTML = `
      <img class="collectible-icon" src="./assets/images/icons/game/${this.key}.png">
      <span class="collectible-text ${!this.onMap ? 'disabled' : ''}">
        <p class="collectible" data-text="map.plants.${this.key}.name" style="color: ${this.key === 'harrietum' ? '#fdc607' : 'inherit'}"></p>
      </span>
    `;
    
    this.element.addEventListener('click', () => {
      this.onMap = !this.onMap; 
      setTimeout(() => PlantsCollection.layer.redraw(), 40);
    });
    Language.translateDom(this.element);

    PlantsCollection.context.appendChild(this.element);

    this.reinitMarker();

    if (this.onMap) {
      this.onMap = this.onMap;
    }
  }

  reinitMarker() {
    this.markers = [];
    const markerSize = Settings.markerSize;
    this.locations.forEach(_marker => {
      const tempMarker = L.marker([_marker.x, _marker.y], {
        opacity: Settings.markerOpacity,
        icon: L.divIcon({
          iconUrl: `assets/images/markers/${this.key}.png`,
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
    const description = Language.get('map.plants.desc').replace(/{plant}/, Language.get(`map.plants.${this.key}.name`).toLowerCase());
    
    const popup = document.createElement('div');
    popup.innerHTML = `
          <h1 data-text="map.plants.${this.key}.name"></h1>
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
    if (!MapBase.isPreviewMode && !PlantsCollection.onMap) return false;
    if (state) {
      if (!PlantsCollection.enabledCategories.includes(this.key)) {
        PlantsCollection.markers = PlantsCollection.markers.concat(this.markers);
        PlantsCollection.enabledCategories.push(this.key);
      }
      PlantsCollection.layer.clearLayers();
      if (PlantsCollection.markers.length > 0)
        PlantsCollection.layer.addLayers(PlantsCollection.markers);
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo.${this.key}`, 'true');
      this.element.querySelector('span').classList.remove('disabled');
    } else {
      PlantsCollection.markers = PlantsCollection.markers.filter(el => !this.markers.includes(el));
      PlantsCollection.enabledCategories = PlantsCollection.enabledCategories.filter(el => el !== this.key);

      PlantsCollection.layer.clearLayers();
      if (PlantsCollection.markers.length > 0)
        PlantsCollection.layer.addLayers(PlantsCollection.markers);

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

class PlantsCollection {
  static init() {
    this.layer = L.canvasIconLayer({ zoomAnimation: true });
    this.enabledCategories = [];
    this.markers = [];
    this.quickParams = [];

    this.element = document.querySelector('.menu-option.clickable[data-type=plants]');
    this.element.classList.toggle('disabled', !PlantsCollection.onMap);
    this.element.addEventListener('click', () => PlantsCollection.onMap = !PlantsCollection.onMap);
    Language.translateDom(this.element);

    PlantsCollection.layer.addTo(MapBase.map);

    this.locations = [];
    this.context = document.querySelector('.menu-hidden[data-type=plants]');

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
      if (this.markers.length > 0)
        this.layer.addTo(MapBase.map);
    } else {
      this.layer.remove();
    }
    this.element.classList.toggle('disabled', !state);
    this.context.classList.toggle('disabled', !state);

    if (!MapBase.isPreviewMode)
      localStorage.setItem('rdo.plants', JSON.stringify(state));

    PlantsCollection.locations.forEach(_plants => {
      if (_plants.onMap) _plants.onMap = state;
    });
  }

  static get onMap() {
    const value = JSON.parse(localStorage.getItem('rdo.plants'));
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
    this.locations.forEach(plants => {
      plants.reinitMarker();
      if (plants.onMap)
        this.markers = this.markers.concat(plants.markers);
    });
    this.layer.clearLayers();
    if (this.markers.length > 0)
      this.layer.addLayers(this.markers);
  }
}