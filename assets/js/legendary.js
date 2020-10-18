class Legendary {

  static init() {

    // Needed to check against Q param.
    this.quickParams = [];

    // Legendary animals not yet released.
    this.notReleased = [
      'mp_animal_panther_legendary_01', 'mp_animal_panther_legendary_02'
    ];

    this.animals = [];
    this.layer = L.layerGroup();
    this.layer.addTo(MapBase.map);

    const pane = MapBase.map.createPane('animalX');
    pane.style.zIndex = 450; // X-markers on top of circle, but behind “normal” markers/shadows
    pane.style.pointerEvents = 'none';
    this.context = $('.menu-hidden[data-type=legendary_animals]');
    this.crossIcon = L.icon({
      iconUrl: './assets/images/icons/cross.png',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    this.onSettingsChanged();
    $('.menu-hidden[data-type="legendary_animals"] > *:first-child a').click(e => {
      e.preventDefault();
      const showAll = $(e.target).attr('data-text') === 'menu.show_all';
      Legendary.animals.forEach(animal => animal.onMap = showAll);
    });
    return Loader.promises['animal_legendary'].consumeJson(data => {
      data.forEach(item => {
        this.animals.push(new Legendary(item));
        this.quickParams.push(item.text);
      });
      this.onLanguageChanged();
      console.info('%c[Legendary animals] Loaded!', 'color: #bada55; background: #242424');
    });
  }
  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
  }
  static onSettingsChanged() {
    this.animals.forEach(animal => animal.reinitMarker());
  }

  // not idempotent (on the environment)
  constructor(preliminary) {

    Object.assign(this, preliminary);
    if (Legendary.notReleased.includes(this.text) && !Settings.isDebugEnabled)
      return;

    this._shownKey = `shown.${this.text}`;
    this.element = $('<div class="collectible-wrapper" data-help="item">')
      .attr('data-tippy-content', Language.get(this.text))
      .on('click', () => this.onMap = !this.onMap)
      .append($('<p class="collectible">').attr('data-text', this.text))
      .toggleClass('not-found', Legendary.notReleased.includes(this.text))
      .translate();
    this.reinitMarker();
    this.element.appendTo(Legendary.context);
  }

  // auto remove marker? from map, recreate marker, auto add? marker
  // idempotent
  reinitMarker() {
    if (this.marker) Legendary.layer.removeLayer(this.marker);
    this.marker = L.layerGroup();
    this.marker.addLayer(L.circle([this.x, this.y], {
      color: '#fdc607',
      fillColor: '#fdc607',
      fillOpacity: linear(Settings.overlayOpacity, 0, 1, 0.1, 0.5),
      radius: this.radius,
    })
      .bindPopup(this.popupContent.bind(this), { minWidth: 400 }));
    this.locations.forEach(cross =>
      this.marker.addLayer(L.marker([cross.x, cross.y], {
        icon: Legendary.crossIcon,
        pane: 'animalX',
      })
        .bindPopup(this.popupContent.bind(this), { minWidth: 400 }))
    );
    const overlay = `assets/images/icons/game/animals/legendaries/${this.text}.png?nocache=${nocache}`;
    this.marker.addLayer(L.imageOverlay(overlay, [
      [this.x - this.radius, this.y - this.radius * 2],
      [this.x + this.radius, this.y + this.radius * 2]
    ], {
      opacity: linear(Settings.overlayOpacity, 0, 1, 0.5, 1),
    }));
    this.onMap = this.onMap;
  }
  getAnimalProperties() {
    const spawnTime = (() => {
      const spawnTimes = this.spawn_time.flat();
      let timeString = `${convertToTime(spawnTimes[0])} - ${convertToTime(spawnTimes[1])}`;
      if (spawnTimes[2] && spawnTimes[3])
        timeString += `, ${convertToTime(spawnTimes[2])} - ${convertToTime(spawnTimes[3])}`;
      return timeString;
    })();

    return {
      spawnTime,
      preferredWeather: `map.weather.${this.preferred_weather}`,
      traderMaterials: this.trader_materials ? this.trader_materials : Language.get('map.cant_be_picked_up'),
      traderPeltMaterials: this.trader_pelt_materials,
      trapperValue: this.trapper_value ? `$${this.trapper_value.toFixed(2)}` : Language.get('map.cant_be_picked_up'),
      trapperPeltValue: `$${this.trapper_pelt_value.toFixed(2)}`,
      trapperPartValue: `$${this.trapper_part_value.toFixed(2)}`,
      sampleValue: `$${this.sample_value.toFixed(2)}`,
    };
  }
  popupContent() {
    const properties = this.getAnimalProperties();
    const snippet = $(`
      <div class="handover-wrapper-with-no-influence">
        <h1 data-text="${this.text}"></h1>
        <p style='font-size: 16px; text-align: center; padding-bottom: 8px;'>
          ${Legendary.notReleased.includes(this.text) ? Language.get('map.generic_not_released') : ''}
        </p>
        <p data-text="${Language.get(this.text + '.desc')}"></p>
        <br><p data-text="map.legendary_animal.desc"></p>
        <br><p class="legendary-spawn-time"></p>
        <br><p class="legendary-preferred-weather"></p>
        <br><p class="legendary-trader-materials"></p>
        <br><p class="legendary-trader-pelt-materials"></p>
        <br><p class="legendary-trapper-value"></p>
        <br><p class="legendary-trapper-pelt-value"></p>
        <br><p class="legendary-trapper-part-value"></p>
        <br><p class="legendary-sample-value"></p>
        <button type="button" class="btn btn-info remove-button" data-text="map.remove"></button>
      </div>`)
      .translate()

      .find('.legendary-spawn-time').text(Language.get('map.legendary.spawn_time').replace('{spawn_time}', properties.spawnTime)).end()
      .find('.legendary-preferred-weather').text(Language.get('map.legendary.preferred_weather').replace('{preferred_weather}', Language.get(properties.preferredWeather))).end()
      .find('.legendary-trader-materials').text(Language.get('map.legendary.trader_materials').replace('{trader_materials}', properties.traderMaterials)).end()
      .find('.legendary-trader-pelt-materials').text(Language.get('map.legendary.trader_pelt_materials').replace('{trader_pelt_materials}', properties.traderPeltMaterials)).end()
      .find('.legendary-trapper-value').text(Language.get('map.legendary.trapper_value').replace('{trapper_value}', properties.trapperValue)).end()
      .find('.legendary-trapper-pelt-value').text(Language.get('map.legendary.trapper_pelt_value').replace('{trapper_pelt_value}', properties.trapperPeltValue)).end()
      .find('.legendary-trapper-part-value').text(Language.get('map.legendary.trapper_part_value').replace('{trapper_part_value}', properties.trapperPartValue)).end()
      .find('.legendary-sample-value').text(Language.get('map.legendary.sample_value').replace('{sample_value}', properties.sampleValue)).end();

    snippet.find('button').on('click', () => this.onMap = false);
    return snippet[0];
  }
  set onMap(state) {
    if (!this.marker) return;
    if (state) {
      Legendary.layer.addLayer(this.marker);
      this.element.removeClass('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo:${this._shownKey}`, 'true');
    } else {
      Legendary.layer.removeLayer(this.marker);
      this.element.addClass('disabled');
      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo:${this._shownKey}`);
    }
  }
  get onMap() {
    return !!localStorage.getItem(`rdo:${this._shownKey}`);
  }
  static onCategoryToggle() {
    Legendary.animals.forEach(animal => animal.onMap = animal.onMap);
  }
}
