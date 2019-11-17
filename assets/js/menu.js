/**
 * Created by Jean on 2019-10-09.
 */

var Menu = {};

Menu.refreshMenu = function (isFirstLoad = false)
{
    if(isFirstLoad) return;
    var countPlantsType = {};
    var precisePlants = 0;
    var notPrecisePlants = 0;
    var totalMarkersPlants = 0;

    markers.forEach(function(item)
    {
        if(item.sub_data != null)
        {
            if(item.count == null) {
                countPlantsType[item.sub_data] = (countPlantsType[item.sub_data] || 0) + 1;
                notPrecisePlants++;
            }
            else {
                countPlantsType[item.sub_data] = (countPlantsType[item.sub_data] || 0) + parseInt(item.count);
                precisePlants += parseInt(item.count);
            }
            totalMarkersPlants++;
        }
    });

    console.info(`${precisePlants + notPrecisePlants} plants added (${totalMarkersPlants} markers)`);
    console.info(`${precisePlants} precise plants (${totalMarkersPlants - notPrecisePlants} markers)`);
    console.info(`${notPrecisePlants} not precise plants (${notPrecisePlants} markers)`);

    $.each(categories, function (key, value)
    {
        markers.filter(function(item)
        {

            if(!categories.includes(item.icon)){
                console.log(`%c O seu animal, coloca a categoria '${item.icon}' em 'categories' ou o menu não vai funcionar`, 'background: #222; color: #bada55; font-size:20px');
            }

            if(item.icon == value)
            {
                if(item.sub_data == null)
                    return;

                if($(`.menu-hidden[data-type='plants']`).children(`p.collectible[data-type='${item.sub_data}']`).length > 0)
                    return;


                if(!subCategories.includes(item.sub_data)){
                    console.log(`%c O seu animal, coloca a categoria '${item.sub_data}' em 'subCategories' ou o menu não vai funcionar`, 'background: #222; color: #bada55; font-size:20px');
                }


                $(`.menu-hidden[data-type=${value}]`).append(`<p class="collectible" data-type="${item.sub_data}"><span data-text="menu.plant.${item.sub_data}">${Language.get('menu.plant.'+item.sub_data)}</span> <span class="item-count">${countPlantsType[item.sub_data]}</span></p>`);
            }
        });
    });

    //Reorder plants menu alphabetically
    Menu.reorderMenu('.menu-hidden[data-type=plants]');

    //Reorder animals menu alphabetically
    Menu.reorderMenu('.animals');
    Menu.reorderMenu('.birds');

};

Menu.reorderMenu = function (menu) {
    $(menu).children().sort(function(a, b) {
        return a.textContent.localeCompare(b.textContent);
    }).appendTo(menu);
};

Menu.showAll = function() {
    $.each (categoryButtons, function (key, value) {
        $(value).children('span').removeClass("disabled")
    });
    enabledTypes = categories;
    Map.addMarkers();
};

Menu.hideAll = function()
{
    $.each (categoryButtons, function (key, value) {
        $(value).children('span').addClass("disabled")
    });

    enabledTypes = [];
    Map.addMarkers();
};


