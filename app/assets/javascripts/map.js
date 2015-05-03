var MapControls = (function() {
var map = undefined;
var geocoder= new google.maps.Geocoder();
var directionsService = new google.maps.DirectionsService();
var markers = [];
var lines = [];
var routes = [];
var curInfoBox = undefined;		//if one is open, this tracks it so we can close it

// non-public helper functions
function map_recenter(latlng,offsetx,offsety) {
	if (map==undefined) { console.log("MapControls not initialized"); return; }
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
	if (map==undefined) { console.log("MapControls not initialized"); return; }
	for (var i = 0; i < markers.length; i++) {
		if (markers[i].position.toString() === pinId)
		return markers[i];
	}
}
function closeInfoboxes() {
	if (curInfoBox != undefined)
		curInfoBox.close();
}


var MapControls = {}; //"object" holding everything public


//initializes the map
MapControls.initialize = function(mapDivId) {
  var mapStyle =[ {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    } ];
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
	google.maps.event.addListener(map, "click", function(event) {
		closeInfoboxes();
	});
    console.log("initialized map");
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

// Takes a list of stops (in the form {lat,lon}) and, asynchroneously, returns the directions to follow
// Return result is of the given here: https://developers.google.com/maps/documentation/directions/#DirectionsResponses
MapControls.getDirections = function(stops, callback) {
	//build request
	var request = {
	  waypoints: [],
	  travelMode: google.maps.TravelMode.DRIVING
	};
	for (var i=0; i<stops.length; i++) {
		var loc = new google.maps.LatLng(stops[i].lat,stops[i].lon);
		if (i==0)
			request.origin = loc;
		else if (i==(stops.length-1))
			request.destination = loc;
		else
			request.waypoints.push({location:loc, stopover:true});
	}
	//request the directions
	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			callback(result);
		} else {
			console.log( "MapControls.getDirections() failed: " + status);
			callback(undefined);
		}
	});
};

// Deletes all markers and lines on the map
MapControls.clearMap = function() {
	if (map==undefined) { console.log("MapControls not initialized"); return; }
	closeInfoboxes();
	for (var i = 0; i < markers.length; i++)
      markers[i].setMap(null);
    for (var j = 0; j < lines.length; j++)
      lines[j].setMap(null);
    for (var k = 0; k < routes.length; k++)
      routes[k].setMap(null);
    markers = [];
    lines = [];
    routes = [];
};

// Deletes all lines on the map
MapControls.clearLines = function() {
    if (map==undefined) { console.log("MapControls not initialized"); return; }
	for (var j = 0; j < lines.length; j++)
      lines[j].setMap(null);
    lines = [];
};

// Deletes all routes on the map
MapControls.clearRoutes = function() {
    if (map==undefined) { console.log("MapControls not initialized"); return; }
	for (var k = 0; k < routes.length; j++)
      routes[k].setMap(null);
    routes = [];
};

// Uses all markers on the map so far to center the map
MapControls.recenter = function() {
	if (map==undefined) { console.log("MapControls not initialized"); return; }
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < markers.length; i++)
		bounds.extend(markers[i].position);
	map.fitBounds(bounds);
	//map_recenter(map.getCenter(), 100, 0);
};

// Puts a marker with image at the latlng location on the map
//locData = {lat, lon, name, address}
//markerNum = {0-8}
//primary = {true, false} - indicates whether to show a faded or dark pin
// If not primary, then secondary, eg. an alternate option
// popupContents - html to go in infobox
MapControls.placePin = function(locData, markerNum, primary, popupContents) {
  if (map==undefined) { console.log("MapControls not initialized"); return; }
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng(locData.lat,locData.lon)
  });
  var pinImgName = (markerNum<8 ? ""+(markerNum+1) : "blank");
  var icon;
  if (primary) {
    icon = {
        url: "/assets/pin-normal-" + pinImgName + ".png",
        scaledSize: new google.maps.Size(22, 41),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(11, 41)
      };
  } else {
    icon = {
        url: "/assets/pin-faded2-" + pinImgName + ".png",
        scaledSize: new google.maps.Size(16, 30),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(8,30)
      };
  }
  marker.setIcon(icon);
  var infoboxOptions = {
     content: popupContents,
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
  google.maps.event.addListener(marker, 'click', function() {
	closeInfoboxes();
    curInfoBox = infobox;
    infobox.open(map, marker);
  });
  return marker.position.toString();
};

// Iterates through pins to find the one we're deleting
// Inefficient - use sparingly
MapControls.removePin = function(pinId) {
	if (map==undefined) { console.log("MapControls not initialized"); return; }
	for (var i=0; i<markers.length; i++) {
		if (markers[i].position.toString() === pinId) {
			markers[i].setMap(null);
			markers.splice(i, 1);
		}
	}
};

// Adds a straight line between the pins
//   Color is string in hash format. ex. '#FF0000' '#666666'
MapControls.addLine = function(pinId1, pinId2, color) {
  if (map==undefined) { console.log("MapControls not initialized"); return; }
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
// Adds the shortest path between the two locations {name, addr, lon, lat}
MapControls.drawRoute = function(loc1, loc2, color, callback) {
  if (map==undefined) { console.log("MapControls not initialized"); return; }
    var request = {
      origin: new google.maps.LatLng(loc1.lat,loc1.lon),
      destination: new google.maps.LatLng(loc2.lat,loc2.lon),
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(result, status) {
      if (status == google.maps.DirectionsStatus.OK) {
		  var directionsDisplay = new google.maps.DirectionsRenderer({
			  polylineOptions: { strokeColor: color }
		  });
          directionsDisplay.setDirections(result);
          directionsDisplay.setMap(map);
          routes.push(directionsDisplay);
          callback(result);
      } else {
          console.log( "drawRoute failed getting directions: " + status);
          callback(undefined);
      }
    });
};

return MapControls;
})();
