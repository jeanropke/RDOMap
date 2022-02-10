class Dailies {
  constructor(preliminary) {
    Object.assign(this, preliminary);
    this.challengeId = preliminary.id.toLowerCase();
  }
  static init() {
    this.categoryOffset = 0;
    this.markersCategories = [];
    this.challengeStructure = Language.get('menu.daily_challenge_structure').match(/\{(.+?)\}.*?\{(.+?)\}/);

    const currentDate = new Date(Date.now() - 216e5).toISOUTCDateString(); // 21600000ms = 6 hours

    if (localStorage.getItem('rdo.lastDailiesDate') !== currentDate) {
      for (const setting in localStorage) {
        if (setting.startsWith('rdo.dailies.'))
          localStorage.removeItem(setting);
      }
      localStorage.setItem('rdo.lastDailiesDate', currentDate);
    }

    return Promise.all([
      Loader.promises['dailies'].consumeJson(),
      Loader.promises['possible_dailies'].consumeJson(),
    ])
      .then(([currentDailies, allDailies]) => {
        if (!currentDailies.date.includes(currentDate)) {
          return Promise.reject(`Incorrect date [${currentDailies.date}, ${currentDate}]`);
        }

        console.info('%c[Dailies] Loaded!', 'color: #bada55; background: #242424');
        this.dailiesLoaded();

        this.categories = allDailies.category_order;
        this.categories.forEach((category, index) => {
          $('.dailies')
            .append($(`<div id="${category}" class="daily-role"></div>`)
              .toggleClass('hidden', !!index));
        });

        Object.entries(currentDailies.data).forEach(([categoryType, challengesSets]) => {
          if (!Array.isArray(challengesSets)) {
            challengesSets = [challengesSets];
          }

          challengesSets.forEach(({ role, challenges }) => {
            role = role.replace(/CHARACTER_RANK_?/, '').toLowerCase() || 'general';
            challenges.forEach(({ desiredGoal, id, displayType, description: { label, localized } }) => {
              label = label.toLowerCase();

              const daily = allDailies[role].find(({ key }) => key === label);
              if (daily && daily.category) {
                this.markersCategories.push([role, id, daily.category, categoryType]);
              }

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

              const translationKey = Language.hasTranslation(label) ? label : localized;
              const newDaily = new Dailies({ role, translationKey, desiredGoal, id, categoryType });
              newDaily.appendToMenu();
            });
          });
        });

        this.sortDailies();
      })
      .then(this.activateHandlers.bind(this))
      .catch(this.dailiesNotUpdated);
  }
  appendToMenu() {
    $(`.dailies > #${this.role}`)
      .append($(`
          <div class="one-daily-container" data-type="${this.role}-${this.categoryType}">
            <span class="counter" data-text="${this.desiredGoal}"></span>
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
      .css('grid-template-areas', `"${Dailies.challengeStructure[1]} daily-challenge ${Dailies.challengeStructure[2]}"`)
      .end()
      .find(`#checkbox-${this.role}-${this.challengeId}`)
      .prop('checked', DailyChallenges[`${this.role}_${this.challengeId}`])
      .on('change', (event) => {
        DailyChallenges[`${this.role}_${this.challengeId}`] = $(`#${event.target.id}`).prop('checked');
      })
      .end();
  }
  static dailiesLoaded() {
    $('.dailies .daily-status.loading').addClass('hidden');
  }
  static dailiesNotUpdated(err) {
    console.info(`%c[Dailies] ${err}`, 'color: #FF6969; background: #242424');
    const textKey = 'menu.dailies_not_found';
    $('.dailies').append($('<div class="daily-status not-found"></div>').attr('data-text', textKey).text(Language.get(textKey)));
    $('#dailies-changer-container, #sync-map-to-dailies, .dailies .daily-status.loading').addClass('hidden');
  }
  static switchCategory(offset) {
    this.categoryOffset = (this.categoryOffset + offset).mod(this.categories.length);
    const activeRole = this.categories[this.categoryOffset];
    const roles = $('.daily-role');
    [...roles].forEach(element => {
      $(element).toggleClass('hidden', element.id !== activeRole);
    });
    const textKey = `menu.dailies_${activeRole}`;
    $('.dailies-title').attr('data-text', textKey).text(Language.get(textKey));
    this.switchDifficulty();
    const difficultySelectors = $('.dailies-difficulty-selection').children();
    [...difficultySelectors].forEach(selector => {
      const $selector = $(selector);
      $selector.toggleClass('hidden', !$selector.hasClass(`${activeRole}-dailies-difficulty-selection`));
    });
  }
  static switchDifficulty() {
    const activeRole = this.categories[this.categoryOffset];
    if (activeRole === 'general') return;
    const dailiesGroup = $(`#${activeRole} .one-daily-container`);
    const selectedDifficulty = DailyChallenges[`${activeRole}_difficulty`];
    [...dailiesGroup].forEach(daily => {
      const $daily = $(daily);
      $daily.toggleClass('hidden', $daily.attr('data-type') !== `${activeRole}-${selectedDifficulty}`);
    });
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

    this.categories.slice(1).forEach(role => {
      $(`#${role}-dailies-difficulty-selection`)
        .val(DailyChallenges[`${role}_difficulty`])
        .on('change', function() {
          DailyChallenges[`${role}_difficulty`] = $(this).val();
          Dailies.switchDifficulty();
        });
    });

    $('#sync-map-to-dailies').on('click', SynchronizeDailies.init);
  }
}

class SynchronizeDailies {
  constructor(category, marker, challengeKey, role, categoryType) {
    this.category = category;
    this.markers = marker;
    this.challengeKey = challengeKey.toLowerCase();
    this.role = role;
    this.categoryType = categoryType;
  }
  static init() {
    $('.menu-hide-all').trigger('click');

    Dailies.markersCategories.forEach(([role, id, [category, marker], categoryType]) => {
      const newSyncedCategory = new SynchronizeDailies(category, marker, `${role}_${id}`, role, categoryType);
      newSyncedCategory.sync();
    });
  }
  sync() {
    if (!!DailyChallenges[this.challengeKey])
      return;
    if (this.categoryType !== 'general' && this.categoryType !== DailyChallenges[`${this.role}_difficulty`])
      return;

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
