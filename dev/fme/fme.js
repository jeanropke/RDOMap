/**
 * Display various Free Mode Events.
 *
 * Created by Richard Westenra, stripped to only display next 2 events.
 * For the full experience, please visit his websites at:
 *
 * Website: https://www.richardwestenra.com/rdr2-free-roam-event-schedule
 * Patreon: https://www.patreon.com/bePatron?u=24592842
 * GitHub: https://github.com/richardwestenra
 *
 * License: MIT
 */

function getString(key) {
  const obj = {
    'menu.fme.time.starts_in': 'Starts in {time}.',
    'menu.fme.time.less_than_a_minute': 'less than a minute',
    'menu.fme.time.minute': '{minutes} minute',
    'menu.fme.time.minutes': '{minutes} minutes',
    'menu.fme.fme_archery': 'Master Archer',
    'menu.fme.fme_dead_drop': 'Dispatch Rider',
    'menu.fme.fme_fishing_challenge': 'Fishing Challenge',
    'menu.fme.fme_golden_hat': "Fool's Gold",
    'menu.fme.fme_hot_property': 'Cold Dead Hands',
    'menu.fme.fme_king_of_the_castle': 'King of the Castle',
    'menu.fme.fme_king_of_the_rail': 'Railroad Baron',
    'menu.fme.fme_random': 'Random Challenge',
    'menu.fme.fme_role_animal_tagging': 'Wild Animal Tagging',
    'menu.fme.fme_role_condor_egg': 'Condor Egg',
    'menu.fme.fme_role_greatest_bounty_hunter': 'Day of Reckoning',
    'menu.fme.fme_role_protect_legendary_animal': 'Protect Legendary Animal',
    'menu.fme.fme_role_round_up': 'Manhunt',
    'menu.fme.fme_role_supply_train': 'Trade Route',
    'menu.fme.fme_role_wildlife_photographer': 'Wildlife Photographer',
    'menu.fme.fme_role_wreckage': 'Salvage',
    'menu.fme.fme_wild_animal_kills': 'Wild Animal Kills',
  };

  return obj[key];
}

const FME = {

  /**
   * The last retrieved events JSON
   */
  _eventsJson: null,

  /**
   * A list of notifications that have already been sent to prevent dupes.
   * Doesn't account for people refreshing just in time.
   * Maybe make this persistent later, but there's no real need for it.
   */
  _sentNotifications: [],

  /**
   * DOM elements for the FME card
   */
  elements: {
    nextEventImage: document.getElementById('next-image'),
    nextEventName: document.getElementById('next-name'),
    nextEventEta: document.getElementById('next-eta'),
  },

  /**
   * Update the FME data
   * @param {Array} schedule List of event times
   */
  updateEvent: function (schedule) {
    const elements = FME.elements;
    const frequency = FME.minutesToMilliseconds(45);
    let hasValidNext = false;
    let lastEta = null;

    schedule.forEach(function (e, i) {
      const event = FME.getEventObject(e, frequency);

      if (event.eta > 0 && event.eta < frequency && (!lastEta || event.eta < lastEta)) {
        hasValidNext = true;
        lastEta = event.eta;

        const fmeName = event.nameText;
        const fmeBody = getString('menu.fme.time.starts_in').replace('{time}', event.etaText);

        elements.nextEventImage.className = 'fme-image icon-' + event.name;
        elements.nextEventName.innerHTML = fmeName;
        elements.nextEventEta.innerHTML = fmeBody;
      }
    });

    $('#next-event').toggle(hasValidNext);
  },

  /**
   * Convert minutes to milliseconds
   * @param {number} time Time in minutes
   * @return {number} Time in milliseconds
   */
  minutesToMilliseconds: function (time) {
    return time * 60 * 1000;
  },

  /**
   * Format the event date and perform time-zone calculations
   * @param {Array} event Event data coming from the FME.json file
   * @return {Object} Formatted event data
   */
  getEventObject: function (d, frequency) {
    var eventTime = d[0];
    var now = Date.now();
    var oneDay = this.minutesToMilliseconds(24 * 60);
    var dateTime = this.getDateTime(now, eventTime);
    var eta = dateTime - now;

    // Ensure that event dates are not in the past or too far
    // in the future, where timezone is not UTC
    if (eta > frequency) {
      dateTime = this.getDateTime(now - oneDay, eventTime);
      eta = dateTime - now;
    }

    // Ensure that all event dates are in the future, to fix timezone bug
    if (eta <= 0) {
      dateTime = this.getDateTime(now + oneDay, eventTime);
      eta = dateTime - now;
    }

    return {
      id: d[1],
      dateTime: dateTime,
      name: d[1],
      nameText: getString(`menu.fme.${d[1]}`),
      eta: eta,
      etaText: FME.getEtaText(eta),
    };
  },

  getDateTime: function (date, eventTime) {
    return new Date(
      [new Date(date).toDateString(), eventTime, 'UTC'].join(' ')
    );
  },

  /**
   * Display time remaining in minutes or seconds
   * @param {number} t Time in milliseconds
   * @return {string} Translated string
   */
  getEtaText: function (time) {
    time = time / 1000; // convert to seconds
    function pluralize(time) {
      return time === 1 ? '' : 's';
    }
    if (time < 60) {
      return getString('menu.fme.time.less_than_a_minute');
    }
    time = Math.round(time / 60); // convert to minutes
    return getString('menu.fme.time.minute' + pluralize(time)).replace('{minutes}', time);
  },

  /**
   * Update the FME card
   */
  update: function () {
    if (FME._eventsJson === null) return;
    FME.updateEvent(FME._eventsJson);
  },

  /**
   * Retrieve the FME data from FME.json
   */
  init: async function () {
    const data = await fetch('../../data/fme.json?v=' + Date.now());
    const json = await data.json();
    FME._eventsJson = [...json.general, ...json.role];
    FME.update();
    window.setInterval(FME.update, 5000);
  },
};
