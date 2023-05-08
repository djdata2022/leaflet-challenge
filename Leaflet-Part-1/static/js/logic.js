

// Create the map object
var myMap = L.map("map", {
  center: [
    20, 0
  ],
  zoom: 2, // Adjust zoom to see most of the points across the world
  //layers: [street, earthquakes]
});

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Store our API endpoint as queryUrl - Past 7 Days M1.0+ Earthquakes
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_week.geojson";

// Markers should reflect the depth of the earthquake by color
// Earthquakes with greater depth should appear darker in color -
// Define function to determine color based on depth
function chooseColor(depth) {
  if (depth > 300) return "darkred";
  else if (depth > 250) return "brown";
  else if (depth > 200) return "chocolate";
  else if (depth > 150) return "darkorange";
  else if (depth > 100) return "gold";
  else if (depth > 50) return "khaki";
  else return "lightyellow";
}

// Markers should reflect the magnitude of the earthquake by their size
// Earthquakes with higher magnitudes should appear larger -
// Define function to determine size of marker based on magnitude of earthquake
function chooseRadius(magnitude) {
  return magnitude * 2;
}

// Use d3 to access data 
d3.json(queryUrl).then(function (data) {
  console.log(data);
  let featuresArray = data.features;

  // For study only: Alternate approach (not used) to using geoJSON:
  // let propertArray = currentFeature.properties; // contains magnitude as mag
  // for (let i=0; i<featuresArray.length; i++){
  //   let currentFeature=featuresArray[i];
  //   let coordinates = currentFeature.geometry.coordinates; // long, lat, depth
  //   let marker = L.marker([coordiates[1], coordinates[2]]);
  //   marker.addTo(myMap);
  // }

  //Use GeoJSON Leaflet function to plot and pointToLayer to add marker

  L.geoJson(data, {
    // Include popups that provide additional info when marker is clicked
    onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.title); // Shows "title" info on popup
    },
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, {
        radius: chooseRadius(feature.properties.mag), // pulls mag (magnitude) data to determine marker size
        fillColor: chooseColor(feature.geometry.coordinates[2]), // pulls depth data to determine marker color
        color: 'black', //color of circle around marker
        weight: .6, //weight of circle around marker
        fillOpacity: .6 // transparency of circular marker
      })
    }
  }).addTo(myMap);

  // Create legend 
  // First explain relation of size and color to magnitude and depth
  L.control.attribution({
    position: "bottomright", 
    prefix: "<b><li>Size of marker increases with increasing earthquake magnitude</li><li>Color of marker darkens with increasing earthquake depth</li></b>"
  }).addTo(myMap);
  // Next provide colors and corresponding depths
  var legend = L.control({ position: "topright" });
  legend.onAdd = function(legend) {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0, 51, 101, 151, 201, 251, 301];
    var limit_descr = ['0-50km', '51-100km', '101-150km', '151-200km', '201-250km', '251-300km', '300+km'];
    var labels = [];
    // With the forEach function, map colors from chooseColor function to depths in limit_desc array
    limits.forEach(function (limit, index) {
      var color = chooseColor(limit);
      labels.push("<li class=\"legend-div\" style=\"background-color: " + color + "\">" + limit_descr[index] + "</li>");
    })
    div.innerHTML = "<ul>" + labels.join("") + "</ul>";
    return div;
  };
  legend.addTo(myMap);
  
});