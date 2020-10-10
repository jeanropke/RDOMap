class Dailies {
  constructor(role, translationKey, target, index) {
    this.role = role;
    this.translationKey = translationKey;
    this.target = target;
    this.index = index;
  }
  static init() {
    this.categories = [];
    this.categoryOffset = 0;
    this.jsonData = [];
    this.dailiesList = [];
    this.context = $('.daily-challenges[data-type=dailies]');
    this.markersCategories = [];

    const currentDailies = Loader.promises['dailies'].consumeJson(data => this.dailiesList = data);
    const allDailies = Loader.promises['possible_dailies'].consumeJson(data => this.jsonData = data);

    $('#dailies-prev').on('click', Dailies.prevCategory);
    $('#dailies-next').on('click', Dailies.nextCategory);

    const dailiesDate = new Date(Date.now() - 21600000).toISOUTCDateString(); // 21600000ms = 6 hours

    // delete old saved completed dailies on day change
    if (localStorage.lastDailiesDate !== dailiesDate) {
      for (let setting in localStorage) {
        if (setting.startsWith('rdo:dailies.'))
          delete localStorage[setting];
      }
      localStorage.setItem('lastDailiesDate', dailiesDate);
    }

    return Promise.all([currentDailies, allDailies])
      .then(() => {
        if (this.dailiesList.date.indexOf(dailiesDate) === -1)
          return Promise.reject();

        console.info(`%c[Dailies] Loaded!`, 'color: #bada55; background: #242424');

        this.dailiesList.data.forEach((roleData, roleIndex) => {
          const role = roleData.role.replace(/CHARACTER_RANK_?/, '').toLowerCase() || 'general';
          if (role === 'general') this.categoryOffset = roleIndex;
          this.categories.push(role);

          $('.dailies')
            .append($(`<div id="${role}" class="daily-role"></div>`)
              .toggleClass('hidden', role !== 'general'));

          roleData.challenges.forEach(({ desiredGoal, displayType, description: { label }}, index) => {
            const activeCategory = this.jsonData.find(({ key }) => key === label.toLowerCase()).category;
            this.markersCategories.push(activeCategory);
            SettingProxy.addSetting(DailyChallenges, `${role}_${index}`, {});

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
                desiredGoal = Math.floor(desiredGoal * 3.281);
                break;
              default:
                desiredGoal = Math.trunc(desiredGoal);
            }

            const newDaily = new Dailies(role, label.toLowerCase(), desiredGoal, index);
            newDaily.appendToMenu();
          });
        });
        this.onLanguageChanged();
      })
      .catch(this.dailiesNotUpdated);
  }
  appendToMenu() {
    const structure = Language.get('menu.daily_challenge_structure').match(/\{(.+?)\}.*?\{(.+?)\}/);

    $(`.dailies > #${this.role}`)
      .append($(`
          <div class="one-daily-container">
            <label for="checkbox-${this.role}-${this.index}"></label>
            <span class="counter" data-text="${this.target}"></span>
            <span class="daily" id="daily-${this.role}-${this.index}" data-text="${this.translationKey}"></span>
            <div class="input-checkbox-wrapper">
              <input class="input-checkbox" type="checkbox" name="check-${this.role}-${this.index}" value="0"
                id="checkbox-${this.role}-${this.index}" />
              <label class="input-checkbox-label" for="checkbox-${this.role}-${this.index}"></label>
            </div>
          </div>`))
      .translate()
      .find('.one-daily-container')
        .css({
          'grid-template-areas': `"${structure[1]} daily-challenge ${structure[2]}"`,
        })
      .end()
      .find(`#checkbox-${this.role}-${this.index}`)
        .prop('checked', DailyChallenges[`${this.role}_${this.index}`])
        .on('change', () => {
          DailyChallenges[`${this.role}_${this.index}`] = $(`#checkbox-${this.role}-${this.index}`).prop('checked');
        })
      .end();
  }
  static dailiesNotUpdated() {
    $('.dailies').append($(`
      <div class="daily-not-found not-found">${Language.get('menu.dailies_not_found')}</div>
    `));
    $('#dailies-changer-container, #sync-map-to-dailies').addClass('hidden');
  }
  static nextCategory() {
    Dailies.categoryOffset = (Dailies.categoryOffset + 1).mod(Dailies.categories.length);
    Dailies.switchCategory();
  }
  static prevCategory() {
    Dailies.categoryOffset = (Dailies.categoryOffset - 1).mod(Dailies.categories.length);
    Dailies.switchCategory();
  }
  static switchCategory() {
    const roles = $('.daily-role');
    [].forEach.call(roles, element => {
      $(element).toggleClass('hidden', element.id !== Dailies.categories[Dailies.categoryOffset]);
    });
    $('.dailies-title').text(Language.get(`menu.dailies_${Dailies.categories[Dailies.categoryOffset]}`));
  }
  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
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
      const [category, marker] = element;
      if (marker === '') return;
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