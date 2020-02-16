// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    console.log(data);
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // reorder data based on magnitude so smaller circles are always drawn on top of larger circles
    earthquakeData = earthquakeData.slice().sort((a, b) => d3.descending(a.properties.mag, b.properties.mag));


    // An array which will be used to store created earthquakeMarkers
    var earthquakeMarkers = [];

    // for each feature in the earthquakeData array, add circle to marker array
    earthquakeData.forEach(feature => {
        // coordinates lat/lng, for circle center
        var coord = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
        console.log(feature.properties.mag, feature.properties.place, Date(feature.properties.time));
        // push it to the earthquakeMarkers array
        earthquakeMarkers.push(
            L.circle(coord, {
                fillOpacity: 0.7,
                color: "#563E04",
                weight: 0.7,
                fillColor: c_color(feature.properties.mag),
                // Adjust radius
                radius: feature.properties.mag * 15575
            }).bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
        )
    });

    // Add all the earthquakeMarkers to a new layer group.
    // Now we can handle them as one group instead of referencing each individually
    var markerLayer = L.layerGroup(earthquakeMarkers);

    createMap(markerLayer);

}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Gray Scale": graymap,
        "Dark Map": darkmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -98.71
        ],
        zoom: 5,
        layers: [graymap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    //------------------------------------
    // Set up the legend

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = ['<h4> Magnitude </h4><hr>'];

    // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            labels.push(
                '<i style="background:' + c_color(grades[i] + 0.1) + '"></i> ' +
                '<p>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<hr>' : '+' + '</p>')
            );
        }
        div.innerHTML = labels.join('');
        console.log(div.innerHTML);
    return div;
    
    };
    console.log(c_color(1));
    legend.addTo(myMap);
};

// Color function for feature magnitude
function c_color(mag) { 

    if (mag > 5) {
        return "#B90202";
    } 
    else if (mag > 4) {
        return "#B94702";
    }
    else if (mag > 3) {
        return "#B97C02";
    }
    else if (mag > 2) {
        return "#B9A302";
    }
    else if (mag > 1) {
        return "#92B902";
    }
    else {
        return "#28CA03";
    }
};
