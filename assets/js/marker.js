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
        case 'plants':
          return Language.get(`map.plants.${this.text}.name`);
        case 'hideouts':
          return Language.get(`map.hideouts.${this.text}.name`)
        case 'daily_locations':
          return Language.get(`map.daily_locations.${this.text}.name`);
        case 'shops':
          return Language.get(`map.shops.${this.text}.name`);
        default:
          return Language.get(`map.${this.text}.name`);
      }
    })();
    this.description = (() => {
      switch (category) {
        case 'plants':
          return Language.get(`map.plants.${this.text}.desc`);
        case 'hideouts':
          return Language.get(`map.hideouts.${this.text}.desc`)
        case 'daily_locations':
          return Language.get(`map.daily_locations.${this.text}.desc`);
        case 'shops':
          return Language.get(`map.shops.${this.text}.desc`);
        default:
          return Language.get(`map.${this.text}.desc`);
      }
    })();
    this.isVisible = enabledCategories.includes(category);
    this.isCollected = false;
    this.canCollect = !this.isCollected;
  }
}