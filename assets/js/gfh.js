class GunForHire {
  static init() {
    this.locations = [];
    this.quickParams = [];
    this.context = document.querySelector('.menu-hidden[data-type=gfh]');

    return Loader.promises['gfh'].consumeJson(data => {
      data.forEach(item => {
        this.locations.push(new GunForHire(item));
        this.quickParams.push(item.key);
      });
      console.info('%c[Freeroam Missions] Loaded!', 'color: #bada55; background: #242424');
      Menu.reorderMenu(this.context);
    });
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.layer = L.layerGroup();

    this.onLanguageChanged();

    this.element = document.createElement('div');
    this.element.classList.add('collectible-wrapper');
    Object.assign(this.element.dataset, { help: 'item', type: this.key, tippyContent: Language.get(`map.gfh.${this.key}.name`) });
    this.element.classList.toggle('disabled', !this.onMap);
    this.element.innerHTML = `
      <img class="collectible-icon" src="./assets/images/icons/${this.type ? this.type : 'gfh'}.png">
      <span class="collectible-text">
        <p class="collectible" data-text="map.gfh.${this.key}.name"></p>
      </span>
    `;
    this.element.addEventListener('click', () => this.onMap = !this.onMap);
    Language.translateDom(this.element);

    GunForHire.context.appendChild(this.element);

    if (this.onMap)
      this.layer.addTo(MapBase.map);
  }

  onLanguageChanged() {
    this.markers = [];
    this.locations.forEach(item => this.markers.push(new Marker(item.text, item.x, item.y, 'gfh', this.key, item.types)));

    this.reinitMarker();
  }

  updateMarkerContent(marker) {
    const missionsEl = document.createElement('ul');
    missionsEl.classList.add('missions-list');
    marker.size
      .map(m => Language.get(`map.gfh.missions.${m}`))
      .sort((a, b) => a.localeCompare(b, { sensitivity: 'base' }))
      .forEach(mission => {
        const li = document.createElement('li');
        li.textContent = mission;
        missionsEl.appendChild(li);
      });
    const debugDisplayLatLng = document.createElement('small');
    debugDisplayLatLng.textContent = `Text: ${marker.text} / Latitude: ${marker.lat} / Longitude: ${marker.lng}`;

    const snippet = document.createElement('div');
    snippet.innerHTML = `
          <h1>${marker.title}</h1>
          <span class="marker-content-wrapper">
            <p>${marker.description}</p>
          </span>
          <br>
          <p data-text="map.gfh.missions_header"></p>
          ${missionsEl.outerHTML}
          <button class="btn btn-info remove-button full-popup-width" data-text="map.remove"></button>
          ${Settings.isDebugEnabled ? debugDisplayLatLng.outerHTML : ''}
    `;
    Language.translateDom(snippet);
    snippet.querySelector('button').addEventListener('click', () => this.onMap = false);

    return snippet;
  }

  reinitMarker() {
    this.layer.clearLayers();
    const markerSize = Settings.markerSize;
    this.markers.forEach(marker => {
      const shadow = Settings.isShadowsEnabled ?
        `<img class="shadow" width="${35 * markerSize}" height="${16 * markerSize}" src="./assets/images/markers-shadow.png" alt="Shadow">` : '';
      const tempMarker = L.marker([marker.lat, marker.lng], {
        opacity: Settings.markerOpacity,
        icon: new L.DivIcon.DataMarkup({
          iconSize: [35 * markerSize, 45 * markerSize],
          iconAnchor: [17 * markerSize, 42 * markerSize],
          popupAnchor: [1 * markerSize, -29 * markerSize],
          html: `<div>
            <img class="icon" src="assets/images/icons/${this.type ? this.type : 'gfh'}.png" alt="Icon">
            <img class="background" src="assets/images/icons/marker_${MapBase.colorOverride || this.color}.png" alt="Background">
            ${shadow}
          </div>`,
          marker: this.key,
          tippy: marker.title,
        }),
      });
      tempMarker.bindPopup(this.updateMarkerContent.bind(this, marker), { minWidth: 300, maxWidth: 400 });

      this.layer.addLayer(tempMarker);
      if (Settings.isMarkerClusterEnabled)
        Layers.oms.addMarker(tempMarker);
    });
  }

  set onMap(state) {
    this.reinitMarker();
    if (state) {
      this.layer.addTo(MapBase.map);
      this.element.classList.remove('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo.${this.key}`, 'true');
    } else {
      this.layer.remove();
      this.element.classList.add('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo.${this.key}`);
    }
    MapBase.updateTippy('gfh');
  }

  get onMap() {
    return !!localStorage.getItem(`rdo.${this.key}`);
  }

  static onLanguageChanged() {
    GunForHire.locations.forEach(gfh => gfh.onLanguageChanged());
    Menu.reorderMenu(this.context);
  }

  static onSettingsChanged() {
    GunForHire.locations.forEach(gfh => gfh.reinitMarker());
  }
}
