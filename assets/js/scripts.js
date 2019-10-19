var map;
var markers = [];
var markersLayer = new L.LayerGroup();
var ciLayer = L.canvasIconLayer({});
var ciMarkers = [];

var searchTerms = [];
var visibleMarkers = [];
var resetMarkersDaily;
var disableMarkers = [];
var categories = [
    'campfires', 'plants', 'hideouts'
];
var enabledTypes = categories;
var categoryButtons = document.getElementsByClassName("menu-option clickable");

var iconColors = [];

var showCoordinates = false;

var avaliableLanguages = ['en-us'];
var lang;
var languageData = [];

var nocache = 20;


function init()
{

    iconColors['campfires'] = '#f49630';
    iconColors['hideouts'] = '#cb0200';
    iconColors['plants'] = '#72b026';


    if(typeof Cookies.get('removed-items') === 'undefined')
        Cookies.set('removed-items', '', { expires: resetMarkersDaily ? 1 : 999});

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

    if(typeof Cookies.get('removed-markers-daily') === 'undefined')
        Cookies.set('removed-markers-daily', 'true', 999);

    resetMarkersDaily = Cookies.get('removed-markers-daily') == 'true';
    $("#reset-markers").val(resetMarkersDaily.toString());

    var curDate = new Date();
    date = `${curDate.getUTCFullYear()}-${curDate.getUTCMonth()+1}-${curDate.getUTCDate()}`;

    lang = Cookies.get('language');
    $("#language").val(lang);

    disableMarkers = Cookies.get('removed-items').split(';');

    Language.load();
    Map.init();

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
function setCurrentDayCycle()
{
    //day1: 2 4 6
    //day2: 0 3
    //day3: 1 5

    var weekDay = new Date().getUTCDay();
    switch(weekDay)
    {
        case 2: //tuesday
        case 4: //thursday
        case 6: //saturday
            day = 1;
            break;

        case 0: //sunday
        case 3: //wednesday
            day = 2;
            break;

        case 1: //monday
        case 5: //friday
            day = 3;
            break;
    }

    $('#day').val(day);

    //Cookie day not exists? create
    if(typeof Cookies.get('date') === 'undefined')
    {
        Cookies.set('date', date, { expires: 2 });
    }
    //if exists, remove markers if the days arent the same
    else
    {
        if(Cookies.get('date') != date.toString())
        {
            Cookies.set('date', date, { expires: 2 });
            if(resetMarkersDaily)
            {
                Cookies.set('removed-items', '', {expires: 1});
                disableMarkers = [];
            }
        }
    }
}

function changeCursor()
{
    if(showCoordinates)
        $('.leaflet-grab').css('cursor', 'pointer!important');
    else
        $('.leaflet-grab').css('cursor', 'grab');
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
    Map.addMarkers();
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
    menu.children('span').toggleClass('disabled');

    if(menu.children('span').hasClass('disabled'))
    {
        enabledTypes = $.grep(enabledTypes, function(value) {
            return value != menu.data('type');
        });
    }
    else
    {
        enabledTypes.push(menu.data('type'));
    }
    Map.addMarkers();
    if($("#routes").val() == 1)
        Map.drawLines();
});

$('.open-submenu').on('click', function(e) {
    e.stopPropagation();
    $(this).parent().parent().children('.menu-hidden').toggleClass('opened');
});

$(document).on('click', '.collectible', function(){
    var collectible = $(this);
    collectible.toggleClass('disabled');

    Map.removeItemFromMap(collectible.data('type'));

    if($("#routes").val() == 1)
        Map.drawLines();
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
    $('.timer-container').toggleClass('timer-menu-opened');
    $('.counter-container').toggleClass('counter-menu-opened');

});

