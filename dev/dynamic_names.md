Snippet to quickly format pardata:

    <script>
        var ambush = [];
        var result = {};
        ambush.forEach((key, value) => {
            var string1 = "";
            key.Descriptors.forEach((keyD1, valueD1) => {
                if (keyD1.Type != "ID") return;
                string1 = keyD1.Name;
            });

            key.Children.forEach((keyC1, valueC1) => {
                if (keyC1.Name != "MISSION_GIVERS") return;

                keyC1.Children[0].Descriptors.forEach((keyC2, valueC2) => {
                    if (keyC2.Type != "SPAWN_POSITION") return;

                    result[string1] = {
                        x: (0.01552 * keyC2.Coordinate.Y + -63.6).toFixed(4).toString(),
                        y: (0.01552 * keyC2.Coordinate.X + 111.29).toFixed(4).toString()
                    };
                });
            });
        });
        console.log(JSON.stringify(result, null, 4));
    </script>

Snippet to format animal spawns:

    <script>
        // Secret sauce. Not really, but the source is >100MB of text, so not really feasable to include.
        var data = [];

        // Target, unordered, object.
        var result = {};

        data.forEach((val, ind) => {
            // Skip items that aren't animals.
            if (!val.model || val.model.indexOf("ANIMAL") === -1) return;

            // Skip items that are "scenario points" instead of spawns.
            if (val.flags && val.flags.indexOf("NoSpawn") !== -1) return;

            // Skip items we don't really want/need.
            if (val.model.indexOf("DOG") !== -1) return;
            if (val.model.indexOf("HORSE") !== -1) return;
            if (val.model.indexOf("_POISON") !== -1) return;
            if (val.model.indexOf("_SPIRIT") !== -1) return;

            // Bit of consistency.
            var thisModel = val.model.replace("ANIMALS_", "").replace("ANIMAL_", "");
            if (result[thisModel] === undefined) result[thisModel] = [];

            // Reduce ALLIGATOR spam.
            if (thisModel === "ALLIGATOR" || thisModel === "ALLIGATOR_SML") {
                if (val.flags && val.flags.indexOf("InWater") !== -1) return;
            }

            // Prevent massively inflated file size.
            delete val.model;
            delete val.scenario;
            delete val.flags;

            // No need for this if both a "0".
            if (val.start === "0" && val.end === "0") {
                delete val.start;
                delete val.end;
            }

            // Convert coordinates.
            var thisX = val.x;
            var thisY = val.y;

            val.x = (0.01552 * thisY + -63.6).toFixed(4).toString();
            val.y = (0.01552 * thisX + 111.29).toFixed(4).toString();

            result[thisModel].push(val);
        });

        // Order by key.
        var ordered = {};
        Object.keys(result).sort().forEach(function (key) {
            ordered[key] = result[key];
        });

        // Print.
        console.log(JSON.stringify(ordered, null, 2));
    </script>