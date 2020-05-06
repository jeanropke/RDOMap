class Marker {
  constructor(text, lat, lng, category, subdata, time, area, size) {
    this.text = text;
    this.lat = lat;
    this.lng = lng;
    this.category = category;
    this.subdata = subdata;
    this.area = area;
    this.size = size;
    this.time = time;
    this.title = category == 'plants' ?
      Language.get(`map.plants.${this.text}.name`) :
      category == 'hideouts' ?
        Language.get(`map.hideouts.${this.text}.name`) :
        category == 'daily_locations' ?
          Language.get(`map.daily_locations.${this.text}.name`) :
          category == 'camps' ?
            Language.get(`map.camps.areas.${this.area}`) + ' - ' + Language.get(`map.camps.sizes.${this.size}`) :
            Language.get(`map.${this.text}.name`);
    this.description = category == 'plants' ?
      Language.get(`map.plants.desc`).replace('{plant}', this.title) :
      category == 'daily_locations' ?
        Language.get(`map.daily_locations.desc`) :
        category == 'camps' ?
          Language.get(`map.camps.desc`) :
          Language.get(`map.${this.text}.desc`);
    this.isVisible = enabledCategories.includes(category);
    this.isCollected = false;
    this.canCollect = !this.isCollected;
  }
}

