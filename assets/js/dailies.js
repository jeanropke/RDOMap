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

        this.dailiesLoaded();

        this.categories = allDailies.category_order;
        this.categories.forEach((category, index) => {
          const div = document.createElement('div');
          div.id = category;
          div.className = `daily-role${index ? ' hidden' : ''}`;
          document.querySelector('.dailies').appendChild(div);
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
    const container = document.createElement('div');
    container.className = 'one-daily-container';
    container.setAttribute('data-type', `${this.role}-${this.categoryType}`);
    container.innerHTML = `
            <span class="counter" data-text="${this.desiredGoal}"></span>
            <label class="daily" data-text="${this.translationKey}" for="checkbox-${this.role}-${this.challengeId}"></label>
            <span class="daily-checkbox">
              <div class="input-checkbox-wrapper">
                <input class="input-checkbox" type="checkbox" name="checkbox-${this.role}-${this.challengeId}" value="0"
                  id="checkbox-${this.role}-${this.challengeId}" />
                <label class="input-checkbox-label" for="checkbox-${this.role}-${this.challengeId}"></label>
              </div>
            </span>
    `;

    document.querySelector(`.dailies > #${this.role}`).appendChild(container);
    Language.translateDom(container);

    container.style.gridTemplateAreas = `"${Dailies.challengeStructure[1]} daily-challenge ${Dailies.challengeStructure[2]}"`;
    const checkbox = document.getElementById(`checkbox-${this.role}-${this.challengeId}`);
    checkbox.checked = DailyChallenges[`${this.role}_${this.challengeId}`];
    checkbox.addEventListener('change', event => {
      DailyChallenges[`${this.role}_${this.challengeId}`] = event.target.checked;
    });
  }

  static dailiesLoaded() {
    console.info('%c[Dailies] Loaded!', 'color: #bada55; background: #242424');
    document.querySelector('.dailies .daily-status.loading').classList.add('hidden');
  }

  static dailiesNotUpdated(err) {
    console.info(`%c[Dailies] ${err}`, 'color: #FF6969; background: #242424');
    const textKey = 'menu.dailies_not_found';
    const div = document.createElement('div');
    div.className = 'daily-status not-found';
    div.setAttribute('data-text', textKey);
    div.textContent = Language.get(textKey);
    document.querySelector('.dailies').appendChild(div);
    document.querySelector('#dailies-changer-container').classList.add('hidden');
    document.querySelector('#sync-map-to-dailies').classList.add('hidden');
    document.querySelector('.dailies .daily-status.loading').classList.add('hidden');
  }

  static switchCategory(offset) {
    this.categoryOffset = (this.categoryOffset + offset).mod(this.categories.length);
    const activeRole = this.categories[this.categoryOffset];
    const roles = document.querySelectorAll('.daily-role');
    roles.forEach(element => {
      element.classList.toggle('hidden', element.id !== activeRole);
    });
    const textKey = `menu.dailies_${activeRole}`;
    const dailiesTitle = document.querySelector('.dailies-title');
    dailiesTitle.setAttribute('data-text', textKey);
    dailiesTitle.textContent = Language.get(textKey);
    
    this.switchDifficulty();
    const difficultySelectors = document.querySelector('.dailies-difficulty-selection').children;
    Array.from(difficultySelectors).forEach(selector => {
      selector.classList.toggle(
        'hidden',
        !selector.classList.contains(
          `${activeRole}-dailies-difficulty-selection`
        )
      );
    });
  }
  
  static switchDifficulty() {
    const activeRole = this.categories[this.categoryOffset];
    if (activeRole === 'general') return;
    const dailiesGroup = document.querySelectorAll(`#${activeRole} .one-daily-container`);
    const selectedDifficulty = DailyChallenges[`${activeRole}_difficulty`];
    dailiesGroup.forEach((daily) => {
      daily.classList.toggle(
        'hidden',
        daily.getAttribute('data-type') !==
          `${activeRole}-${selectedDifficulty}`
      );
    });
  }

  static sortDailies() {
    const roleContainers = document.querySelectorAll('.daily-role');
    roleContainers.forEach(roleContainer => {
      const dailies = [...roleContainer.children].filter(child => child.classList.contains('one-daily-container'));
      dailies.sort((a, b) => {
        const textA = Language.get(a.querySelector('label.daily').getAttribute('data-text'));
        const textB = Language.get(b.querySelector('label.daily').getAttribute('data-text'));
        return textA.localeCompare(textB, Settings.language, { sensitivity: 'base' });
      });
      dailies.forEach(daily => roleContainer.appendChild(daily));
    });
  }

  static activateHandlers() {
    document.querySelectorAll('#dailies-prev, #dailies-next').forEach(btn => {
      btn.addEventListener('click', event => {
        const offset = event.currentTarget.id === 'dailies-next' ? 1 : -1;
        Dailies.switchCategory(offset);
      });
    });

    this.categories.slice(1).forEach(role => {
      const selector = document.getElementById(`${role}-dailies-difficulty-selection`);
      selector.value = DailyChallenges[`${role}_difficulty`];
      selector.addEventListener('change', function() {
        DailyChallenges[`${role}_difficulty`] = this.value;
        Dailies.switchDifficulty();
      });
    });

    document.getElementById('sync-map-to-dailies').addEventListener('click', SynchronizeDailies.init);
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
    document.querySelectorAll('.menu-hide-all').forEach(el => el.click());

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

    const targetEl = document.querySelector(`[data-text="${this.key}"]`);
    if (
      targetEl.parentElement.classList.contains('disabled') ||
      targetEl.parentElement.parentElement.classList.contains('disabled')
    ) {
      targetEl.click();
    }
  }
}
