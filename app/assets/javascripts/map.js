//var map;
//var markers = [];
//var lines = [];
//var routes = [];
//var directionsService = new google.maps.DirectionsService();
//
//function map_recenter(latlng,offsetx,offsety) {
//    var point1 = map.getProjection().fromLatLngToPoint(
//        (latlng instanceof google.maps.LatLng) ? latlng : map.getCenter()
//    );
//    var point2 = new google.maps.Point(
//        ( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
//        ( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
//    );  
//    map.setCenter(map.getProjection().fromPointToLatLng(new google.maps.Point(
//        point1.x - point2.x,
//        point1.y + point2.y
//    )));
//}
//
//function initialize() {
//  var mapOptions = {
//      zoom: 13,
//      center: new google.maps.LatLng(40.4397, -79.9764),
//      mapTypeControl: false,
//      panControl: false,
//      rotateControl: false,
//      scaleControl: false,
//      streetViewControl: false,
//      navigationControl: false,
//      disableDefaultUI: true
//    };
//    
//    map = new google.maps.Map(document.getElementById('map-canvas'),
//      mapOptions);
//
//    //map_recenter(map.getCenter(), 200, 0);
//}
//
//google.maps.event.addDomListener(window, 'load', initialize);
//
//function addrToLatLon(addr) {
//  geocoder.geocode( { 'addr': address}, function(results, status) {
//      if (status == google.maps.GeocoderStatus.OK) {
//        return results[0].geometry.location;
//
//        //map.setCenter(results[0].geometry.location);
//        //var marker = new google.maps.Marker({
//        //    map: map,
//        //    position: results[0].geometry.location
//        //});
//      } else {
//        alert("Geocode was not successful for the following reason: " + status);
//      }
//    });
//}
//
//function getPin(pinId) {
//  for (var i = 0; i < markers.length; i++) {
//      if (marker[i].position.toString().equals(pinId)) {
//        return marker[i];
//      }
//    }
//}
//
//var MapControls = (function() {
//
//var somePrivateVar = 6;
//var somePrivateFunction = function(arg1, arg2) { }
//
//var MapControls = {}; //"object" holding everything public
//
//// Takes an address (ex: 1600 Amphitheatre Parkway, Mountain View, CA)
//// Returns geolat (ex: {lat: 123, lon: 123})
//MapControls.getLatLon = function(addr) {
//  var loc = addrToLatLon(addr);
//    return {lat: loc.lat(), lon: loc.lng()};
//};
//
//// Uses pythagorean trm to get distance between two addresses
//// Address needs to look like : 1600 Amphitheatre Parkway, Mountain View, CA
//MapControls.getDistBetween = function(addr1, addr2) {
//  var loc1 = addrToLatLon(addr1);
//  var loc2 = addrToLatLon(addr2);
//  return Math.sqrt(Math.pow(loc1.lat - loc2.lat, 2) + Math.pow(loc1.lng - loc2.lng, 2));
//};
//
//// Deletes all markers and lines on the map
//MapControls.clearMap = function() {
//  for (var i = 0; i < markers.length; i++) {
//      markers[i].setMap(null);
//    }
//    for (var j = 0; j < lines.length; j++) {
//      lines[j].setMap(null);
//    }
//    for (var k = 0; k < routes.length; j++) {
//      routes[k].setMap(null);
//    }
//    markers = [];
//    lines = [];
//    routes = [];
//};
//
//// Deletes all lines on the map
//MapControls.clearLines = function() {
//    for (var j = 0; j < lines.length; j++) {
//      lines[j].setMap(null);
//    }
//    lines = [];
//};
//
//// Deletes all routes on the map
//MapControls.clearRoutes = function() {
//    for (var k = 0; k < routes.length; j++) {
//      routes[k].setMap(null);
//    }
//    routes = [];
//};
//
//// Uses all markers on the map so far to center the map
//MapControls.recenter = function() {
//  var bounds = new google.maps.LatLngBounds();
//  for (var i = 0; i < markers.length; i++) {
//      bounds.extend(marker[i].position);
//    }
//    map.fitBounds(bounds);
//    //map_recenter(map.getCenter(), 100, 0);
//};
//
//// Puts a marker with image at the latlng location on the map. I'm just going to use latlon as the id.
////latLon = {lat, lon}
////imgInfo = string path to image (for now)
//MapControls.placePin = function(latLon, imgInfo) {
//  var marker = new google.maps.Marker({
//      position: new google.maps.LatLng(latLon.lat,latLon.lon),
//      icon: imgInfo
//  });
//  var infowindow = new google.maps.InfoWindow({
//      content: "\n\n\n\n\n"
//  });
//  marker.setMap(map);
//  markers.push(marker);
//  google.maps.event.addListener(marker, 'click', function() {
//    infowindow.open(map,marker);
//  });
//  return marker.position.toString();
//};
//
//// Iterates through pins to find the one we're deleting
//// Inefficient - use sparingly
//MapControls.removePin = function(pinId) {
//  for (var i = 0; i < markers.length; i++) {
//      if (marker[i].position.toString().equals(pinId)) {
//        markers.splice(i, 1);
//      }
//    }
//};
//
//// Color is string in hash format. ex. '#FF0000' '#666666'
//// Adds a straight line between the pins
//MapControls.addLine = function(pinId1, pinId2, color) {
//  var pathCoordinates = [
//      getPin(pinId1).position,
//      getPin(pinId2).position
//    ];
//    var path = new google.maps.Polyline({
//      path: pathCoordinates,
//      geodesic: true,
//      strokeColor: color,
//      strokeOpacity: 1.0,
//      strokeWeight: 2
//    });
//
//    path.setMap(map);
//    lines.add(path);
//    return path; //Who knows what this would end up being :/ hope it's an id tho.
//};
//
//// Color is string in hash format. ex. '#FF0000' '#666666'
//// Adds the shortest path between the two pins
//MapControls.drawRoute = function(pinId1, pinId2, color) {
//  var request = {
//      origin: getPin(pinId1).position,
//      destination: getPin(pinId2).position,
//      travelMode: google.maps.TravelMode.DRIVING
//    };
//    var directionsDisplay = new google.maps.DirectionsRenderer({
//      polylineOptions: {
//          strokeColor: color
//      }
//    });
//    directionsService.route(request, function(result, status) {
//      if (status == google.maps.DirectionsStatus.OK) {
//          directionsDisplay.setDirections(result);
//      }
//    });
//    directionsDisplay.setMap(map);
//    routes.add(directionsDisplay);
//};
//
//return MapControls;
//})();
//
//
//$(function () {
//    $('#tabs a[href="#tab5').tab('show')
//})
//
//$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
//  var target = $(e.target).children().first()
//  target.attr("src", "tab-ClickOn-" + target.attr("name") + ".png")
//  var related = $(e.relatedTarget).children().first()
//  related.attr("src", "tab-Normal-" + related.attr("name") + ".png")
//})