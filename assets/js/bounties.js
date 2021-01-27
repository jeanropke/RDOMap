class Bounty {

  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
  }
  static onSettingsChanged() {
    this.bounties.forEach(bounty => bounty.reinitMarker());
  }

  // not idempotent (on the environment)
  constructor(preliminary, type) {
    Object.assign(this, preliminary);
    this.type = type;

    this.layer = L.layerGroup();
    this._shownKey = `shown.${type}.${this.text}`;

    this.context = $(`.menu-hidden[data-type=${type}]`);
    this.element = $(`<div class="collectible-wrapper disabled" data-help="item" data-type="${this.text}">`)
      .attr('data-tippy-content', Language.get(`menu.${type}.${this.text}`))
      .on('click', () => this.onMap = !this.onMap)
      .append($('<span class="collectible-text">')
        .append($('<p class="collectible">').attr('data-text', `menu.${type}.${this.text}`)))
      .translate();

    this.reinitMarker();

    this.element.appendTo(this.context);
  }

  // auto remove marker? from map, recreate marker, auto add? marker
  // idempotent
  reinitMarker() {
    if (this.marker) BountyCollection.layer.removeLayer(this.marker);
    this.marker = L.layerGroup();
    if (this.radius > 0) {
      this.marker.addLayer(L.circle([this.x, this.y], {
        color: '#f02828',
        fillColor: '#f02828',
        fillOpacity: linear(Settings.overlayOpacity, 0, 1, 0.1, 0.5),
        radius: this.radius,
      }));
    }
    this.locations.forEach(bounty => {
      let iconUrl = './assets/images/icons/bounty-target.png';
      if (bounty.min > 1) {
        iconUrl = './assets/images/icons/bounty-target-plus.png';
      }
      this.marker.addLayer(L.marker([bounty.x, bounty.y], {
        icon: L.icon({
          iconUrl: iconUrl,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
        pane: 'bountyX',
      }).bindPopup(this.popupContent(this, bounty), { minWidth: 300 }));
    });
    this.onMap = this.onMap;
  }
  popupContent(marker, bounty) {
    const snippet = $(`<div class="handover-wrapper-with-no-influence">
        <h1 data-text="menu.${marker.type}.${marker.text}"></h1>
        <p data-text="menu.${marker.type}.desc"></p>
        <span class="properties">
          <p class="property" data-text="menu.${marker.type}.min" data-property="min"></p>
          <!-- <p class="property" data-text="menu.${marker.type}.config" data-property="config"></p> -->
        </span>
        <button type="button" class="btn btn-info remove-button remove-bounty" data-text="map.remove"></button>
      </div>`).translate();

    const props = $('[data-property]', snippet);
    [...props].forEach(p => {
      const property = $(p).attr('data-property');
      if (!bounty[property]) $(p).remove();
      const propertyText = Language.get($(p).attr('data-text')).replace(`{${property}}`, bounty[property]);
      $(p).text(propertyText);
    });

    snippet
      .find('button.remove-bounty')
      .on('click', () => this.onMap = false)
      .end();

    return snippet[0];
  }
  set onMap(state) {
    if (state) {
      BountyCollection.layer.addLayer(this.marker);
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo:${this._shownKey}`, 'true');
      this.element.removeClass('disabled');
    } else {
      BountyCollection.layer.removeLayer(this.marker);
      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo:${this._shownKey}`);
      this.element.addClass('disabled');
    }
  }
  get onMap() {
    return !!localStorage.getItem(`rdo:${this._shownKey}`);
  }
}

class BountyCollection {

  static init() {
    this.layer = L.layerGroup();
    this.collection = {};
    this.collectionsData = [];
    this.quickParams = [];

    const pane = MapBase.map.createPane('bountyX');
    pane.style.zIndex = 450; // X-markers on top of circle, but behind “normal” markers/shadows
    pane.style.pointerEvents = 'none';

    this.layer.addTo(MapBase.map);
    const bounties = Loader.promises['bounties'].consumeJson(data => this.collectionsData = data);

    return Promise.all([bounties]).then(() => {
      console.info('%c[Bounties] Loaded!', 'color: #bada55; background: #242424');
      this.collectionsData.forEach(collection => {
        this.collection[collection.key] = new BountyCollection(collection);
      });
    });
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.bounties = [];
    this.locations.forEach(bounty => {
      this.bounties.push(new Bounty(bounty, this.key));
      BountyCollection.quickParams.push(bounty.key);
    });

    Menu.reorderMenu($(`.menu-hidden[data-type=${this.key}]`));

    $(`.menu-hidden[data-type=${this.key}] .bounty-btn`).click(e => {
      e.preventDefault();
      const showAll = $(e.target).attr('data-text') === 'menu.show_all';
      this.bounties.forEach(bounty => bounty.onMap = showAll);
    });
  }
}
