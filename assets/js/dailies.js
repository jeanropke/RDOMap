class Dailies {
  constructor(role, text, key, target, value = 0) {
    this.role = role;
    this.text = text;
    this.key = key;
    this.target = target;
    this.value = value;
  }
  static init() {
    this.jsonData = [];
    this.dailies = [];

    const start = Date.now();
    const websiteData = Loader.promises['daily'].consumeJson(data => this.dailies = data.dailies);
    const allDailies = Loader.promises['possible_dailies'].consumeJson(data => this.jsonData = data);

    Promise.all([websiteData, allDailies])
      .then(() => {
        console.info(`%c[Dailies] Loaded in ${Date.now() - start}ms!`, 'color: #bada55; background: #242424');

        Object.keys(this.dailies).forEach(role => {
          $('.dailies').append($(`<div class="${role} daily-role">${Language.get('menu.dailies_' + role)}</div>`));
          this.dailies[role].list.forEach(({ text, target }) => {
            const key = this.jsonData.find(element => element.dailyName === text.replace(/\*$/, ''))['dailyKey'];
            const newDaily = new Dailies(role, text, key, target);
            newDaily.appendToMenu();
          });
        });
      })
      .catch(() => this.dailiesNotUpdated());
  }
  appendToMenu() {
    const $menuElement = $(`
        <div class="one-daily-container">
          ${this.value}/${this.target}<span>${Language.get(this.key)}</span>
        </div>
        `);

    $(`.dailies > .${this.role}`).append($menuElement);
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