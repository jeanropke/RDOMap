class Dailies {
  constructor(role, translationKey, target, value = 0) {
    this.role = role;
    this.translationKey = translationKey;
    this.target = target;
    this.value = value;
  }
  static init() {
    this.categories = ['general', 'trader', 'collector', 'bounty_hunter', 'moonshiner', 'naturalist'];
    this.categoryOffset = 0;
    this.jsonData = [];
    this.dailies = [];

    const websiteData = Loader.promises['daily'].consumeJson(data => this.dailies = data.dailies);
    const allDailies = Loader.promises['possible_dailies'].consumeJson(data => this.jsonData = data);

    $('#dailies-prev').on('click', Dailies.prevCategory);
    $('#dailies-next').on('click', Dailies.nextCategory);

    return Promise.all([websiteData, allDailies])
      .then(() => {
        console.info(`%c[Dailies] Loaded!`, 'color: #bada55; background: #242424');

        Object.keys(this.dailies).forEach(role => {
          $('.dailies').append($(`<div id="${role}" class="daily-role"></div>`).css('display', role == 'general' ? 'block' : 'none'));
          this.dailies[role].list.forEach(({ text, target }) => {
            text = text.replace(/\*+$/, '').toLowerCase();
            const translationKey = this.jsonData.find(daily => daily.name.toLowerCase() === text).key;
            const newDaily = new Dailies(role, translationKey, target);
            newDaily.appendToMenu();
          });
        });
      })
      .catch(this.dailiesNotUpdated);
  }
  appendToMenu() {
    const structure = Language.get('menu.daily_challenge_structure').match(/\{(.+?)\}.*?\{(.+?)\}/);
    $(`.dailies > #${this.role}`)
      .append($(`
          <div class="one-daily-container">
            <span class="counter">${this.value}/${this.target}</span>
            <span class="daily">${Language.get(this.translationKey)}</span>
          </div>`))
      .find('.one-daily-container')
      .css({
        'grid-template-areas': `\"${structure[1]} ${structure[2]}\"`,
        'justify-content': structure[2] === 'counter' ? 'space-between' : 'left'
      })
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

  set completedDailies(num) {
    if (num === 'true')
      this.value = this.target;
    else if (num === 'false')
      this.value = 0;
    else if (typeof num === 'number') {
      this.value + num;
      if (this.value < 0)
        this.value = 0;
      if (this.value > this.target)
        this.value = this.target;
    }
  }
}