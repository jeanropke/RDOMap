class Menu {
  static init() {
    this.tippyInstances = [];
    this.tippyRangeInstances = [];
    this.addMapZoomSettings();
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
    Array.from(menu.children).forEach((child) => {
      if (child.classList.contains('collection-value')) {
        buttonGroups.push(child);
      } else {
        otherItems.push(child);
      }
    });

    otherItems.sort((a, b) => a.textContent.toLowerCase().localeCompare(b.textContent.toLowerCase()));

    const fragment = document.createDocumentFragment();
    buttonGroups.forEach((child) => fragment.appendChild(child));
    otherItems.forEach((child) => fragment.appendChild(child));
    menu.innerHTML = '';
    menu.appendChild(fragment);
  }

  
  static addMapZoomSettings() {
    SettingProxy.addSetting(Settings, 'zoomSnap', { default: 0 });
    SettingProxy.addSetting(Settings, 'zoomDelta', { default: 0.5 });
    SettingProxy.addSetting(Settings, 'wheelDebounceTime', { default: 150 });
    SettingProxy.addSetting(Settings, 'wheelPxPerZoomLevel', { default: 70 });

    const inputsMap = new Map();

    function createInputContainer({ key, min, max, value, defaultValue, step = 1, isFloat = false }) {
      const id = key.replace(/_/g, '-');
      const settingsKey = key
        .replace(/^map_/, '')
        .split('_')
        .map((part, idx) => idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
      const container = document.querySelector(`.input-container[data-help="${key}"]`);
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      const inputType = isDesktop ? 'range' : 'number';
    
      container.innerHTML = `
        <label for="${id}" data-text="menu.${key}"></label>
        <input id="${id}" class="input-text ${isDesktop ? 'type-range zoom-wheel-type-range' : 'narrow-select-menu'}" type="${inputType}" min="${min}" max="${max}" value="${value}" step="${step}" data-tippy-content-range=""/>
        ${inputType === 'range' ? `<div class="type-range-tooltip"></div>` : ''}
      `;
    
      const input = document.getElementById(id);
      inputsMap.set(input, defaultValue);

      input.addEventListener('change', function () {
        let inputValue = isFloat ? parseFloat(this.value) : parseInt(this.value);
        if (isNaN(inputValue) || inputValue < min || inputValue > max) inputValue = defaultValue;
        this.value = isFloat ? inputValue.toFixed(1) : Math.round(inputValue);
        Settings[settingsKey] = inputValue;
        MapBase.map.options[settingsKey] = inputValue;
      });
    }

    createInputContainer({ 
      key: 'map_zoom_snap',
      min: 0, max: 3, value: Settings.zoomSnap, defaultValue: 0,
      step: 0.1, isFloat: true,
    });
    createInputContainer({
      key: 'map_zoom_delta',
      min: 0, max: 2, value: Settings.zoomDelta, defaultValue: 0.5,
      step: 0.1, isFloat: true,
    });
    createInputContainer({
      key: 'map_wheel_debounce_time',
      min: 40, max: 200, value: Settings.wheelDebounceTime, defaultValue: 150,
      step: 10, isFloat: false,
    });
    createInputContainer({
      key: 'map_wheel_px_per_zoom_level',
      min: 20, max: 150, value: Settings.wheelPxPerZoomLevel, defaultValue: 70,
      step: 10, isFloat: false,
    });

    const reset = document.getElementById('reset-map-zoom');
    reset.addEventListener('click', () => {
      const zoomSettings = ['map_zoom_snap', 'map_zoom_delta', 'map_wheel_debounce_time', 'map_wheel_px_per_zoom_level'
      ].map((key) =>
        key
          .replace(/^map_/, '')
          .split('_')
          .map((part, idx) => idx === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
      );
      Object.keys(localStorage)
        .filter((key) => zoomSettings.some((k) => key.includes(k)))
        .forEach((key) => localStorage.removeItem(key));

      inputsMap.forEach((defaultValue, input) => {
        input.value = defaultValue;
        input.dispatchEvent(new Event('change'));
      });

      Menu.updateRangeTippy();
    })
  }

  static updateFancySelect() {
    document.querySelectorAll('select:not(.fsb-ignore)').forEach((selectEl) => FancySelect.update(selectEl));

    const tempSpan = document.createElement('span');
    Object.assign(tempSpan.style, { visibility: 'hidden', position: 'absolute', whiteSpace: 'nowrap' });
    document.body.appendChild(tempSpan);
    document.querySelectorAll('.fsb-option').forEach((option) => {
      tempSpan.textContent = option.textContent;
      const textWidth = tempSpan.offsetWidth;
      option.style.fontSize = `${Math.min(Math.max(10, 32 - textWidth / 10), 13)}px`;
    });
    document.body.removeChild(tempSpan);

    document.querySelectorAll('.fsb-select').forEach((selectWrapper) => {
      const fsbBtn = selectWrapper.querySelector('.fsb-button');
      const text = fsbBtn.querySelector('span').textContent;
      fsbBtn.setAttribute('title', text);
      selectWrapper.querySelectorAll('.fsb-option').forEach((option) => {
        option.addEventListener('click', () => fsbBtn.setAttribute('title', option.textContent));
      });
    });

    document.querySelectorAll('.fsb-button').forEach((el) => {
      el.addEventListener('click', () => {
        const scrollPos = document.querySelector('aside').scrollTop;
        setTimeout(() => document.querySelector('aside').scrollTop = scrollPos, 0);
      });
    });
  }

  static activateHandlers() {
    const help = document.getElementById('help-container');
    const helpParagraph = help.querySelector('p');
    document.querySelectorAll('.side-menu, .top-widget, .lat-lng-container').forEach((el) => {
      ['mouseover', 'mouseout'].forEach((eventType) => {
        el.addEventListener(eventType, (event) => {
          const target = eventType === 'mouseover' ? event.target : event.relatedTarget;

          // keep current help if pointer jumped to help container or it overgrew current pointer pos.
          if (help.contains(target)) return;

          if (target && target.closest) {
            const helpEl = target.closest('[data-help]');
            const helpTransId = helpEl ? helpEl.getAttribute('data-help') : 'default';
            helpParagraph.innerHTML = Language.get(`help.${helpTransId}`);
          }
        });
      });
    });

    document.querySelector('.menu-hide-all').addEventListener('click', function () {
      const collections = [
        Shop.locations,
        GunForHire.locations,
        Encounter.locations,
        PlantsCollection.locations,
        CampCollection.locations,
        Location.locations,
        Legendary.animals,
        Singleplayer.locations,
      ];

      collections
        .flatMap((locations) => locations)
        .forEach((location) => {
          if (location.onMap) location.onMap = false;
        });

      AnimalCollection.collection.forEach((collection) => {
        collection.animals.forEach((animal) => (animal.isEnabled = false));
      });

      MadamNazar.onMap = false;
      Pins.onMap = false;
      Treasure.treasuresOnMap = false;
      Bounty.bountiesOnMap = false;
      CondorEgg.condorEggOnMap = false;
      Salvage.salvageOnMap = false;
      // CampCollection.onMap = false;
    });

    document.querySelector('.menu-show-all').addEventListener('click', function () {
      const collections = [
        Shop.locations,
        GunForHire.locations,
        Encounter.locations,
        PlantsCollection.locations,
        CampCollection.locations,
        Location.locations,
        Legendary.animals,
        Singleplayer.locations,
      ];

      collections
        .flatMap((locations) => locations)
        .forEach((location) => {
          if (!location.onMap) location.onMap = true;
        });

      setTimeout(() => {
        PlantsCollection.layer.redraw();
        CampCollection.layer.redraw();
      }, 40);

      MadamNazar.onMap = true;
      Pins.onMap = true;
      Treasure.treasuresOnMap = true;
      Bounty.bountiesOnMap = true;
      CondorEgg.condorEggOnMap = true;
      Salvage.salvageOnMap = true;
      // CampCollection.onMap = true;
    });

    document.querySelector('.camps-small-btn').addEventListener('click', function () {
      CampCollection.isSmall = !CampCollection.isSmall;
      CampCollection.refresh();
    });

    document.querySelector('.camps-large-btn').addEventListener('click', function () {
      CampCollection.isLarge = !CampCollection.isLarge;
      CampCollection.refresh();
    });
    document.querySelector('.camps-wilderness-btn').addEventListener('click', function () {
      CampCollection.isWilderness = !CampCollection.isWilderness;
      CampCollection.refresh();
    });

    document.querySelector('.shops-hide-btn').addEventListener('click', function () {
      Shop.locations.forEach((shop) => {
        if (shop.onMap) shop.onMap = !shop.onMap;
      });
    });

    document.querySelector('.shops-show-btn').addEventListener('click', function () {
      Shop.locations.forEach((shop) => {
        if (!shop.onMap) shop.onMap = !shop.onMap;
      });
    });

    document.querySelector('.gfh-hide-btn').addEventListener('click', function () {
      GunForHire.locations.forEach((_gfh) => {
        if (_gfh.onMap) _gfh.onMap = !_gfh.onMap;
      });
    });

    document.querySelector('.gfh-show-btn').addEventListener('click', function () {
      GunForHire.locations.forEach((_gfh) => {
        if (!_gfh.onMap) _gfh.onMap = !_gfh.onMap;
      });
    });

    document.querySelector('.plants-hide-btn').addEventListener('click', function () {
      PlantsCollection.locations.forEach((_plants) => {
        if (_plants.onMap) _plants.onMap = !_plants.onMap;
      });
    });

    document.querySelector('.plants-show-btn').addEventListener('click', function () {
      PlantsCollection.locations.forEach((_plants) => {
        if (!_plants.onMap) _plants.onMap = !_plants.onMap;
      });
      setTimeout(() => PlantsCollection.layer.redraw(), 40);
    });

    document.querySelector('.camps-hide-btn').addEventListener('click', function () {
      CampCollection.locations.forEach((_plants) => {
        if (_plants.onMap) _plants.onMap = !_plants.onMap;
      });
    });

    document.querySelector('.camps-show-btn').addEventListener('click', function () {
      CampCollection.locations.forEach((_plants) => {
        if (!_plants.onMap) _plants.onMap = !_plants.onMap;
      });
      setTimeout(() => CampCollection.layer.redraw(), 40);
    });

    document.querySelector('.encounters-hide-btn').addEventListener('click', function () {
      Encounter.locations.forEach((_encounter) => {
        if (_encounter.onMap) _encounter.onMap = !_encounter.onMap;
      });
    });

    document.querySelector('.encounters-show-btn').addEventListener('click', function () {
      Encounter.locations.forEach((_encounter) => {
        if (!_encounter.onMap) _encounter.onMap = !_encounter.onMap;
      });
    });

    document.querySelector('.discoverables-hide-btn').addEventListener('click', function () {
      Discoverable.locations.forEach((_discoveable) => {
        if (_discoveable.onMap) _discoveable.onMap = !_discoveable.onMap;
      });
    });

    document.querySelector('.discoverables-show-btn').addEventListener('click', function () {
      Discoverable.locations.forEach((_discoveable) => {
        if (!_discoveable.onMap) _discoveable.onMap = !_discoveable.onMap;
      });
    });

    document.querySelector('.singleplayer-hide-btn').addEventListener('click', function () {
      Singleplayer.locations.forEach((_singleplayer) => {
        if (_singleplayer.onMap) _singleplayer.onMap = !_singleplayer.onMap;
      });
    });

    document.querySelector('.singleplayer-show-btn').addEventListener('click', function () {
      Singleplayer.locations.forEach((_singleplayer) => {
        if (!_singleplayer.onMap) _singleplayer.onMap = !_singleplayer.onMap;
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === ' ') {
        document.querySelector('.menu-toggle').click();
      }
    });
  }

  static updateTippy() {
    Menu.tippyInstances.forEach((instance) => instance.destroy());
    Menu.tippyInstances = [];

    if (!Settings.showTooltips) return;

    Menu.tippyInstances = tippy('[data-tippy-content]', { theme: 'menu-theme' });
  }

  static updateRangeTippy() {
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    if (isDesktop) {
      Menu.tippyRangeInstances.forEach((instance) => instance.destroy());
      Menu.tippyRangeInstances = [];
  
      Menu.tippyRangeInstances = tippy('[data-tippy-content-range]', {
        theme: 'menu-theme',
        hideOnClick: false,
        arrow: false,
        placement: 'top',
        offset: [0, 12],
        content: (reference) => reference.value,
        trigger: 'mouseenter input pointerdown pointerup',
        onTrigger: (instance, event) => {
          if (event.type === 'input' || event.type === 'pointerdown') {
            instance.setContent(instance.reference.value);
            instance.show();
          }
          if (event.type === 'pointerup') {
            setTimeout(() => instance.hide(), 0);
          }
        }
      });
    }
  }
}
