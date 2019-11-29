var map;
var markers = [];
var markersLayer = new L.LayerGroup();
var ciLayer = L.canvasIconLayer({zoomAnimation: true});
var ciMarkers = [];

var heatmapLayer;


var searchTerms = [];
var visibleMarkers = [];

var categories = [
    'ambush', 'boats', 'campfires', 'defend_campsite', 'escort', 'hideouts', 'plants', 'rescue'
];

var subCategories = [
    'alaskan_ginseng', 'american_ginseng', 'bay_bolete', 'blackberry', 'black_currant', 'burdock_root', 'chanterelle',
    'common_bullbrush', 'creeping_thyme', 'desert_sage', 'english_mace', 'evergreen_huckleberry', 'golden_currant',
    'hummingbird_sage', 'milkweed', 'parasol_mushroom', 'oleander_sage', 'oregano', 'prairie_poppy', 'raspberry',
    'rams_head', 'red_sage', 'indian_tobacco', 'vanilla_flower', 'violet_snowdrop', 'wild_feverfew', 'wild_mint',
    'wintergreen_berry', 'yarrow', 'wild_carrot'
];
var enabledTypes = categories;

var categoryButtons = document.getElementsByClassName("menu-option clickable");

var showCoordinates = false;

var avaliableLanguages = ['en-us', 'es-es', 'fr-fr', 'pt-br', 'ru', 'zh-s'];
var lang;

var nocache = 29;

var debug = 'none'; //addMarker or addHeatmap or addPlant
var heatmapCount = 10;

var firstLoad = true;

function init()
{
    enabledTypes.splice.apply(enabledTypes, [2, 0].concat(subCategories));

    if(typeof Cookies.get('map-layer') === 'undefined')
        Cookies.set('map-layer', 'Detailed', { expires: 999 });

    if(typeof Cookies.get('language') === 'undefined')
    {
        if(avaliableLanguages.includes(navigator.language.toLowerCase()))
            Cookies.set('language', navigator.language.toLowerCase());
        else
            Cookies.set('language', 'en-us');
    }

    if(!avaliableLanguages.includes(Cookies.get('language')))
        Cookies.set('language', 'en-us');


    lang = Cookies.get('language');
    $("#language").val(lang);

    setMapBackground(Cookies.get('map-layer'));
}

function setMapBackground(mapName){
    switch(mapName) {
        default:
        case 'Default':
            $('#map').css('background-color', '#d2b790');
            break;

        case 'Detailed':
            $('#map').css('background-color', '#d2b790');
            break;

        case 'Dark':
            $('#map').css('background-color', '#3d3d3d');
            break;
    }

    Cookies.set('map-layer', mapName, { expires: 999 });
}

function changeCursor()
{
    if(showCoordinates)
        $('#map').css('cursor', 'pointer');
    else
        $('#map').css('cursor', 'grab');
}


$("#search").on("input", function()
{
    searchTerms = [];
    $.each($('#search').val().split(';'), function(key, value)
    {
        if($.inArray(value.trim(), searchTerms) == -1)
        {
            if(value.length > 0)
                searchTerms.push(value.trim());
        }
    });
    MapBase.addMarkers();
});

$('#show-coordinates').on('change', function()
{
    showCoordinates = $('#show-coordinates').val() == '1';
    changeCursor();
});

$("#language").on("change", function()
{
    lang = $("#language").val();
    Cookies.set('language', lang);
    Language.load(true);
});

$('.menu-option.clickable').on('click', function ()
{
    var menu = $(this);

    if(menu.data('type') == 'plants')
    {
        if(enabledTypes.some(r=> subCategories.includes(r)))
        {
            $.each(subCategories, function (key, value) {
                $(`.collectible[data-type=${value}]`).addClass('disabled');
                enabledTypes = $.grep(enabledTypes, function (plantCat) {
                    return plantCat != value;
                });
            });
        }
        else {
            $.each(subCategories, function (key, value) {
                $(`.collectible[data-type=${value}]`).removeClass('disabled');
                enabledTypes.splice.apply(enabledTypes, [2, 0].concat(subCategories));
            });
        }
    }
    else {
        menu.children('span').toggleClass('disabled');

        if (menu.children('span').hasClass('disabled')) {
            enabledTypes = $.grep(enabledTypes, function (value) {
                return value != menu.data('type');
            });
        }
        else {
            enabledTypes.push(menu.data('type'));
        }
    }
    MapBase.addMarkers();
});

$(document).on('click', '.menu-option.animal-clickable', function(){
    var menu = $(this);
    $('.menu-option.animal-clickable').each(function (key, value)
    {
        if(menu.data('type') != $(value).data('type'))
            $(value).children('span').addClass('disabled');
    });

    menu.children('span').toggleClass('disabled');
    if(menu.children('span').hasClass('disabled'))
    {
        MapBase.removeHeatmap();
    }
    else
    {
        MapBase.setHeatmap(menu.data('type'), menu.parent().parent().data('type'));
    }

});

$('.open-submenu').on('click', function(e) {
    e.stopPropagation();
    $(this).parent().parent().children('.menu-hidden').toggleClass('opened');
});

$(document).on('click', '.collectible', function(){
    var collectible = $(this);
    collectible.toggleClass('disabled');

    MapBase.removeItemFromMap(collectible.data('type'));

});

$('.menu-toggle').on('click', function()
{
    $('.side-menu').toggleClass('menu-opened');

    if($('.side-menu').hasClass('menu-opened'))
    {
        $('.menu-toggle').text('X');
    }
    else
    {
        $('.menu-toggle').text('>');
    }
});

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("DOMContentLoaded", MapBase.init);
window.addEventListener("DOMContentLoaded", Language.load);
window.addEventListener("DOMContentLoaded", Heatmap.load);
