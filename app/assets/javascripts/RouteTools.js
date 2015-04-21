var RouteTools = (function() {

//Define our route-related object types.
//  Time is measured in minutes.
var EMPTYRANGE = { start: undefined, end: undefined };
var EMPTYTASK = {
	label: "",	//what the user entered.  May be an activityType, address, or business name
	loc: undefined,	//format: {name, addr, lat, lon}
	//Timing attributes:
	flexibleOrdering: false,
	startTime: undefined,
	endTime: undefined,
	whenToArrive: EMPTYRANGE,
	whenToLeave: EMPTYRANGE,
	minutesNeeded: undefined
};
var EMPTYROUTE = {
	tasks: [EMPTYTASK],
	useShortestTime: true,	//else use shortest distance
	minutesAvailiable: undefined
};


function _simpleClone(obj) {
	//taken from ConroyP's answer at http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-an-object
    if(obj == null || typeof(obj) != 'object')
        return obj;
    var temp = obj.constructor();
    for (var key in obj) {
        if(obj.hasOwnProperty(key))
            temp[key] = _simpleClone(obj[key]);
    }
    return temp;
}

function _replaceSpecifiedMembers(base,extender) {
	var o = _simpleClone(base);
	for (property in base) {
		if (extender[property] != undefined)
			o[property] = extender[property];
	}
	return o;
};


var publicStuff = {};

publicStuff.EMPTYRANGE = EMPTYRANGE;

publicStuff.makeTask = function(data) {
	return _replaceSpecifiedMembers(EMPTYTASK, data);
};

publicStuff.makeRoute = function(data) {
	return _replaceSpecifiedMembers(EMPTYROUTE, data);
};

publicStuff.rangeToString = function(range) {
	return "<"+range.start+","+range.end+">";
};

publicStuff.locToLatLon = function(loc) {
	return {lat: loc.lat, lon: loc.lon};
}

publicStuff.ROUTESTARTINGATCMU = publicStuff.makeRoute({tasks:[publicStuff.makeTask({label:"CMU",loc:{name:"CMU",addr:"500 Rorbes Avenue, Pittsburgh, PA 15213",lat:3,lon:4}})]});

return publicStuff;
})();