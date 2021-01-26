class Bounty {

  // requires MapBase.map, Menu.reorderMenu, Settings.some and DOM ready
  // not idempotent
  static init() {
    this.bountiesParentElement = $('.menu-option.clickable[data-type=bounty]')
      .toggleClass('disabled', !this.bountiesOnMap)
      .on('click', () => this.bountiesOnMap = !this.bountiesOnMap);
    this.bounties = [];
    this.quickParams = [];
    this.layer = L.layerGroup();
    this.layer.addTo(MapBase.map);
    const pane = MapBase.map.createPane('bountyX');
    pane.style.zIndex = 450; // X-markers on top of circle, but behind “normal” markers/shadows
    pane.style.pointerEvents = 'none';
    this.context = $('.menu-hidden[data-type=bounty]').toggleClass('disabled', !this.bountiesOnMap);
    this.bountyIcon = L.icon({
      iconUrl: './assets/images/icons/bounty-target.png',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    this.onSettingsChanged();
    $('.menu-hidden[data-type="bounty"] > *:first-child a').click(e => {
      e.preventDefault();
      const showAll = $(e.target).attr('data-text') === 'menu.show_all';
      Bounty.bounties.forEach(bounty => bounty.onMap = showAll);
    });
    return Loader.promises['bounties'].consumeJson(data => {
      data.forEach(item => {
        // TODO: At some point, this will need to be fixed to account for other types of bounties.
        item.locations.forEach(loc => {
          this.bounties.push(new Bounty(loc));
          this.quickParams.push(loc.text);
        });
      });
      this.onLanguageChanged();
      console.info('%c[Bounties] Loaded!', 'color: #bada55; background: #242424');
    });
  }
  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
  }
  static onSettingsChanged() {
    this.bounties.forEach(bounty => bounty.reinitMarker());
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
    this.element.appendTo(Bounty.context);
  }

  // auto remove marker? from map, recreate marker, auto add? marker
  // idempotent
  reinitMarker() {
    if (this.marker) Bounty.layer.removeLayer(this.marker);
    this.marker = L.layerGroup();
    this.marker.addLayer(L.circle([this.x, this.y], {
      color: '#f02828',
      fillColor: '#f02828',
      fillOpacity: linear(Settings.overlayOpacity, 0, 1, 0.1, 0.5),
      radius: this.radius,
    }));
    this.locations.forEach(bounty =>
      this.marker.addLayer(L.marker([bounty.x, bounty.y], {
        icon: Bounty.bountyIcon,
        pane: 'bountyX',
      }).bindPopup(this.popupContent(this, bounty), { minWidth: 300 }))
    );
    this.onMap = this.onMap;
  }
  popupContent(marker, bounty) {
    const snippet = $(`<div class="handover-wrapper-with-no-influence">
        <h1 data-text="${marker.text}"></h1>
        <p data-text="menu.bounties_desc"></p>
        <span class="properties">
          <p class="properties-min" data-text="menu.bounties_track_min"></p>
        </span>
      </div>`).translate();

    const pElements = $('span > p', snippet);
    [...pElements].forEach(p => {
      const propertyText = Language.get($(p).attr('data-text')).replace(/{([a-z_]+)}/, (_, key) => bounty[key]);
      $(p).text(propertyText);
    });

    return snippet[0];
  }
  set onMap(state) {
    if (state) {
      if (MapBase.isPreviewMode || Bounty.bountiesOnMap)
        Bounty.layer.addLayer(this.marker);
      if (!MapBase.isPreviewMode)
        localStorage.setItem(`rdo:${this._shownKey}`, 'true');
      this.element.removeClass('disabled');
    } else {
      if (Bounty.bountiesOnMap)
        Bounty.layer.removeLayer(this.marker);
      if (!MapBase.isPreviewMode)
        localStorage.removeItem(`rdo:${this._shownKey}`);
      this.element.addClass('disabled');
    }
  }
  get onMap() {
    return !!localStorage.getItem(`rdo:${this._shownKey}`);
  }

  static set bountiesOnMap(state) {
    if (state) {
      MapBase.map.addLayer(Bounty.layer);
      if (!MapBase.isPreviewMode)
        localStorage.setItem('rdo:bounties', 'true');

      this.bounties.forEach(_t => {
        if (_t.onMap) _t.onMap = state;
      });
    } else {
      Bounty.layer.remove();
      if (!MapBase.isPreviewMode)
        localStorage.removeItem('rdo:bounties');
    }

    this.bountiesParentElement.toggleClass('disabled', !state);
    this.context.toggleClass('disabled', !state);
  }

  static get bountiesOnMap() {
    return !!localStorage.getItem('rdo:bounties');
  }
}
