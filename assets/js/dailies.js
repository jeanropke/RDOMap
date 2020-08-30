const Dailies = {
  jsonData: [],
  dailies: [],
  keys: {},

  init: function () {
    const websiteData = this.websiteJsonData();
    const jsonData = this.loadDailiesList();
    Promise.all([websiteData, jsonData])
      .then(() => this.appendMenu())
      .catch(() => this.dailiesNotUpdated());
  },
  websiteJsonData: function () {
    return Loader.promises['daily'].consumeJson(data => {
      this.dailies = data.dailies;
      console.info('%c[Today\'s dailies loaded]', 'color: #bada55; background: #242424');
    });
  },
  loadDailiesList: function () {
    return Loader.promises['possible_dailies'].consumeJson(data => {
      this.jsonData = data;
      console.info('%c[Dailies list loaded]', 'color: #bada55; background: #242424');
    });
  },
  appendMenu: function () {
    Object.keys(this.dailies).forEach(role => {
      $('.dailies').append($(`<div class="${role} daily-role">${Language.get('menu.dailies_' + role)}</div>`));

      this.dailies[role].list.forEach(({ text, target }) => {
        const key = this.jsonData.find(element => (element.dailyName) === text.replace(/\*$/, ''))['dailyKey'];
        const $menuElement = $(`
        <div class="one-daily-container">
          0/${target}<span>${Language.get(key)}</span>
        </div>
        `);

        $(`.dailies > .${role}`).append($menuElement);
      });
    });
  },
  dailiesNotUpdated: function () {
    $('.dailies').append($(`
    <div class="daily-not-found not-found">${Language.get('menu.dailies_not_found')}</div>
    `));
  }
}