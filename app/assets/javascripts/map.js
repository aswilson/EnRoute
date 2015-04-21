var MapControls = (function() {

var somePrivateVar = 6;
var somePrivateFunction = function(arg1, arg2) { }

var MapControls = {};	//"object" holding everything public

MapControls.getLatLon = function(addr) {
	return {lat:50.3, lon:40.6};
};

MapControls.getDistBetween = function(addr1, addr2) {
	return 3.5;
};

MapControls.clearMap = function() {
	//no return value
};

MapControls.recenter = function() {
	//current form takes no args, and just uses the already-placed pins to decide position/zoom
	//let me know if the arguments need changing
	    //one option: minLat,maxLat, minLon,maxLong
	//no return value
};

MapControls.placePin = function(latLon, imgInfo) {
	//latLon = {lat, lon}
	//imgInfo = string path to image (for now)
	var somePinId = 0;
	return somePinId;
};

MapControls.removePin = function(pinId) {
	//no return value
};

MapControls.addLine = function(pinId1, pinId2, color) {
	//let me know the format you want for color
	//if you think we should drop someLineId and use some other structure for adding/removing lines, let me know
	var someLineId = 0;
	return someLineId;
};

MapControls.removeLine = function(someLineId) {
	//if you think we should drop someLineId and use some other structure for adding/removing lines, let me know
		//option: pass in the pinIds and look up whether the line is there
		//option: get rid of removeLine() and just use addLine(_,_,NOCOLOR).  I don't like that idea.
	//no return value
};

MapControls.drawRoute = function(pinId1, pinId2, color) {
	//same notes as drawLine
	var someRouteId = 0;
	return someRouteId;
};

MapControls.removeRoute = function(someRouteId) {
	//same notes as removeLine()
	//no return value
};

return MapControls;
})();