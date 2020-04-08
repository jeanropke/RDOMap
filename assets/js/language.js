/**
 * Created by Jean on 2019-10-09.
 */

var Language = {
    availableLanguages: ['en', 'af', 'ar', 'ca', 'cs', 'da', 'de', 'el', 'en-GB', 'es', 'fi', 'fr', 'he', 'hu', 'it', 'ja', 'ko', 'no', 'pl', 'pt', 'pt-BR', 'ro', 'ru', 'sr', 'sv', 'th', 'tr', 'uk', 'vi', 'zh-Hans', 'zh-Hant'],

    get: function (value) {
        if (Settings.language == null)
            Settings.language = 'en';

        if (Language.data[Settings.language] !== undefined && Language.data[Settings.language][value])
            return Language.data[Settings.language][value];
        else if (Language.data['en'][value])
            return Language.data['en'][value];
        else if (Settings.isDebugEnabled)
            return value;
        else
            return '';
    },

    setMenuLanguage: function () {
        var hasUntranslated = false;

        Language.availableLanguages.forEach(language => {
            if (Language.data[language] === undefined || Language.data[language] === null || $.isEmptyObject(Language.data[language])) {
                hasUntranslated = true;
                $(`#language option[value="${language}"]`).attr('disabled', 'disabled').insertAfter($("#language option:last"));
            }
        });

        if (hasUntranslated && $('#language option:contains(-- Untranslated languages --)').length === 0) {
            $('<option>').text('-- Untranslated languages --').attr('disabled', 'disabled').insertAfter($("#language option:enabled:last"));
        }

        $.each($('[data-text]'), function (key, value) {
            var temp = $(value);
            var string = Language.get(temp.data('text'));

            if (string == '') return;

            $(temp).text(string);
        });

        // Special cases:
        $('#search').attr("placeholder", Language.get('menu.search_placeholder'));

        $('.leaflet-control-layers-list span').each(function (key, value) {
            var element = $(value);

            switch (key) {
                case 0:
                    element.text(' ' + Language.get('map.layers.default'));
                    break;
                case 1:
                    element.text(' ' + Language.get('map.layers.detailed'));
                    break;
                case 2:
                    element.text(' ' + Language.get('map.layers.dark'));
                    break;
                default:
                    break;
            }
        });
    },

    // A helper function to "compile" all language files into a single JSON file.
    getLanguageJson: function () {
        var object = {};

        // Loop through all available languages and try to retrieve both the `menu.json` and `item.json` files.
        this.availableLanguages.forEach(language => {
            try {
                // Menu language strings.
                $.ajax({
                    url: `./langs/menu/${language.replace('-', '_')}.json`,
                    dataType: 'json',
                    async: false,
                    success: function (json) {
                        var result = {};

                        for (var propName in json) {
                            if (json[propName] !== "" && ($.isEmptyObject(object['en']) || object['en'][propName] !== json[propName])) {
                                result[propName] = json[propName];
                            }
                        }

                        if (!$.isEmptyObject(result)) {
                            object[language] = result;
                        }
                    }
                });
            } catch (error) {
                // Do nothing for this language in case of a 404-error.
                return;
            }
        });

        // Download the object to a `language.json` file.
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(object)));
        element.setAttribute('download', 'language.json');

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }
};
