/**
 * Created by Jean on 2019-10-09.
 */

var Language = {};

Language.load = function(isChanged)
{
    languageData = {"en-us":{"menu.markers": "Markers","menu.campfires": "Campfires","menu.hideouts": "Gang Hideouts","menu.plants": "Plants","menu.hide_all": "Hide all","menu.show_all": "Show all","menu.search": "Search","menu.settings": "Settings","menu.language": "Language","menu.yes": "Yes","menu.no": "No","menu.show_coords": "Show coordinates on click","menu.issues": "Issues","menu.report_issues": "Report issues here!","menu.fast_travel": "Fast Travel","menu.search_placeholder": "Search items. Separated by ;","campfire_1.name": "Campfire #1","campfire_1.desc": "","campfire_2.name": "Campfire #2","campfire_2.desc": "","campfire_3.name": "Campfire #3","campfire_3.desc": "","campfire_4.name": "Campfire #4","campfire_4.desc": "","campfire_5.name": "Campfire #5","campfire_5.desc": "","campfire_6.name": "Campfire #6","campfire_6.desc": "","campfire_7.name": "Campfire #7","campfire_7.desc": "","campfire_8.name": "Campfire #8","campfire_8.desc": "","campfire_9.name": "Campfire #9","campfire_9.desc": "","campfire_10.name": "Campfire #10","campfire_10.desc": "","campfire_11.name": "Campfire #11","campfire_11.desc": "","campfire_12.name": "Campfire #12","campfire_12.desc": "","campfire_13.name": "Campfire #13","campfire_13.desc": "","campfire_14.name": "Campfire #14","campfire_14.desc": "","campfire_15.name": "Campfire #15","campfire_15.desc": "","hideout_1.name": "Gang hideout #1","hideout_1.desc": "","hideout_2.name": "Gang hideout #2","hideout_2.desc": "","hideout_3.name": "Gang hideout #3","hideout_3.desc": "","hideout_4.name": "Gang hideout #4","hideout_4.desc": "","hideout_5.name": "Gang hideout #5","hideout_5.desc": "","hideout_6.name": "Gang hideout #6","hideout_6.desc": "","hideout_7.name": "Gang hideout #7","hideout_7.desc": "","hideout_8.name": "Gang hideout #8","hideout_8.desc": "","hideout_9.name": "Gang hideout #9","hideout_9.desc": "","hideout_10.name": "Gang hideout #10","hideout_10.desc": "","hideout_11.name": "Gang hideout #11","hideout_11.desc": "","hideout_12.name": "Gang hideout #12","hideout_12.desc": "","hideout_13.name": "Gang hideout #13","hideout_13.desc": "","hideout_14.name": "Gang hideout #14","hideout_14.desc": "","hideout_15.name": "Gang hideout #15","hideout_15.desc": "","hideout_16.name": "Gang hideout #16","hideout_16.desc": "","hideout_17.name": "Gang hideout #17","hideout_17.desc": "","hideout_18.name": "Gang hideout #18","hideout_18.desc": "","hideout_19.name": "Gang hideout #19","hideout_19.desc": "","hideout_20.name": "Gang hideout #20","hideout_20.desc": "","hideout_21.name": "Gang hideout #21","hideout_21.desc": "","hideout_22.name": "Gang hideout #22","hideout_22.desc": "","hideout_23.name": "Gang hideout #23","hideout_23.desc": "","hideout_24.name": "Gang hideout #24","hideout_24.desc": "","hideout_25.name": "Gang hideout #25","hideout_25.desc": "","hideout_26.name": "Gang hideout #26","hideout_26.desc": "","hideout_27.name": "Gang hideout #27","hideout_27.desc": "","hideout_28.name": "Gang hideout #28","hideout_28.desc": "","hideout_29.name": "Gang hideout #29","hideout_29.desc": "","hideout_30.name": "Gang hideout #30","hideout_30.desc": "","hideout_31.name": "Gang hideout #31","hideout_31.desc": "","hideout_32.name": "Gang hideout #32","hideout_32.desc": "","plant_alaskan_ginseng_1.name": "Alaskan Ginseng #1","plant_alaskan_ginseng_1.desc": ""}};

    Language.setMenuLanguage();
    if(isChanged)
        Map.addMarkers();

    Menu.refreshMenu();

};

Language.setMenuLanguage = function ()
{
    $.each($('[data-text]'), function (key, value)
    {
        var temp = $(value);
        if(languageData[lang][temp.data('text')] == null) {
            console.error(`[LANG][${lang}]: Text not found: '${temp.data('text')}'`);
        }

        $(temp).text(languageData[lang][temp.data('text')]);
    });

    ///Special cases:
    $('#search').attr("placeholder", languageData[lang]['menu.search_placeholder']);
};