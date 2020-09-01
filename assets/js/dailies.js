class Dailies {
  constructor(role, translationKey, target, value = 0) {
    this.role = role;
    this.translationKey = translationKey;
    this.target = target;
    this.value = value;
  }
  static init() {
    this.jsonData = [];
    this.dailies = [];

    const start = Date.now();
    const websiteData = Loader.promises['daily'].consumeJson(data => this.dailies = data.dailies);
    const allDailies = Loader.promises['possible_dailies'].consumeJson(data => this.jsonData = data);

    return Promise.all([websiteData, allDailies])
      .then(() => {
        console.info(`%c[Dailies] Loaded in ${Date.now() - start}ms!`, 'color: #bada55; background: #242424');

        Object.keys(this.dailies).forEach(role => {
          $('.dailies').append($(`<div class="${role} daily-role">${Language.get('menu.dailies_' + role)}</div>`));
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
    // TODO: This format needs to be translatable. Russian uses "<challenge>: 0/<goal>",
    // otherwise it doesn't make sense grammatically. - Bob
    const structure = Language.get('menu.daily_challenge_structure').match(/\{(.+?)\}\s?\{(.+?)\}/);
    $('.one-daily-container').css({
      'grid-template-areas': `\"${structure[1]} ${structure[2]}\"`
      
      });

    $(`.dailies > .${this.role}`).append($(`
      <div class="one-daily-container">
        <span id="counter">${this.value}/${this.target}</span>
        <span id="daily">${Language.get(this.translationKey)}</span>
      </div>`));
  }
  static dailiesNotUpdated() {
    $('.dailies').append($(`
      <div class="daily-not-found not-found">${Language.get('menu.dailies_not_found')}</div>
    `));
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