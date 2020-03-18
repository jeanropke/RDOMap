/**
 * Created by Richard Westenra, stripped to only display next 2 events.
 * For the full experience, please visit his websites at:
 * 
 * Website: https://www.richardwestenra.com/rdr2-free-roam-event-schedule
 * Patreon: https://www.patreon.com/bePatron?u=24592842
 * GitHub: https://github.com/richardwestenra
 * 
 * License: MIT
 */

var FME = {
  // What FME to display.
  // 0: None
  // 1: General only
  // 2: Role only
  // 3: Both
  display: !isNaN(parseInt($.cookie('fme-display'))) ? parseInt($.cookie('fme-display')) : 3,

  eventsJson: null,

  // Frequency in minutes
  eventFrequency: {
    events: 45,
    roles: 90
  },

  // Select DOM elements
  elements: {
    events: {
      nextEventImage: document.getElementById('next-fr-event-image'),
      nextEventName: document.getElementById('next-fr-event-name'),
      nextEventEta: document.getElementById('next-fr-event-eta')
    },
    roles: {
      nextEventImage: document.getElementById('next-role-event-image'),
      nextEventName: document.getElementById('next-role-event-name'),
      nextEventEta: document.getElementById('next-role-event-eta')
    }
  },

  /**
   * Update the list of event times
   * @param {Array} schedule List of event times
   * @param {string} key Property key (either events/roles)
   */
  updateList: function (schedule, key) {
    var el = FME.elements[key];
    var frequency = FME.minutesToMilliseconds(FME.eventFrequency[key]);
    schedule.forEach(function (t, i) {
      var event = FME.calculateEventTimes(t);
      var li = document.createElement('li');
      if (event.eta > 0 && event.eta < frequency) {
        li.classList.add('next-event');
        el.nextEventImage.src = './assets/images/fme/' + event.image + '.png';
        el.nextEventName.innerHTML = Language.get(event.name);
        el.nextEventEta.innerHTML = Language.get('menu.fme.time.starts_in').replace('{time}', event.etaText);
      }
    });
  },

  /**
   * Convert minutes to milliseconds
   * @param {number} t Time in minutes
   * @return {number} Time in milliseconds
   */
  minutesToMilliseconds: function (t) {
    return t * 60 * 1000;
  },

  /**
   * Format the event datum and perform time-zone calculations
   * @param {Array} d Event datum containing time and name
   * @return {Object} Formatted event datum
   */
  calculateEventTimes: function (d) {
    var eventTime = d[0];
    var now = new Date();
    var eventDateTime = new Date(
      [now.toDateString(), eventTime, 'UTC'].join(' ')
    );
    var eta = eventDateTime - now;
    // Ensure that all event dates are in the future, to fix timezone bug
    if (eta <= 0) {
      var tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      eventDateTime = new Date(
        [tomorrow.toDateString(), eventTime, 'UTC'].join(' ')
      );
      eta = eventDateTime - now;
    }
    return {
      dateTime: eventDateTime,
      name: d[1],
      image: d[2],
      eta: eta,
      etaText: FME.getEtaText(eta),
    };
  },

  /**
   * Display time remaining in minutes or seconds
   * @param {number} t Time in milliseconds
   * @return {string} Translated string
   */
  getEtaText: function (t) {
    t = t / 1000; // convert to seconds
    function s(t) {
      return t === 1 ? '' : 's';
    }
    if (t < 60) {
      return Language.get('menu.fme.time.less_than_a_minute');
    }
    t = Math.round(t / 60); // convert to minutes
    return Language.get('menu.fme.time.minute' + s(t)).replace('{minutes}', t);
  },

  /**
   * Update both lists
   */
  update: function () {
    FME.updateList(FME.eventsJson.events, 'events');
    FME.updateList(FME.eventsJson.roles, 'roles');
    FME.updateVisiblity();
  },

  /**
   * Update the visibility of the events based on FME.display.
   */
  updateVisiblity: function () {
    if (FME.display != 0)
      $('.fme-container').show();
    else
      $('.fme-container').hide();

    if (FME.display == 1 || FME.display == 3)
      $('#next-fr-event').show();
    else
      $('#next-fr-event').hide();

    if (FME.display == 2 || FME.display == 3)
      $('#next-role-event').show();
    else
      $('#next-role-event').hide();
  },

  /**
   * Get the show on the road
   */
  init: function () {
    $.getJSON(`data/fme.json?nocache=${nocache}`)
      .done(function (data) {
        FME.eventsJson = data;

        // Initialise
        FME.update();

        // Update event list every 10 seconds
        window.setInterval(FME.update, 10000);

        console.info('%c[FME] Loaded!', 'color: #bada55; background: #242424');
      });
  }
};