class Bounty {
  // not idempotent (on the environment)
  constructor(preliminary, type) {
    Object.assign(this, preliminary);
    this.type = type;

    this.layer = L.layerGroup();
    this._shownKey = `shown.${type}.${this.text}`;

    this.context = document.querySelector(`.menu-hidden[data-type=${type}]`);

    this.element = document.createElement('div');
    this.element.classList.add('collectible-wrapper', 'disabled');
    Object.assign(this.element.dataset, { help: 'item', type: this.text, tippyContent: Language.get(`menu.${type}.${this.text}`) });
    this.element.innerHTML = `
      <span class="collectible-text">
        <p class="collectible" data-text="menu.${type}.${this.text}"></p>
      </span>
    `;
    this.element.addEventListener('click', () => (this.onMap = !this.onMap));
    Language.translateDom(this.element);

    this.reinitMarker();

    this.context.appendChild(this.element);
  }

  // auto remove marker? from map, recreate marker, auto add? marker
  // idempotent
  reinitMarker() {
    if (this.marker) BountyCollection.layer.removeLayer(this.marker);
    this.marker = L.layerGroup();
    if (this.radius > 0) {
      this.marker.addLayer(
        L.circle([this.x, this.y], {
          color: '#f02828',
          fillColor: '#f02828',
          fillOpacity: linear(Settings.overlayOpacity, 0, 1, 0.1, 0.5),
          radius: this.radius,
        })
      );
    }
    this.locations.forEach((bounty) => {
      let iconUrl = './assets/images/icons/bounty-target.png';
      if (bounty.min > 1) {
        iconUrl = './assets/images/icons/bounty-target-plus.png';
      }
      this.marker.addLayer(
        L.marker([bounty.x, bounty.y], {
          icon: L.icon({
            iconUrl: iconUrl,
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          }),
          pane: 'bountyX',
        }).bindPopup(this.popupContent.bind(this, this, bounty), { minWidth: 300 }),
      );
    });
    this.onMap = this.onMap;
  }

  popupContent(marker, bounty) {
    const snippet = document.createElement('div');
    snippet.className = 'handover-wrapper-with-no-influence';
    snippet.innerHTML = `
        <h1 data-text="menu.${marker.type}.${marker.text}"></h1>
        <p data-text="menu.${marker.type}.desc"></p>
        <span class="properties">
          <p class="property" data-text="menu.${marker.type}.min" data-property="min"></p>
          <!-- <p class="property" data-text="menu.${marker.type}.config" data-property="config"></p> -->
        </span>
        <button class="btn btn-info remove-button full-popup-width" data-text="map.remove"></button>
        <small>Latitude: ${bounty.x} / Longitude: ${bounty.y} / Type: ${marker.type} / Text: ${marker.text}</small>
    `;
    Language.translateDom(snippet);

    snippet.querySelectorAll('[data-property]').forEach((p) => {
      const property = p.getAttribute('data-property');
      if (!bounty[property]) p.remove();
      const propertyText = Language.get(p.getAttribute('data-text')).replace(`{${property}}`, bounty[property]);
      p.textContent = propertyText;
    });

    snippet.querySelector('button').addEventListener('click', () => (this.onMap = false));
    snippet.querySelector('small').style.display = Settings.isDebugEnabled ? '' : 'none';

    return snippet;
  }

  set onMap(state) {
    if (state) {
      BountyCollection.layer.addLayer(this.marker);
      if (!MapBase.isPreviewMode) localStorage.setItem(`rdo.${this._shownKey}`, 'true');
      this.element.classList.remove('disabled');
    } else {
      BountyCollection.layer.removeLayer(this.marker);
      if (!MapBase.isPreviewMode) localStorage.removeItem(`rdo.${this._shownKey}`);
      this.element.classList.add('disabled');
    }
  }
  get onMap() {
    return !!localStorage.getItem(`rdo.${this._shownKey}`);
  }

  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
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
    const bounties = Loader.promises['bounties'].consumeJson((data) => (this.collectionsData = data));

    return Promise.all([bounties]).then(() => {
      console.info('%c[Bounties] Loaded!', 'color: #bada55; background: #242424');
      this.collectionsData.forEach((collection) => {
        this.collection[collection.key] = new BountyCollection(collection);
      });
    });
  }

  constructor(preliminary) {
    Object.assign(this, preliminary);

    this.bounties = [];
    this.locations.forEach((bounty) => {
      this.bounties.push(new Bounty(bounty, this.key));
      BountyCollection.quickParams.push(`${this.key}_${bounty.text}`);
    });

    Menu.reorderMenu(document.querySelector(`.menu-hidden[data-type=${this.key}]`));

    document.querySelectorAll(`.menu-hidden[data-type=${this.key}] .bounty-btn`).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const showAll = e.target.getAttribute('data-text') === 'menu.show_all';
        this.bounties.forEach((bounty) => (bounty.onMap = showAll));
      });
    });
  }
}
