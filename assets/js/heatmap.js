/**
 * Created by Jean on 2019-10-19.
 */

var Heatmap = {};

Heatmap.load = function() {
    $.getJSON(`data/heatmap.json?nocache=${nocache}`)
        .done(function(data)
        {
            Heatmap.data = data;
            Heatmap.init();
        });
};

Heatmap.init = function () {

    $.each(Heatmap.data, function(heatmapKey, heatmapValue)
    {
        $.each(heatmapValue, function(key, value)
        {
            $(`.${heatmapKey}`).append(`<div class="menu-row">
             <div class="menu-option animal-clickable" data-type="${key}">
             <img class="icon" src="https://s.rsg.sc/sc/images/games/RDR2/compendium/CMPNDM_ANIMALS/${value.image}" />
             <span data-text="menu.animal.${key}" class="disabled">${Language.get('menu.animal.'+key)}</span>
             </div>
             </div>`);
        });
    });

    //Reorder animals menu alphabetically
    Menu.reorderMenu('.animals');
    Menu.reorderMenu('.birds');
};