var map;
var markers = [];
var lines = [];
var routes = [];
var directionsService = new google.maps.DirectionsService();

var categories = {
  'restaurant' : 'AddCategory-01.png',
  'atm' : 'AddCategory-02.png',
  'coffee' : 'AddCategory-03.png',
  'bank' : 'AddCategory-04.png',
  'groceries' : 'AddCategory-05.png',
  'pharmacy' : 'AddCategory-06.png',
  'books' : 'AddCategory-07.png',
  'work' : 'AddCategory-08.png',
  'gas' : 'AddCategory-09.png',
  'home' : 'AddCategory-10.png',
  'post office' : 'AddCategory-11.png'
}

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



function initialize() {
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
    
    map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

    //map_recenter(map.getCenter(), 200, 0);
    console.log("initialized map");
  //google.maps.event.addListener(map, 'click', addLatLng);
}


/**
 * Handles click events on a map, and adds a new point to the Polyline.
 * @param {google.maps.MouseEvent} event

 USED FOR TESTING MARKERS AND INFOWINDOWS
 */
 /*
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
        url: "normal" + markerNum + ".png",
        scaledSize: new google.maps.Size(22, 41),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(11, 41)
      };
  } else {
    icon = {
        url: "other-normal" + markerNum + ".png",
        scaledSize: new google.maps.Size(16, 30),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(8,30)
      };
  }
  marker.setIcon(icon);
  var html = '<div class="pin-popover">\
    <table class="table-container">\
        <tr>\
            <td><img id="popover-icon" src="Category_ClickPins-09.png" width="35px" height="35px"/></td>\
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

var MapControls = {}; //"object" holding everything public

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
        url: "normal" + markerNum + ".png",
        scaledSize: new google.maps.Size(22, 41),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(11, 41)
      };
  } else {
    icon = {
        url: "other-normal" + markerNum + ".png",
        scaledSize: new google.maps.Size(16, 30),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(8,30)
      };
  }
  marker.setIcon(icon);
  var html = '<div class="pin-popover">\
    <table class="table-container">\
        <tr>\
            <td><img id="popover-icon" src="Category_ClickPins-09.png" width="35px" height="35px"/></td>\
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


// Some initializing
  // Show the routes tab (tab5) on init
  // Sets the menu background 
$(function () {
    $('#tabs a[href="#tab5').tab('show');
    $('#menu-background').height($('#menu').height());
    var overlay = $("#overlay");
    overlay.height($(".tab-content").height());
})

// Changes image on menu tab bar icons when selected
$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
  var target = $(e.target).children().first();
  target.attr("src" , '<%= image_path "tab-ClickOn-" + target.attr("name") + ".png" %>' );
  //target.attr("src", "tab-ClickOn-" + target.attr("name") + ".png");
  var related = $(e.relatedTarget).children().first();
  target.attr("src" , '<%= image_path "tab-Normal-" + related.attr("name") + ".png" %>' );
  //related.attr("src", "tab-Normal-" + related.attr("name") + ".png");
  $('#menu-background').height($('#menu').height());

  var overlay = $(".overlay");
  overlay.height($(".tab-content").height());

})

/* Settings tab functions */

// Sets the selected option in the dropdown menu
// in Settings tab for Least option
$(function(){
    $("#least-option-dropdown li a").click(function(){
      $("#least-option").text($(this).text());
      $("#least-option").val($(this).text());
   });
});

// Sets the selected option in the dropdown menu
// in Settings tab for Distance option
$(function(){
    $("#distance-option-dropdown li a").click(function(){
      $("#distance-option").text($(this).text());
      $("#distance-option").val($(this).text());
   });
});

/* Routes tab functions */

// Toggles between the two views in the Route tab
// Goes to the directions page when clicked "Find Route"
$(function() {
  $("#findroute-button").click(function() {
    $("#route-input").hide();
    $("#route-output").show();
    $('#menu-background').height($('#menu').height());
  })
})

// Toggles between the two views in the Route tab
// Goes back to the routes page when clicked "Back"
$(function() {
  $("#route-back-button").click(function() {
    $("#route-output").hide();
    $("#route-input").show();
    $('#menu-background').height($('#menu').height());
  })
})

/* Favorites tab functions */

// Displays "Edit" link in the Favorites tab for
// the selected favorite opion
$(function() {
  $('#favorite-form input').on('change', function() {
     $('input[name=favToAdd]', '#favorite-form').parent().parent().find("#time-options-button").hide();
     $('input[name=favToAdd]:checked', '#favorite-form').parent().parent().find("#time-options-button").show();
  });
})

// Selects the favorite when user clicks anywhere
// in a row in Favorites tab
$(function() {
  $('#favorite-table tr').click(function() {
    $( this ).find("input:radio[name=favToAdd]").prop('checked', true).change();
  });
})

/* Favorites tab - Edit Favorite modal functions */ 

// Changes link to text field in the Edit Favorite modal
$(function() {
  $('.actually-text-field').click(function() {
    var value = $( this ).html();
    if (value == '-----') value = "";
    var input = $(this).next();
    $(this).hide();
    input.show();
    input.val(value);
    input.focus();
  });
})

// Changes text field back to link in the Edit Favorite modal
$(function() {
  $('.not-actually-text-field').bind('blur keyup', function(e) {
    if (e.type == 'blur' || e.keyCode == '13')  {
      var value = $( this ).val();
      if (value == "") value = "-----";
      var text = $(this).prev();
      $(this).hide();
      text.show();
      text.html(value);
    }
  });
})

// Helper functions to convert between selected category
// image url and unselected
function toSelected (url) {
  // Assumes url is unselected url
  var num = parseInt(url.match(/\d+/)[0]) + 11;
  return "AddCategory-" + num + ".png";
}

function toUnselected (url) {
  // Assumes url is selected url
  var n = parseInt(url.match(/\d+/)[0]) - 11;
  var num = n > 9 ? "" + n: "0" + n;
  return "AddCategory-" + num + ".png";
}

// Visually changes category icon in Edit Favorite modal
// when selected
$(function() {
  $('.favorite-category-icon').click(function() {
    var target = $( this ).children().first();
    var fileString = target.attr("src");
    if (target.hasClass("selected")) {
      return;
    } else {
      // Unselect previously selected category
      var unselected = $('.favorite-category-icon').find(".selected");
      if (unselected.length != 0) {
        unselected.removeClass("selected");
        unselected.attr("src" , '<%= image_path ' + toUnselected(unselected.attr("src")) + ' %>' );
        //unselected.attr("src", toUnselected(unselected.attr("src")));
      }

      // Select clicked category
      target.addClass("selected");
      target.attr("src" , '<%= image_path ' + toSelected(target.attr("src")) + ' %>' );
      //target.attr("src", toSelected(target.attr("src")));
    }
  });
})

// Closes Edit Favorite modal when click back button
$(function() {
  $('#favorite-back-button').click(function() {
    $('#favoritesModal').modal('hide');
  });
})