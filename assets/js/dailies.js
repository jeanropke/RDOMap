class Dailies {
  constructor(role, translationKey, target, index, value = 0) {
    this.role = role;
    this.translationKey = translationKey;
    this.target = target;
    this.value = value;
    this.index = index;
  }
  static init() {
    this.categories = ['general', 'trader', 'collector', 'bounty_hunter', 'moonshiner', 'naturalist'];
    this.categoryOffset = 0;
    this.jsonData = [];
    this.dailies = [];
    this.context = $('.daily-challenges[data-type=dailies]');

    const websiteData = Loader.promises['daily'].consumeJson(data => this.dailies = data.dailies);
    const allDailies = Loader.promises['possible_dailies'].consumeJson(data => this.jsonData = data);

    $('#dailies-prev').on('click', Dailies.prevCategory);
    $('#dailies-next').on('click', Dailies.nextCategory);

    return Promise.all([websiteData, allDailies])
      .then(() => {
        console.info(`%c[Dailies] Loaded!`, 'color: #bada55; background: #242424');

        Object.keys(this.dailies).forEach(role => {
          $('.dailies').append($(`<div id="${role}" class="daily-role"></div>`).css('display', role == 'general' ? 'block' : 'none'));
          this.dailies[role].list.forEach(({ text, target }, index) => {
            text = text.replace(/\*+$/, '').toLowerCase();
            let translationKey
            try {
              translationKey = this.jsonData.find(daily => daily.name.toLowerCase() === text).key;
            } catch {
              translationKey = text;
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
        'grid-template-areas': `\"${structure[1]} ${structure[2]}\"`,
        'justify-content': structure[2] === 'counter' ? 'space-between' : 'left'
      })
      .find(`#daily-${this.role}-${this.index}`)
      .toggleClass('not-found', Language.get(this.translationKey) == this.translationKey)
      .end();
  }
  static dailiesNotUpdated() {
    $('.dailies').append($(`
      <div class="daily-not-found not-found">${Language.get('menu.dailies_not_found')}</div>
    `));
  }
  static nextCategory() {
    $(`#${Dailies.categories[Dailies.categoryOffset]}.daily-role`).css('display', 'none');

    Dailies.categoryOffset++;

    if (Dailies.categoryOffset > Dailies.categories.length - 1)
      Dailies.categoryOffset = 0;

    $('.dailies-title').text(Language.get(`menu.dailies_${Dailies.categories[Dailies.categoryOffset]}`));
    $(`#${Dailies.categories[Dailies.categoryOffset]}.daily-role`).css('display', 'block');
  }
  static prevCategory() {
    $(`#${Dailies.categories[Dailies.categoryOffset]}.daily-role`).css('display', 'none');

    Dailies.categoryOffset--;

    if (Dailies.categoryOffset < 0)
      Dailies.categoryOffset = Dailies.categories.length - 1;

    $('.dailies-title').text(Language.get(`menu.dailies_${Dailies.categories[Dailies.categoryOffset]}`));
    $(`#${Dailies.categories[Dailies.categoryOffset]}.daily-role`).css('display', 'block');
  }
  static onLanguageChanged() {
    Menu.reorderMenu(this.context);
  }
}