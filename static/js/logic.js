// Store our API endpoing as queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


// Perform a GET request to the query URL
d3.json(queryURL).then(function(data){
    createFeatures(data.features);
  });
    

function createFeatures(earthquakeData, platesData){

    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object for the colors and radius size
    function createCircleMarker(feature, latlng){
      console.log(feature.geometry.coordinates[1]);
       let options = {
        radius:feature.properties.mag*4,
        fillColor: chooseColor(feature.geometry.coordinates[1]),
        color: "black",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 1
       } 
       return L.circleMarker(latlng,options);
    }
  
    // Create a variable for earthquakes to house latlng, each feature for popup, and cicrle radius/color/weight/opacity
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Send earthquakes layer to the createMap function - will start creating the map and add features
    createMap(earthquakes);
}

// Create an if function for the colors
function chooseColor(depths){
    
        if (-10 <= depths && depths <= 10)
            return "lightgreen";
        else if (10 <= depths && depths <=30)
            return "yellowgreen";
        else if (30 <= depths && depths <=50)
            return "gold";
        else if (50 <= depths && depths <= 70)
            return "orange";
        else if (70<= depths && depths <=90)
            return "lightsalmon";
        else
            return "tomato";
    
}

// Create map legend to provide context for map
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [-10, 10, 30, 50, 70, 90];
    var labels = []

    // go through each magnitude item to label and color the legend
    // push to labels array as list item
    for (var i = 0; i < grades.length; i++) {
          labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
        }

      // add each label list item to the div under the <ul> tag
      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };


// Create map
function createMap(earthquakes) {
   // Define outdoors and graymap layers
   let streetstylemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

  let graymap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Outdoors": streetstylemap,
    "Grayscale": graymap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  let myMap = L.map("map", {
    center: [
      39.8282, -98.5795
    ],
    zoom: 3,
    layers: [streetstylemap, earthquakes]
  });
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  legend.addTo(myMap);
}