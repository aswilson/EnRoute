var MapControls = (function() {

var map;
var markers = [];
var lines = [];
var routes = [];
var geocoder= new google.maps.Geocoder();
var directionsService = new google.maps.DirectionsService();
var MapControls = {}; //"object" holding everything public

// non-public helper functions
function map_recenter(latlng,offsetx,offsety) {
    var point1 = map.getProjection().fromLatLngToPoint(
        (latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
    );
    var point2 = new google.maps.Point(
        ( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
        ( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
    );  
    map.setCenter(map.getProjection().fromPointToLatLng(new google.maps.Point(
        point1.x - point2.x,
        point1.y + point2.y
    )));
}
function getPin(pinId) {
  for (var i = 0; i < markers.length; i++) {
      if (marker[i].position.toString().equals(pinId)) {
        return marker[i];
      }
    }
}


//initializes the map
MapControls.initialize = function(mapDivId) {
  var mapStyle =[
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
  ];
  var mapOptions = {
      zoom: 13,
      center: new google.maps.LatLng(40.4397, -79.9764),
      mapTypeControl: false,
      panControl: false,
      rotateControl: false,
      scaleControl: false,
      streetViewControl: false,
      navigationControl: false,
      disableDefaultUI: true,
      styles: mapStyle
    };
    map = new google.maps.Map(document.getElementById(mapDivId), mapOptions);
    //map_recenter(map.getCenter(), 200, 0);
    console.log("initialized map");
  //google.maps.event.addListener(map, 'click', addLatLng);
}

// Takes an address (ex: 1600 Amphitheatre Parkway, Mountain View, CA)
// Returns geolat (ex: {lat: 123, lon: 123})
MapControls.getLatLon = function(addr, callback) {
	console.log("Beginning geocode of address " + addr);
	geocoder.geocode({'address': addr}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			var loc = results[0].geometry.location;
			callback({lat:loc.lat(), lon:loc.lng()});
		} else {
			console.log("Geocode was not successful for the following reason: " + status);
			callback(undefined);
		}
	});
};

// Deletes all markers and lines on the map
MapControls.clearMap = function() {
  for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    for (var j = 0; j < lines.length; j++) {
      lines[j].setMap(null);
    }
    for (var k = 0; k < routes.length; j++) {
      routes[k].setMap(null);
    }
    markers = [];
    lines = [];
    routes = [];
};

// Deletes all lines on the map
MapControls.clearLines = function() {
    for (var j = 0; j < lines.length; j++) {
      lines[j].setMap(null);
    }
    lines = [];
};

// Deletes all routes on the map
MapControls.clearRoutes = function() {
    for (var k = 0; k < routes.length; j++) {
      routes[k].setMap(null);
    }
    routes = [];
};

// Uses all markers on the map so far to center the map
MapControls.recenter = function() {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < markers.length; i++) {
      bounds.extend(marker[i].position);
    }
    map.fitBounds(bounds);
    //map_recenter(map.getCenter(), 100, 0);
};

// Puts a marker with image at the latlng location on the map. I'm just going to use latlon as the id.
//locData = {lat, lon, name, address}
//markerNum = {0-8}
//primary = {true, false}
// If not primary, then secondary, eg. an alternate option
// Categories - line 7
MapControls.placePin = function(locData, markerNum, primary, category) {
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng(locData.lat,locData.lon)
  });
  var icon;
  if (primary) {
    icon = {
        url: "pin-normal-" + markerNum + ".png",
        scaledSize: new google.maps.Size(22, 41),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(11, 41)
      };
  } else {
    icon = {
        url: "pin-normal2-" + markerNum + ".png",
        scaledSize: new google.maps.Size(16, 30),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(8,30)
      };
  }
  marker.setIcon(icon);
  var html = '<div class="pin-popover">\
    <table class="table-container">\
        <tr>\
            <td><img id="popover-icon" src="category-blue1-coffee.png" width="35px" height="35px"/></td>\
            <td><div id="popover-category" class="row-text">Coffee</div></td>\
        </tr>\
        <tr>\
            <td></td>\
            <td><div id="popover-name" class="row-text-2">Starbucks</div></td>\
        </tr>\
        <tr>\
            <td></td>\
            <td><div id="popover-address-1" class="row-text-2">Address</div></td>\
        </tr>\
        <tr>\
            <td></td>\
            <td><div id="popover-address-2" class="row-text-2">Pittsburgh, PA 15219</div></td>\
        </tr>\
    </table>\
  </div>';

  var infoboxOptions = {
     content: html,
     boxStyle: { 
        width: "226px",
        height: "151px",
        backgroundColor: "#808080"
     },
     infoBoxClearance: new google.maps.Size(1, 1)
  };
  var infobox = new InfoBox(infoboxOptions);
  marker.setMap(map);
  markers.push(marker);
  google.maps.event.addListener(map, 'click', function() {
       infobox.setMap(null);
  });
  google.maps.event.addListener(marker, 'click', function() {
    infobox.open(map,marker);
  });
  google.maps.event.addListener(map, "click", function(event) {
    infobox.close();
  });
  return marker.position.toString();
};

// Iterates through pins to find the one we're deleting
// Inefficient - use sparingly
MapControls.removePin = function(pinId) {
  for (var i = 0; i < markers.length; i++) {
      if (marker[i].position.toString().equals(pinId)) {
        markers.splice(i, 1);
      }
    }
};

// Color is string in hash format. ex. '#FF0000' '#666666'
// Adds a straight line between the pins
MapControls.addLine = function(pinId1, pinId2, color) {
  var pathCoordinates = [
      getPin(pinId1).position,
      getPin(pinId2).position
    ];
    var path = new google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    path.setMap(map);
    lines.push(path);
    return path; //Who knows what this would end up being :/ hope it's an id tho.
};

// Color is string in hash format. ex. '#FF0000' '#666666'
// Adds the shortest path between the two pins
MapControls.drawRoute = function(pinId1, pinId2, color) {
  var request = {
      origin: getPin(pinId1).position,
      destination: getPin(pinId2).position,
      travelMode: google.maps.TravelMode.DRIVING
    };
    var directionsDisplay = new google.maps.DirectionsRenderer({
      polylineOptions: {
          strokeColor: color
      }
    });
    directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(result);
      }
    });
    directionsDisplay.setMap(map);
    routes.push(directionsDisplay);
};

return MapControls;
})();

 /*    USED FOR TESTING MARKERS AND INFOWINDOWS
//Handles click events on a map, and adds a new point to the Polyline.
//  @param {google.maps.MouseEvent} event
function addLatLng(event) {
  var poly;
  if (lines.length == 0) {
    poly = new google.maps.Polyline({
      geodesic: true,
      strokeColor: '#00FF00',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    lines.push(poly);
  } else {
    poly = lines[0];
  }
  var path = poly.getPath();

  // Because path is an MVCArray, we can simply append a new coordinate
  // and it will automatically appear.
  path.push(event.latLng);
  poly.setMap(map);

  var marker = new google.maps.Marker({
      position: event.latLng
  });
  var icon;
  var primary = true;
  var markerNum = 0;
  if (primary) {
    icon = {
        url: "pin-normal-" + markerNum + ".png",
        scaledSize: new google.maps.Size(22, 41),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(11, 41)
      };
  } else {
    icon = {
        url: "pin-normal2-" + markerNum + ".png",
        scaledSize: new google.maps.Size(16, 30),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(8,30)
      };
  }
  marker.setIcon(icon);
  var html = '<div class="pin-popover">\
    <table class="table-container">\
        <tr>\
            <td><img id="popover-icon" src="category-blue1-coffee.png" width="35px" height="35px"/></td>\
            <td><div id="popover-category" class="row-text">Coffee</div></td>\
        </tr>\
        <tr>\
            <td></td>\
            <td><div id="popover-name" class="row-text-2">Starbucks</div></td>\
        </tr>\
        <tr>\
            <td></td>\
            <td><div id="popover-address-1" class="row-text-2">Address</div></td>\
        </tr>\
        <tr>\
            <td></td>\
            <td><div id="popover-address-2" class="row-text-2">Pittsburgh, PA 15219</div></td>\
        </tr>\
    </table>\
  </div>';

  var infoboxOptions = {
     content: html,
     boxStyle: { 
        width: "226px",
        height: "131px",
        backgroundColor: "#808080"
     },
     infoBoxClearance: new google.maps.Size(1, 1)
  };
  var infobox = new InfoBox(infoboxOptions);
  marker.setMap(map);
  markers.push(marker);
  google.maps.event.addListener(map, 'click', function() {
       infobox.setMap(null);
  });
  google.maps.event.addListener(marker, 'click', function() {
    infobox.open(map,marker);
  });
  google.maps.event.addListener(map, "click", function(event) {
    infobox.close();
  });
}
*/
