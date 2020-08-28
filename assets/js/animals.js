class Animal {
    constructor(preliminary, type) {
        Object.assign(this, preliminary);

        this.context = $(`.menu-hidden[data-type=${type}]`);

        this.element = $(`<div class="animal-wrapper" data-help="item" data-type="${this.key}">`)
          .on('click', () => this.isEnabled = !this.isEnabled)
          .append($(`<img src="./assets/images/icons/game/animals/${this.key}.png" class="animal-icon">`))
          .append($('<span class="animal-text disabled">')
          .append($('<p class="animal">').attr('data-text', `menu.cmpndm.${this.key}`)))
          .translate();
    
        this.element.appendTo(this.context);
      }

      set isEnabled(state) {
        $('.animal-text').addClass('disabled');
        if (state) {
          AnimalCollection.layer.setData({ data: this.data });
          this.element.children('span').removeClass('disabled');
        } else {
          AnimalCollection.layer.setData({ data: [] })
          this.element.children('span').addClass('disabled');
        }        
      }

      get isEnabled() {
        return !this.element.children('span').hasClass('disabled');
      }
}

class AnimalCollection {

    static layer = new HeatmapOverlay({
        radius: 1.5,
        maxOpacity: 0.5,
        minOpacity: 0.1,
        scaleRadius: true,
        useLocalExtrema: false,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'count',
        gradient: {
          0.25: "rgb(125, 125, 125)",
          0.55: "rgb(48, 25, 52)",
          1.0: "rgb(255, 42, 32)"
        }
      });

    static init() {

      AnimalCollection.layer.addTo(MapBase.map);
      
      this.collections = [];
      return Loader.promises['hm'].consumeJson(data => {
        data.forEach(item => {          
            this.collections.push(new AnimalCollection(item));
          });
        console.info('%c[Heatmaps] Loaded!', 'color: #bada55; background: #242424');
      });
    }

    constructor(preliminary) {
        Object.assign(this, preliminary);

        this.animals = [];

        this.data.forEach(animal => this.animals.push(new Animal(animal, this.key)));
        Menu.reorderMenu($(`.menu-hidden[data-type=${this.key}]`));
    }
}