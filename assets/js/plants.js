class Plants {
    static plantsEnabled = [];
    static markersInst = [];
    static layer = L.canvasIconLayer({ zoomAnimation: true });

    static init() {
      this.locations = [];
      this.context = $('.menu-hidden[data-type=plants]');

      return Loader.promises['plants'].consumeJson(data => {
        data.forEach(item => this.locations.push(new Plants(item)));
        console.info('%c[Plants] Loaded!', 'color: #bada55; background: #242424');
        Menu.reorderMenu(this.context);
      });
    }
  
    constructor(preliminary) {
      Object.assign(this, preliminary);

      this.element = $(`<div class="collectible-wrapper" data-help="item" data-type="${this.key}">`)
        .toggleClass('disabled', !this.onMap)
        .on('click', () => this.onMap = !this.onMap)
        .append($(`<img src="./assets/images/icons/game/${this.key}.png" class="collectible-icon">`))
        .append($('<p class="collectible">').attr('data-text', `map.plants.${this.key}.name`))
        .translate();
  
      this.element.appendTo(Plants.context);

      this.markers = [];
      this.locations.forEach(item => this.markers.push(new Marker(item.text, item.x, item.y, this.key, this.key)));
    }
  
    set onMap(state) { 
      if (state) {
        localStorage.setItem(`rdo:${this.key}`, 'true');
        this.element.removeClass('disabled');
      } else {        
        localStorage.removeItem(`rdo:${this.key}`);
        this.element.addClass('disabled');
      }
    }
    get onMap() {
      return !!localStorage.getItem(`rdo:${this.key}`);
    }
  }