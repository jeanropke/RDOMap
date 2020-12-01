class Marker {
  constructor(text, lat, lng, category, subdata, size) {
    this.text = text;
    this.lat = lat;
    this.lng = lng;
    this.category = category;
    this.subdata = subdata;
    this.size = size;
    this.title = (() => {
      switch (category) {
        case 'fasttravel':
          return Language.get(`${this.category}.${this.text}.name`);
        case 'rescue':
          return Language.get(`map.${this.category}.${this.subdata}.name`);
        case 'shops':
        case 'gfh':
          return Language.get(`map.${this.category}.${this.subdata}.name`);
        case 'hideouts':
          return Language.get(`map.${this.category}.${this.text}.name`) + ' - ' + `[${convertToTime(this.subdata[0])} - ${convertToTime(this.subdata[1])}]`;
        case 'camps':
          return Language.get(`map.${this.category}.${this.subdata}.name`) + ' - ' + Language.get(`map.camps.sizes.${this.size}`);
        case 'daily_locations':
        case 'dynamic_bounties':
          return Language.get(`map.${this.category}.${this.text}.name`);
        case 'harrietum_animals':
          return Language.get('map.harrietum_animals.name') + ' - ' + Language.get(`menu.cmpndm.${this.text}`);
        case 'sightseeing':
          return Language.get('map.sightseeing.name') + (this.text === 'hidden' ? ' - ' + Language.get('map.sightseeing.hidden') : '');
        default:
          return Language.get(`map.${this.category}.name`);
      }
    })();
    this.description = (() => {
      switch (category) {
        case 'fasttravel':
          return '';
        case 'shops':
        case 'gfh':
          return Language.get(`map.${this.category}.${this.subdata}.desc`);
        default:
          return Language.get(`map.${this.category}.desc`);
      }
    })();
  }
  updateMarkerContent() {
    let linksElement = $('<p>');
    let debugDisplayLatLng = $('<small>').text(`Text: ${this.text} / Latitude: ${this.lat} / Longitude: ${this.lng}`);
    return `<h1>${this.title}</h1>
        <span class="marker-content-wrapper">
        <p>${this.description}</p>
        </span>
        ${linksElement.prop('outerHTML')}
        ${Settings.isDebugEnabled ? debugDisplayLatLng.prop('outerHTML') : ''}
        `;
  }
}
