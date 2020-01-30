var Marker = function (text, lat, lng, category, subdata, count) {
  this.text = text;
  this.lat = lat;
  this.lng = lng;
  this.category = category;
  this.subdata = subdata;
  this.count = count;

  this.title = category == 'plants' ? Language.get(`map.plants.${this.text}.name`) : Language.get(`map.${this.text}.name`);
  this.description = category == 'plants' ? Language.get(`map.plants.desc`).replace('{plant}', this.title) : Language.get(`map.${this.text}.desc`);

  this.isVisible = enabledCategories.includes(category);
  this.isCollected = false;
  this.canCollect = !this.isCollected;
}
