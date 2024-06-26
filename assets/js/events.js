class CondorEgg {
  static init() {
    this.condorEggParentElement = document.querySelector('.collectible-wrapper[data-type=condor_egg]');
    this.condorEggParentElement.classList.toggle('disabled', !this.condorEggOnMap);
    this.condorEggParentElement.addEventListener('click', () => this.condorEggOnMap = !this.condorEggOnMap);
    this.condorEggs = [];
    this.quickParams = [];
    this.layer = L.layerGroup();
    this.layer.addTo(MapBase.map);
    const pane = MapBase.map.createPane('condorEggX');
    pane.style.zIndex = 450;
    pane.style.pointerEvents = 'none';
    this.eggIcon = L.icon({
      iconUrl: './assets/images/icons/condor_egg_small.png',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
    this.onSettingsChanged();
    return Loader.promises['fme_condor_egg'].consumeJson(data => {
      data.forEach(item => {
        this.condorEggs.push(new CondorEgg(item));
        this.quickParams.push(item.text);
      });
      console.info('%c[Event Condor Egg] Loaded!', 'color: #bada55; background: #242424');
    });
  }
  static onSettingsChanged(markerSize = Settings.markerSize, shadow = Settings.isShadowsEnabled) {
    this.mainIcon = L.divIcon({
      iconSize: [35 * markerSize, 45 * markerSize],
      iconAnchor: [17 * markerSize, 42 * markerSize],
      popupAnchor: [1 * markerSize, -29 * markerSize],
      html: `
        <img class="icon" src="./assets/images/icons/condor_egg.png" alt="Icon">
        <img class="background" src="./assets/images/icons/marker_beige.png" alt="Background">
        ${shadow ? `<img class="shadow" width="${35 * markerSize}" height="${16 * markerSize}"
            src="./assets/images/markers-shadow.png" alt="Shadow">` : ''}
      `,
    });
    this.condorEggs.forEach(egg => egg.reinitMarker());
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);
    this.reinitMarker();
  }

  reinitMarker() {
    if (this.marker) CondorEgg.layer.removeLayer(this.marker);
    this.marker = L.layerGroup();
    this.marker.addLayer(L.circle([this.x, this.y], {
      color: '#f4e98a',
      fillColor: '#f4e98a',
      fillOpacity: linear(Settings.overlayOpacity, 0, 1, 0.1, 0.5),
      radius: this.radius,
    })
      .bindPopup(this.popupContent.bind(this), { minWidth: 300 }));

    if (!MapBase.isPreviewMode)
      this.marker.addLayer(L.marker([this.x, this.y], { icon: CondorEgg.mainIcon })
        .bindPopup(this.popupContent.bind(this), { minWidth: 300 })
      );

    this.locations.forEach(cross =>
      this.marker.addLayer(L.marker([cross.x, cross.y], {
        icon: CondorEgg.eggIcon,
        pane: 'condorEggX',
      })
        .bindPopup(this.popupContent.bind(this), { minWidth: 300 }))
    );
    CondorEgg.layer.addLayer(this.marker);
    CondorEgg.condorEggOnMap = CondorEgg.condorEggOnMap;
    this.onMap = true;
  }
  popupContent() {
    const popup = document.createElement('div');
    popup.classList.add('handover-wrapper-with-no-influence');
    popup.innerHTML = `
        <h1 data-text="map.${this.text}.name"></h1>
        <button class="btn btn-default full-popup-width" data-text="map.remove"></button>
    `;
    Language.translateDom(popup);
    popup.querySelector('button').addEventListener('click', () => CondorEgg.condorEggOnMap = false);

    return popup;
  }

  set onMap(state) {
    if (state)
      CondorEgg.layer.addLayer(this.marker);
    else
      CondorEgg.layer.removeLayer(this.marker);
  }

  static set condorEggOnMap(state) {
    if (state) {
      MapBase.map.addLayer(CondorEgg.layer);
      if (!MapBase.isPreviewMode)
        localStorage.setItem('rdo.condorEggs', 'true');
    } else {
      CondorEgg.layer.remove();
      if (!MapBase.isPreviewMode)
        localStorage.removeItem('rdo.condorEggs');
      MapBase.map.closePopup();
    }
    this.condorEggParentElement.classList.toggle('disabled', !state);
  }

  static get condorEggOnMap() {
    return !!localStorage.getItem('rdo.condorEggs');
  }
}

class Salvage {
  static init() {
    this.salvageParentElement = document.querySelector('.collectible-wrapper[data-type=salvage]');
    this.salvageParentElement.classList.toggle('disabled', !this.salvageOnMap);
    this.salvageParentElement.addEventListener('click', () => this.salvageOnMap = !this.salvageOnMap);
    this.salvages = [];
    this.quickParams = [];
    this.layer = L.layerGroup();
    this.layer.addTo(MapBase.map);

    // Order is least important to important for z-index.
    ['salvagePickups', 'salvageMounds', 'salvageChests'].forEach((item, index) => {
      const pane = MapBase.map.createPane(item);
      pane.style.zIndex = 450 + (50 * index);
      pane.style.pointerEvents = 'none';
    });

    this.onSettingsChanged();
    return Loader.promises['fme_salvage'].consumeJson(data => {
      data.forEach(item => {
        this.salvages.push(new Salvage(item));
        this.quickParams.push(item.text);
      });
      console.info('%c[Event Salvage] Loaded!', 'color: #bada55; background: #242424');
    });
  }
  static onSettingsChanged(markerSize = Settings.markerSize, shadow = Settings.isShadowsEnabled) {
    this.mainIcon = L.divIcon({
      iconSize: [35 * markerSize, 45 * markerSize],
      iconAnchor: [17 * markerSize, 42 * markerSize],
      popupAnchor: [1 * markerSize, -29 * markerSize],
      html: `
        <img class="icon" src="./assets/images/icons/salvage.png" alt="Icon">
        <img class="background" src="./assets/images/icons/marker_beige.png" alt="Background">
        ${shadow ? `<img class="shadow" width="${35 * markerSize}" height="${16 * markerSize}"
            src="./assets/images/markers-shadow.png" alt="Shadow">` : ''}
      `,
    });
    this.salvages.forEach(salvage => salvage.reinitMarker());
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);
    this.reinitMarker();
  }

  reinitMarker() {
    if (this.marker) Salvage.layer.removeLayer(this.marker);
    this.marker = L.layerGroup();
    this.marker.addLayer(L.circle([this.x, this.y], {
      color: '#f4e98a',
      fillColor: '#f4e98a',
      fillOpacity: linear(Settings.overlayOpacity, 0, 1, 0.1, 0.5),
      radius: this.radius,
    }).bindPopup(this.popupContent.bind(this, null), { minWidth: 300 }));

    if (!MapBase.isPreviewMode)
      this.marker.addLayer(L.marker([this.x, this.y], { icon: Salvage.mainIcon })
        .bindPopup(this.popupContent.bind(this, null), { minWidth: 300 })
      );

    this.pickups.forEach(cross =>
      this.marker.addLayer(L.marker([cross.x, cross.y], {
        icon: L.icon({
          iconUrl: './assets/images/icons/salvagepickups.png',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        }),
        pane: 'salvagePickups',
      }).bindPopup(this.popupContent.bind(this, 'pickups'), { minWidth: 300, maxWidth: 400 }))
    );

    this.chests.forEach(cross =>
      this.marker.addLayer(L.marker([cross.x, cross.y], {
        icon: L.icon({
          iconUrl: './assets/images/icons/salvagechests.png',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
        pane: 'salvageChests',
      }).bindPopup(this.popupContent.bind(this, 'chests'), { minWidth: 300, maxWidth: 400 }))
    );

    this.mounds.forEach(cross =>
      this.marker.addLayer(L.marker([cross.x, cross.y], {
        icon: L.icon({
          iconUrl: './assets/images/icons/salvagemounds.png',
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        }),
        pane: 'salvageMounds',
      }).bindPopup(this.popupContent.bind(this, 'mounds'), { minWidth: 300, maxWidth: 400 }))
    );
    Salvage.layer.addLayer(this.marker);
    Salvage.salvageOnMap = Salvage.salvageOnMap;
    this.onMap = true;
  }
  popupContent(type) {
    const popup = document.createElement('div');
    popup.classList.add('handover-wrapper-with-no-influence');
    popup.innerHTML = `
        <h1 data-text="map.${this.text}.name"></h1>
        ${type ? `<p data-text="map.salvage.${type}.desc"></p>` : ''}
        <button class="btn btn-default full-popup-width" data-text="map.remove"></button>
    `;
    Language.translateDom(popup);
    popup.querySelector('button').addEventListener('click', () => Salvage.salvageOnMap = false);

    return popup;
  }

  set onMap(state) {
    if (state)
      Salvage.layer.addLayer(this.marker);
    else
      Salvage.layer.removeLayer(this.marker);
  }

  static set salvageOnMap(state) {
    if (state) {
      MapBase.map.addLayer(Salvage.layer);
      if (!MapBase.isPreviewMode)
        localStorage.setItem('rdo.salvages', 'true');
    } else {
      Salvage.layer.remove();
      if (!MapBase.isPreviewMode)
        localStorage.removeItem('rdo.salvages');
      MapBase.map.closePopup();
    }
    this.salvageParentElement.classList.toggle('disabled', !state);
  }

  static get salvageOnMap() {
    return !!localStorage.getItem('rdo.salvages');
  }
}
