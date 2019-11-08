/**
 * Created by Jean on 2019-10-09.
 */

var Menu = {};

Menu.refreshMenu = function ()
{
    var countPlantsType = {};
    var allPlantsCounter = 0;
    markers.forEach(function(item)
    {
        if(item.sub_data != null)
        {
            if(item.count == null) {
                countPlantsType[item.sub_data] = (countPlantsType[item.sub_data] || 0) + 1;
                allPlantsCounter++;
            }
            else {
                countPlantsType[item.sub_data] = (countPlantsType[item.sub_data] || 0) + parseInt(item.count);
                allPlantsCounter += parseInt(item.count);
            }
        }
    });

    console.info(`${allPlantsCounter} plants added`);

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


                if(!item.text.includes(item.sub_data)){
                    console.log(`%c '${item.text}' está na categoria '${item.sub_data}'`, 'background: #222; color: #bada55; font-size:20px');
                }


                if($(`.menu-hidden[data-type='plants']`).children(`p.collectible[data-type='${item.sub_data}']`).length > 0)
                    return;

                if(languageData[lang]['menu.plant.'+item.sub_data] == null){
                    console.error(`[LANG][${lang}]: Text not found: 'menu.plant.${item.sub_data}'`);
                }

                if(!subCategories.includes(item.sub_data)){
                    console.log(`%c O seu animal, coloca a categoria '${item.sub_data}' em 'subCategories' ou o menu não vai funcionar`, 'background: #222; color: #bada55; font-size:20px');
                }


                $(`.menu-hidden[data-type=${value}]`).append(`<p class="collectible" data-type="${item.sub_data}"><span data-text="menu.plant.${item.sub_data}">${languageData[lang]['menu.plant.'+item.sub_data]}</span> <span class="item-count">${countPlantsType[item.sub_data]}</span></p>`);
            }
        });
    });


    //Reorder plants menu alphabetically
    Menu.reorderMenu('.menu-hidden[data-type=plants]');

    //Reorder animals menu alphabetically
    Menu.reorderMenu('.menu-two-column');

};

Menu.reorderMenu = function (menu) {
    $(menu).children().sort(function(a, b) {
        if (a.textContent < b.textContent) {
            return -1;
        } else {
            return 1;
        }
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


