class Plants {

    constructor(preliminary) {
      Object.assign(this, preliminary);

      this.element = $(`<div class="collectible-wrapper" data-help="item" data-type="${this.key}">`)
        .toggleClass('disabled', !this.onMap)
        .on('click', () => {this.onMap = !this.onMap; setTimeout(() => PlantsCollection.layer.redraw(), 40); })
        .append($(`<img src="./assets/images/icons/game/${this.key}.png" class="collectible-icon">`))
        .append($('<p class="collectible">').attr('data-text', `map.plants.${this.key}.name`))
        .translate();

      this.element.appendTo(PlantsCollection.context);

      this.markers = [];
      this.locations.forEach(_marker => {
        var tempMarker = L.marker([_marker.x, _marker.y], {
          opacity: .75,
          icon: new L.divIcon({
            iconUrl: `assets/images/markers/${this.key}.png`,
            iconSize: [35 * Settings.markerSize, 45 * Settings.markerSize],
            iconAnchor: [17 * Settings.markerSize, 42 * Settings.markerSize],
            popupAnchor: [0 * Settings.markerSize, -28 * Settings.markerSize]
          })
        });
        tempMarker.bindPopup(
          `<h1>${Language.get(`map.animal_spawns.name`).replace('{animal}', Language.get(`menu.cmpndm.${this.key}`))}</h1>
          <span class="marker-content-wrapper">
            <p></p>
          </span>
          `, {
          minWidth: 300,
          maxWidth: 400
        });    
        this.markers.push(tempMarker);
      });

      
      if(this.onMap) {
        this.onMap = this.onMap;
      }
    }
  
    set onMap(state) { 
      if (state) {
        if(!PlantsCollection.enabledCategories.includes(this.key)) {
          PlantsCollection.markers = PlantsCollection.markers.concat(this.markers);
          PlantsCollection.enabledCategories.push(this.key);
        }
        PlantsCollection.layer.clearLayers();
        PlantsCollection.layer.addLayers(PlantsCollection.markers);
        localStorage.setItem(`rdo:${this.key}`, 'true');
        this.element.removeClass('disabled');
      } else {

        PlantsCollection.markers = PlantsCollection.markers.filter((el) => !this.markers.includes(el));
        PlantsCollection.enabledCategories = $.grep(PlantsCollection.enabledCategories, el => el != this.key);

        PlantsCollection.layer.clearLayers();
        if(PlantsCollection.markers.length > 0)
          PlantsCollection.layer.addLayers(PlantsCollection.markers);

        localStorage.removeItem(`rdo:${this.key}`);
        this.element.addClass('disabled');
      }      
    }
    get onMap() {
      return !!localStorage.getItem(`rdo:${this.key}`);
    }
  }

  class PlantsCollection {

    static start = Date.now();
    static layer = L.canvasIconLayer({ zoomAnimation: true });
    static enabledCategories = [];
    static markers = [];
    static init() {
      PlantsCollection.layer.addTo(MapBase.map);

      this.locations = [];
      this.context = $('.menu-hidden[data-type=plants]');

      return Loader.promises['plants'].consumeJson(data => {
        data.forEach(item => this.locations.push(new Plants(item)));
        console.info(`%c[Plants] Loaded in ${Date.now() - PlantsCollection.start}ms!`, 'color: #bada55; background: #242424');          
        setTimeout(() => PlantsCollection.layer.redraw(), 40);
        Menu.reorderMenu(this.context);
      });
    }
  }