var Marker = function (text, lat, lng, category, subdata, time) {
  this.text = text;
  this.lat = lat;
  this.lng = lng;
  this.category = category;
  this.subdata = subdata;
  this.time = time;

  this.title = category == 'plants' ? Language.get(`map.plants.${this.text}.name`) : category == 'hideouts' ? Language.get(`map.hideouts.${this.text}.name`) : category == 'daily_locations' ? Language.get(`map.daily_locations.${this.text}.name`) : Language.get(`map.${this.text}.name`);
  this.description = category == 'plants' ? Language.get(`map.plants.desc`).replace('{plant}', this.title) : category == 'daily_locations' ? Language.get(`map.daily_locations.desc`) : Language.get(`map.${this.text}.desc`);

  this.isVisible = enabledCategories.includes(category);
  this.isCollected = false;
  this.canCollect = !this.isCollected;
};
