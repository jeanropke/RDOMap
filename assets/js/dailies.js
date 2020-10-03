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

    const websiteData = Loader.promises['dailies'].consumeJson(data => this.dailiesList = data);
    const allDailies = Loader.promises['possible_dailies'].consumeJson(data => this.jsonData = data);

    $('#dailies-prev').on('click', Dailies.prevCategory);
    $('#dailies-next').on('click', Dailies.nextCategory);

    const dailiesDate = new Date(Date.now() - 21600000).toISOUTCDateString();  // 21600000 = 6 hours

    SettingProxy.addSetting(Settings, 'lastDailiesDate', { default: dailiesDate });

    // delete old saved completed dailies on day change
    if (Settings.lastDailiesDate !== dailiesDate) {
      for (let setting in localStorage) {
        if (setting.startsWith('rdo:dailies.'))
          delete localStorage[setting];
      }
      Settings.lastDailiesDate = dailiesDate;
    }

    return Promise.all([websiteData, allDailies])
      .then(() => {
        if (this.dailiesList.date !== dailiesDate)
          return Promise.reject();

        console.info(`%c[Dailies] Loaded!`, 'color: #bada55; background: #242424');

        Object.keys(this.dailiesList.data).forEach(role => {
          this.categories.push(role);
          $('.dailies').append($(`<div id="${role}" class="daily-role"></div>`).toggleClass('hidden', role !== this.categories[0]));
          this.dailiesList.data[role].forEach(({ daily, target }, index) => {
            SettingProxy.addSetting(DailyChallenges, `${role}_${index}`, {});
            const newDaily = new Dailies(role, daily.toLowerCase(), target, index);
            newDaily.appendToMenu();
          });
        });
        this.onLanguageChanged();
      })
      .catch(this.dailiesNotUpdated);
  }
  appendToMenu() {
    const structure = Language.get('menu.daily_challenge_structure').match(/\{(.+?)\}.*?\{(.+?)\}.*?\{(.+?)\}/);

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
          'grid-template-areas': `"${structure[1]} ${structure[2]} ${structure[3]}"`,
          'justify-content': structure[2] === 'counter' ? 'space-between' : 'left'
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
    $('#dailies-changer-container').addClass('hidden');
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