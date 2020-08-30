const Dailies = {
  jsonData: [],
  dailies: [],
  keys: {},

  init: function () {
    const websiteData = this.websiteJsonData();
    const jsonData = this.loadDailiesList();
    Promise.all([websiteData, jsonData])
      .then((data) => this.appendMenu())
      .catch((err) => this.dailiesNotUpdated());
  },
  websiteJsonData: function () {
    return Loader.promises[dailiesChangeTime].consumeJson(data => {
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
    const $dailies = $('.dailies');
    $dailies
      .find('.daily-not-found')
      .addClass('hidden')
      .end();

    Object.keys(this.dailies).forEach((role) => {
      this.dailies[role].list.forEach(({ text, target }, index) => {
        const key = this.jsonData.find((element) => element.dailyName === text)['dailyKey'];
        const $menuElement = $(`
        <div class="one-daily-container">0/${target}<span>${Language.get(key)}</span></div>
        `);

        $(`.dailies > .${role.toLowerCase().replace(/_/, '-')}`).append($menuElement);
      });
    });
  },
  dailiesNotUpdated: function () {
    const $dailies = $('.dailies');
    $dailies
      .find('.general, .collector, .bounty-hunter, .moonshiner, .naturalist')
      .addClass('hidden')
      .end();
  }
}