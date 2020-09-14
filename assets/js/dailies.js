class Dailies {
  constructor(role, translationKey, target, index, value = 0) {
    this.role = role;
    this.translationKey = translationKey;
    this.target = target;
    this.value = value;
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

    return Promise.all([websiteData, allDailies])
      .then(() => {
        if (this.dailiesList.date !== dailiesDate)
          return Promise.reject();

        console.info(`%c[Dailies] Loaded!`, 'color: #bada55; background: #242424');

        Object.keys(this.dailiesList.data).forEach(role => {
          this.categories.push(role);
          $('.dailies').append($(`<div id="${role}" class="daily-role"></div>`).toggleClass('hidden', role !== this.categories[0]));
          this.dailiesList.data[role].forEach(({ daily, target }, index) => {
            let translationKey;
            // temporary in try catch statement until we unify dailies lists
            try {
              translationKey = this.jsonData.find(_daily => _daily.name.toLowerCase() === daily.toLowerCase()).key;
            } catch {
              translationKey = daily;
              console.info(`%c[Dailies] "${daily}" key not found`, 'color: #CD4822; background: #242424');
            }
            const newDaily = new Dailies(role, translationKey, target, index);
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
            <span class="counter" data-text="${this.value}/${this.target}"></span>
            <span class="daily" id="daily-${this.role}-${this.index}" data-text="${this.translationKey}"></span>
          </div>`))
      .translate()
      .find('.one-daily-container')
      .css({
        'grid-template-areas': `"${structure[1]} ${structure[2]}"`,
        'justify-content': structure[2] === 'counter' ? 'space-between' : 'left'
      })
      .find(`#daily-${this.role}-${this.index}`)
      .toggleClass('not-found', Language.get(this.translationKey) === this.translationKey)
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