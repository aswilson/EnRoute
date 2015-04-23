var map;
var markers;
var lines;
var routes;
var directionsService = new google.maps.DirectionsService();

function initialize() {
	var mapOptions = {
    	zoom: 8,
    	center: new google.maps.LatLng(-34.397, 150.644)
  	};
  	
  	map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
}

google.maps.event.addDomListener(window, 'load', initialize);

function addrToLatLon(addr) {
	geocoder.geocode( { 'addr': address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
      	return results[0].geometry.location;

        //map.setCenter(results[0].geometry.location);
        //var marker = new google.maps.Marker({
        //    map: map,
        //    position: results[0].geometry.location
        //});
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
}

function getPin(pinId) {
	for (var i = 0; i < markers.length; i++) {
    	if (marker[i].position.toString().equals(pinId)) {
    		return marker[i];
    	}
  	}
}

var MapControls = (function() {

var somePrivateVar = 6;
var somePrivateFunction = function(arg1, arg2) { }

var MapControls = {};	//"object" holding everything public

// Takes an address (ex: 1600 Amphitheatre Parkway, Mountain View, CA)
// Returns geolat (ex: {lat: 123, lon: 123})
MapControls.getLatLon = function(addr) {
	var loc = addrToLatLon(addr);
    return {lat: loc.lat(), lon: loc.lng()};
};

// Uses pythagorean trm to get distance between two addresses
// Address needs to look like : 1600 Amphitheatre Parkway, Mountain View, CA
MapControls.getDistBetween = function(addr1, addr2) {
	var loc1 = addrToLatLon(addr1);
	var loc2 = addrToLatLon(addr2);
	return Math.sqrt(Math.pow(loc1.lat - loc2.lat, 2) + Math.pow(loc1.lng - loc2.lng, 2));
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
  	map.setZoom(3);
};

// Puts a marker with image at the latlng location on the map. I'm just going to use latlon as the id.
//latLon = {lat, lon}
//imgInfo = string path to image (for now)
MapControls.placePin = function(latLon, imgInfo) {
	var marker = new google.maps.Marker({
    	position: new google.maps.LatLng(latLon.lat,latLon.lon),
	});
	marker.setMap(map);
	markers.push(marker);
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
  	lines.add(path);
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
  	routes.add(directionsDisplay);
};

return MapControls;
})();