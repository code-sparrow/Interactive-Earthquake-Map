// Store our API endpoint inside queryUrl
var queryUrlHour = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
var queryUrlDay = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var queryUrlWeek = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var queryUrlMonth = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var faultUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL

d3.json(queryUrlHour, function(dataHour) {
    d3.json(queryUrlDay, function(dataDay) {
        d3.json(queryUrlWeek, function(dataWeek) {
            d3.json(queryUrlMonth, function(dataMonth) {
                d3.json(faultUrl, function(dataFault) {
                    var data = [dataHour.features, dataDay.features, dataWeek.features, dataMonth.features];
                    //console.log(data);
                    createFeatures(data, dataFault.features);
                });
            });
        });
    });
});

function createFeatures(earthquakeData, faultData) {
    // reorder data based on magnitude so smaller circles are always drawn on top of larger circles
    newEQData = [];
    earthquakeData.forEach(span => {
        newEQData.push(
        span.slice().sort((a, b) => d3.descending(a.properties.mag, b.properties.mag))
        )
    });
    //console.log(newEQData);
    // An array which will be used to store created earthquakeMarkers
    var earthquakeMarkers = [];
    
    var faultMarkers = [];

    // for each feature in the earthquakeData array, add circle to marker array
    newEQData.forEach(span => {
        var eqMarkTemp = [];
        span.forEach(feature => {
            var coord = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];
            eqMarkTemp.push(
                L.circle(coord, {
                    fillOpacity: 0.65,
                    color: "#563E04",
                    weight: 0.7,
                    fillColor: c_color(feature.properties.mag),
                    // Adjust radius
                    radius: feature.properties.mag * 50000
                }).bindPopup(`<h3>${feature.properties.place}</h3><hr>
                <p>${new Date(feature.properties.time)}</p><hr>
                <p><b>Magnitude: &nbsp </b> ${feature.properties.mag}</p>`)
            )
        })
        earthquakeMarkers.push(eqMarkTemp);
    });

    //console.log(earthquakeMarkers);

    faultData.forEach(feature => {

        //Coordinate pairs from GeoJSON were not consistent with leaflet
        //and had to be flipped (as in the earthquakeData)
        var line = [];
        feature.geometry.coordinates.forEach(pair => {
            line.push([pair[1], pair[0]])});
        //console.log(feature.properties.name);
        faultMarkers.push(
            L.polyline(line, {
                color: "yellow"
            }).bindTooltip(`<h4>Boundry Name</h4><hr>
            <h5>${feature.properties.Name}</h5>`, {className: "toolTipPopup"})
        );
    });

    // Add all the earthquakeMarkers to a new layer group.
    // Now we can handle them as one group instead of referencing each individually
    var markerLayer = [];
    earthquakeMarkers.forEach(span => {
        markerLayer.push(L.layerGroup(span));
    });
    console.log(markerLayer);
    //var markerLayer = L.layerGroup(earthquakeMarkers);
    var markerLayer2 = L.layerGroup(faultMarkers);

    createMap(markerLayer, markerLayer2);

}

function createMap(earthquakes, faults) {
    // Define basemap tile layers
    var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/light-v10",
        accessToken: API_KEY
    });

    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/dark-v10",
        accessToken: API_KEY
    });

    var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        minZoom: 1,
        maxZoom: 16,
        ext: 'jpg'
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Gray-Scale Map": graymap,
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Watercolor Map": watercolor
    };

    // Create overlay object to hold our overlay layer
    //var overlayMaps = {
    //   Faults: faults
    //};



    var groupedOverlays = {
        "Time Span": {
            "Past Hour": earthquakes[0],
            "Past Day": earthquakes[1],
            "Past Week": earthquakes[2],
            "Past Month": earthquakes[3]
        }
    };
    var options = {
        // Make the "Time Span" group exclusive (use radio inputs)
        exclusiveGroups: ["Time Span"],
        // Show a checkbox next to non-exclusive group labels for toggling all
        groupCheckboxes: true,
        collapsed: false
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -98.71
        ],
        zoom: 4,
        // fault and earthquake overlays checked by default
        layers: [graymap, faults, earthquakes[2]]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    // L.control.layers(baseMaps, overlayMaps, {
    //     collapsed: false
    // }).addTo(myMap);

    var layerControl = L.control.groupedLayers(baseMaps, groupedOverlays, options);
    layerControl.addOverlay(faults, "Faults");
    myMap.addControl(layerControl);


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
        //add fault line to legend
        labels.push('<hr><h4>Fault Lines</h4><hr color="yellow" width="60%" size="5px">');
        div.innerHTML = labels.join('');
        console.log(div.innerHTML);
    return div;
    
    };
    console.log(c_color(1));
    legend.addTo(myMap);
};

//--------------------------------------------------------
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

// //-----------------------------------------------
// const buttons = d3.selectAll('input');
// buttons.on('change', function(d) {
//     if (this.value === "hour") {
//         queryData(queryUrlHour, faultUrl);
//     } 
//     else if (this.value === "day") {
//         queryData(queryUrlDay, faultUrl);
//     }
//     else if (this.value === "month") {
//         queryData(queryUrlMonth, faultUrl);
//     }
//     else {
//         queryData(queryUrlWeek, faultUrl);
//     }
    
// });

