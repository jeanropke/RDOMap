class Menu {
  static init() {
    this.tippyInstances = [];
    Loader.mapModelLoaded.then(this.activateHandlers.bind(this));
  }

  static reorderMenu(menu) {
    if (!menu) return;

    if (menu.querySelector('.new')) {
      const dataType = menu.getAttribute('data-type');
      const element = document.querySelector(`[data-type="${dataType}"]`);
      if (element) element.classList.add('new');
    }
  
    const buttonGroups = [];
    const otherItems = [];
    Array.from(menu.children).forEach(child => {
      if (child.classList.contains('collection-value')) {
        buttonGroups.push(child);
      } else {
        otherItems.push(child);
      }
    });
  
    otherItems.sort((a, b) => a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase()));
  
    const fragment = document.createDocumentFragment();
    buttonGroups.forEach(child => fragment.appendChild(child));
    otherItems.forEach(child => fragment.appendChild(child));
    menu.innerHTML = '';
    menu.appendChild(fragment);
  }

  static activateHandlers() {
    const help = document.getElementById('help-container');
    const helpParagraph = help.querySelector('p');
    document.querySelectorAll('.side-menu, .top-widget, .lat-lng-container').forEach(el => {
      ['mouseover', 'mouseout'].forEach(eventType => {
        el.addEventListener(eventType, (event) => {
          const target = eventType === 'mouseover' ? event.target : event.relatedTarget;

          // keep current help if pointer jumped to help container or it overgrew current pointer pos.
          if (help.contains(target)) return;

          if (target && target.closest) {
            const helpEl = target.closest('[data-help]');
            const helpTransId = helpEl ? helpEl.getAttribute('data-help') : 'default';
            helpParagraph.innerHTML = Language.get(`help.${helpTransId}`);
          }
        })
      })
      });

    document.querySelector('.menu-hide-all').addEventListener('click', function () {
      const collections = [
        Shop.locations,
        GunForHire.locations,
        Encounter.locations,
        PlantsCollection.locations,
        Camp.locations,
        Location.locations,
        Legendary.animals,
        Singleplayer.locations,
      ];

      collections
        .flatMap(locations => locations)
        .forEach(location => {
          if (location.onMap) location.onMap = false;
        });

      AnimalCollection.collection.forEach(collection => {
        collection.animals.forEach(animal => animal.isEnabled = false);
      });

      MadamNazar.onMap = false;
      Pins.onMap = false;
      Treasure.treasuresOnMap = false;
      Bounty.bountiesOnMap = false;
      CondorEgg.condorEggOnMap = false;
      Salvage.salvageOnMap = false;
    });

    document.querySelector('.menu-show-all').addEventListener('click', function () {
      const collections = [
        Shop.locations,
        GunForHire.locations,
        Encounter.locations,
        PlantsCollection.locations,
        Camp.locations,
        Location.locations,
        Legendary.animals,
        Singleplayer.locations,
      ];

      collections
      .flatMap(locations => locations)
      .forEach(location => {
        if (!location.onMap) location.onMap = true;
      });

      setTimeout(() => {
        PlantsCollection.layer.redraw();
      }, 40);

      MadamNazar.onMap = true;
      Pins.onMap = true;
      Treasure.treasuresOnMap = true;
      Bounty.bountiesOnMap = true;
      CondorEgg.condorEggOnMap = true;
      Salvage.salvageOnMap = true;
    });

    document.querySelector('.camps-small-btn').addEventListener('click', function() {
      this.classList.toggle('disabled');
      Camp.isSmall = !Camp.isSmall;
      Camp.locations.forEach(camp => {
        if (camp.layer['_map'] != null) camp.reinitMarker();
      });
      MapBase.updateTippy('campsbtn');
    });
    
    document.querySelector('.camps-large-btn').addEventListener('click', function() {
      this.classList.toggle('disabled');
      Camp.isLarge = !Camp.isLarge;
      Camp.locations.forEach(camp => {
        if (camp.layer['_map'] != null) camp.reinitMarker();
      });
      MapBase.updateTippy('campsbtn');
    });
    document.querySelector('.camps-wilderness-btn').addEventListener('click', function() {
      this.classList.toggle('disabled');
      Camp.isWilderness = !Camp.isWilderness;
      Camp.locations.forEach(camp => {
        if (camp.layer['_map'] != null) camp.reinitMarker();
      });
      MapBase.updateTippy('campsbtn');
    });

    document.querySelector('.shops-hide-btn').addEventListener('click', function() {
      Shop.locations.forEach(shop => {
        if (shop.onMap) shop.onMap = !shop.onMap;
      });
    });

    document.querySelector('.shops-show-btn').addEventListener('click', function() {
      Shop.locations.forEach(shop => {
        if (!shop.onMap) shop.onMap = !shop.onMap;
      });
    });

    document.querySelector('.gfh-hide-btn').addEventListener('click', function() {
      GunForHire.locations.forEach(_gfh => {
        if (_gfh.onMap) _gfh.onMap = !_gfh.onMap;
      });
    });

    document.querySelector('.gfh-show-btn').addEventListener('click', function() {
      GunForHire.locations.forEach(_gfh => {
        if (!_gfh.onMap) _gfh.onMap = !_gfh.onMap;
      });
    });

    document.querySelector('.plants-hide-btn').addEventListener('click', function() {
      PlantsCollection.locations.forEach(_plants => {
        if (_plants.onMap) _plants.onMap = !_plants.onMap;
      });
    });

    document.querySelector('.plants-show-btn').addEventListener('click', function() {
      PlantsCollection.locations.forEach(_plants => {
        if (!_plants.onMap) _plants.onMap = !_plants.onMap;
      });
      setTimeout(() => PlantsCollection.layer.redraw(), 40);
    });

    document.querySelector('.encounters-hide-btn').addEventListener('click', function() {
      Encounter.locations.forEach(_encounter => {
        if (_encounter.onMap) _encounter.onMap = !_encounter.onMap;
      });
    });

    document.querySelector('.encounters-show-btn').addEventListener('click', function() {
      Encounter.locations.forEach(_encounter => {
        if (!_encounter.onMap) _encounter.onMap = !_encounter.onMap;
      });
    });
  }

  static updateTippy() {
    Menu.tippyInstances.forEach(instance => instance.destroy());
    Menu.tippyInstances = [];

    if (!Settings.showTooltips) return;

    Menu.tippyInstances = tippy('[data-tippy-content]', { theme: 'menu-theme' });
  }
}
