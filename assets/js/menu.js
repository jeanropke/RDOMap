/**
 * Created by Jean on 2019-10-09.
 */

var Menu = {};

Menu.refreshMenu = function ()
{
    $.each(categories, function (key, value)
    {
        //$(`.menu-hidden[data-type=${value}]`).children('p.collectible').remove();

        markers.filter(function(item)
        {
            if(item.icon == value)
            {
                if(item.sub_data == null)
                    return;

                if($(`.menu-hidden[data-type='plants']`).children(`p.collectible[data-type='${item.sub_data}']`).length > 0)
                    return;

                if(languageData[lang][item.sub_data] == null){
                    console.error(`[LANG][${lang}]: Text not found: '${item.sub_data}'`);
                }

                if(!subCategories.includes(item.sub_data)){
                    console.log(`%c O seu animal, coloca a categoria '${item.sub_data}' em 'subCategories' ou o menu não vai funcionar`, 'background: #222; color: #bada55; font-size:20px');
                }

                $(`.menu-hidden[data-type=${value}]`).append(`<p class="collectible" data-type="${item.sub_data}">${languageData[lang][item.sub_data]}</p>`);
            }
        });
    });

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


