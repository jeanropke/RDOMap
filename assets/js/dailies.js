class Dailies {
  constructor(role, translationKey, target, challengeId) {
    this.role = role;
    this.translationKey = translationKey;
    this.target = target;
    this.challengeId = challengeId;
  }
  static init() {
    this.categories = [];
    this.categoryOffset = 0;
    this.jsonData = [];
    this.dailiesList = [];
    this.markersCategories = [];

    const currentDailies = Loader.promises['dailies'].consumeJson(data => this.dailiesList = data);
    const allDailies = Loader.promises['possible_dailies'].consumeJson(data => this.jsonData = data);

    const dailiesDate = new Date(Date.now() - 216e5).toISOUTCDateString(); // 21600000ms = 6 hours

    if (localStorage.lastDailiesDate !== dailiesDate) {
      for (const setting in localStorage) {
        if (setting.startsWith('rdo:dailies.'))
          delete localStorage[setting];
      }
      localStorage.setItem('lastDailiesDate', dailiesDate);
    }

    return Promise.all([currentDailies, allDailies])
      .then(() => {
        if (this.dailiesList.date.indexOf(dailiesDate) === -1)
          return Promise.reject();

        console.info('%c[Dailies] Loaded!', 'color: #bada55; background: #242424');
        this.dailiesLoaded();

        this.dailiesList.data.forEach(roleData => {
          const role = roleData.role.replace(/CHARACTER_RANK_?/, '').toLowerCase() || 'general';
          const categoryIndex = this.jsonData.category_order.findIndex(element => element === role);
          this.categories[categoryIndex] = role;

          $('.dailies')
            .append($(`<div id="${role}" class="daily-role"></div>`)
              .toggleClass('hidden', role !== 'general'));

          roleData.challenges.forEach(({ desiredGoal, id, displayType, description: { label } }) => {
            const activeCategory = this.jsonData[role].find(({ key }) => key === label.toLowerCase()).category;
            if (activeCategory)
              this.markersCategories.push(activeCategory);
            SettingProxy.addSetting(DailyChallenges, `${role}_${id.toLowerCase()}`, {});

            switch (displayType) {
              case 'DISPLAY_CASH':
                desiredGoal /= 100;
                break;
              case 'DISPLAY_MS_TO_MINUTES':
                desiredGoal /= 60000;
                break;
              case 'DISPLAY_AS_BOOL':
                desiredGoal = 1;
                break;
              case 'DISPLAY_FEET':
                desiredGoal = Math.floor(desiredGoal * 3.28084);
                break;
              default:
                desiredGoal = Math.trunc(desiredGoal);
            }

            const newDaily = new Dailies(role, label.toLowerCase(), desiredGoal, id.toLowerCase());
            newDaily.appendToMenu();
          });
        });
        this.sortDailies();
      })
      .then(this.activateHandlers)
      .catch(this.dailiesNotUpdated);
  }
  appendToMenu() {
    const structure = Language.get('menu.daily_challenge_structure').match(/\{(.+?)\}.*?\{(.+?)\}/);

    $(`.dailies > #${this.role}`)
      .append($(`
          <div class="one-daily-container">
            <span class="counter" data-text="${this.target}"></span>
            <label class="daily" data-text="${this.translationKey}" for="checkbox-${this.role}-${this.challengeId}"></label>
            <span class="daily-checkbox">
              <div class="input-checkbox-wrapper">
                <input class="input-checkbox" type="checkbox" name="checkbox-${this.role}-${this.challengeId}" value="0"
                  id="checkbox-${this.role}-${this.challengeId}" />
                <label class="input-checkbox-label" for="checkbox-${this.role}-${this.challengeId}"></label>
              </div>
            </span>
          </div>`))
      .translate()
      .find('.one-daily-container')
      .css({
        'grid-template-areas': `"${structure[1]} daily-challenge ${structure[2]}"`,
      })
      .end()
      .find(`#checkbox-${this.role}-${this.challengeId}`)
      .prop('checked', DailyChallenges[`${this.role}_${this.challengeId}`])
      .on('change', () => {
        DailyChallenges[`${this.role}_${this.challengeId}`] = $(`#checkbox-${this.role}-${this.challengeId}`).prop('checked');
      })
      .end();
  }
  static dailiesLoaded() {
    $('.dailies .daily-status.loading').addClass('hidden');
  }
  static dailiesNotUpdated() {
    const textKey = 'menu.dailies_not_found';
    $('.dailies').append($('<div class="daily-status not-found"></div>').attr('data-text', textKey).text(Language.get(textKey)));
    $('#dailies-changer-container, #sync-map-to-dailies, .dailies .daily-status.loading').addClass('hidden');
  }
  static switchCategory(offset) {
    Dailies.categoryOffset = (Dailies.categoryOffset + offset).mod(Dailies.categories.length);
    const roles = $('.daily-role');
    [...roles].forEach(element => {
      $(element).toggleClass('hidden', element.id !== Dailies.categories[Dailies.categoryOffset]);
    });
    const textKey = `menu.dailies_${Dailies.categories[Dailies.categoryOffset]}`;
    $('.dailies-title').attr('data-text', textKey).text(Language.get(textKey));
  }
  static sortDailies() {
    const $roleContainers = $('.daily-role');
    [...$roleContainers].forEach(roleContainer => {
      const dailies = $(roleContainer).children('.one-daily-container');
      const sortedDailies = [...dailies].sort((...args) => {
        const [a, b] = args.map(dailyContainer =>
          Language.get($(dailyContainer).find('label.daily').attr('data-text')));
        return a.localeCompare(b, Settings.language, { sensitivity: 'base' });
      });
      $(roleContainer).append(sortedDailies);
    });
  }
  static activateHandlers() {
    $('#dailies-prev, #dailies-next').on('click', event => {
      const offset = event.currentTarget.id === 'dailies-next' ? 1 : -1;
      Dailies.switchCategory(offset);
    });
  }
}

// Still looking for a better way than trigger handlers, if you have any better idea feel free to modify it
class SynchronizeDailies {
  constructor(category, marker) {
    this.category = category;
    this.markers = marker;
  }
  static init() {
    $('.menu-hide-all').trigger('click');
    Dailies.markersCategories.forEach(element => {
      if (!element) return;
      const [category, marker] = element;
      const newSyncedCategory = new SynchronizeDailies(category, marker);
      newSyncedCategory.sync();
    });
  }
  sync() {
    this.key = (() => {
      switch (this.category) {
        case 'animal':
        case 'fish':
          return `menu.cmpndm.${this.category}_${this.markers}`;
        case 'shops':
        case 'plants':
        case 'gfh':
          return `map.${this.category}.${this.markers}.name`;
        case 'menu':
          return `${this.category}.${this.markers}`;
        case 'nazar':
          return `menu.${this.markers}`;
        case 'daily_location':
          return `menu.${this.markers}.name`;
        default:
          console.log(`${this.category} ${this.markers} not found`); // only temporary
      }
    })();

    if ($(`[data-text="${this.key}"]`).parent().hasClass('disabled') ||
      $(`[data-text="${this.key}"]`).parent().parent().hasClass('disabled'))
      $(`[data-text="${this.key}"]`).trigger('click');
  }
}
