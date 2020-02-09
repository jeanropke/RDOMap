/**
 * Created by Jean on 2019-10-09.
 */

var Heatmap = {
  data: null,

  load: function () {
    $.getJSON(`data/hm.json?nocache=${nocache}`)
      .done(function (data) {
        Heatmap.data = data;
        Heatmap.init();
      });
  },

  init: function () {
    $.each(Heatmap.data, function (heatmapKey, heatmapValue) {
      $.each(heatmapValue, function (key, value) {
        if (value.data.length == 0)
          return;

        var animalText = key;
        var animalTitle = Language.get(`menu.${heatmapKey}.${key}`);
        var animalImage = $('<img>').attr('src', `./assets/images/icons/game/animals/${value.image}.png`).addClass('animal-icon');

        var animalElement = $('<div>').addClass('animal-wrapper').attr('data-help', 'item').attr('data-type', animalText);
        var animalTextWrapperElement = $('<span>').addClass('animal-text disabled');
        var animalTextElement = $('<p>').addClass('animal').text(animalTitle);

        $(`.menu-hidden[data-type=${heatmapKey}]`).append(animalElement.append(animalImage).append(animalTextWrapperElement.append(animalTextElement)));
      });
    });
  },

  initLayer: function () {
    Layers.heatmapLayer = new HeatmapOverlay({
      radius: 1.5,
      maxOpacity: 0.5,
      minOpacity: 0.1,
      scaleRadius: true,
      useLocalExtrema: false,
      latField: 'lat',
      lngField: 'lng',
      valueField: 'count',
      gradient: { 0.25: "rgb(125, 125, 125)", 0.55: "rgb(48, 25, 52)", 1.0: "rgb(255, 42, 32)" }
    });
  },

  setHeatmap: function (value, category) {
    Layers.heatmapLayer.setData({ min: 10, data: Heatmap.data[category][value].data });
  },

  removeHeatmap: function (reset = false) {
    if (reset) {
      $('.menu-hidden .animal-wrapper').each(function (key, value) {
        $(value).children('span').addClass('disabled');
      });
    }

    Layers.heatmapLayer.setData({ min: 10, data: [] });
  }
};