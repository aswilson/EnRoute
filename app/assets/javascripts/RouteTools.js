
/* Image name-changing notes (not neccicarilly meaningful to anyone but me)
//Category_ClickPins -> category-blue1
//AddCategory-01 -> category-blue2
//AddCategory-12 -> category-red1
//AddCategory-23 -> category-red2
//SearchBox -> category-grey
//-Normal -> -normal
//-ClickOn -> -clicked
//-MoveOver -> -hovered
//Normal/ClickOn/MouseOver -> textButton-normal2 | tab-normal2 | icon-
//button- -> textButton-
//login- -> textButton-
//tab- -> tab-
	//01 -> user
	//02 -> save
	//03 -> settings
	//04 -> favorites
	//05 -> route
//findroute- -> taskIcons-
	//01 -> unlocked (blue)
	//02 -> clock (blue)
	//03 -> delete (red)
	//04 -> help (red)
	//05 -> locked (blue)
	//06 -> move (blue)
//LogInWindow-01 -> checkmarkInCircle (green)
//LogInWindow-02 -> xInCircle (red)
//LogInWindow-02 -> tab-normal2-user (blue1)
//01 -> findRoute
//02 -> signIn
//03 -> addStop
//04 -> register
//05 -> logIn
//06 -> go
//4 -> favorites (should be in tabs-_2)
//5 -> map (should be in tabs-_2)
//-07 -> {nothing_}radioButton{(Selected/Unselected}
//08 -> save
//09 - zoomOut
//10 - zoomIn
//USED DIRECTLY: Help, TimeSetting, checkmarkInCircle (after change),
//NOTE DONE YET (also not searched for in .html, .js): map-,
*/


var TestData = {
	CMULoc: { name:"CMU", addr:"500 Rorbes Avenue, Pittsburgh, PA 15213", lat:3, lon:4 },
	fakeUserName: "Bob",
	fakeHomeLoc: { name:"Home", addr:"123 Fake Street, Pittsburgh PA 12345", lat:10, lon:11 },
	fakeFavorites: [
		{ name:"Starbucks", addr:"456 Fake Street, Pittsburgh PA 12345", lat:10, lon:12, category:"coffee", notes:"" },
		{ name:"Chipotle", addr:"789 Fake Street, Pittsburgh PA 12345", lat:10, lon:13, category:"restaurant", notes:"Note note note" },
		{ name:"Library", addr:"987 Fake Street, Pittsburgh PA 12345", lat:10, lon:14, category:"books", notes:"" }
	],
	makeFakeSuggestions: function(str) { return [
		{ name:str+"_1", addr:"AAA 1st Street, Pittsburgh PA 12345", lat:11, lon:9, notes:"" },
		{ name:str+"_2", addr:"BBB 2nd Street, Pittsburgh PA 12345", lat:12, lon:9, notes:"Note note note" },
		{ name:str+"_3", addr:"CCC 3rd Street, Pittsburgh PA 12345", lat:13, lon:9, notes:"" }
	];}
}


var RouteTools = (function() {

//Define our route-related object types.
//  Time is measured in minutes.
var EMPTYRANGE = { start: undefined, end: undefined };
var EMPTYTASK = {
	label: "",	//what the user entered.  May be an activityType, address, or business name
	loc: undefined,	//format: {name, addr, lat, lon}
	//Timing attributes:
	flexibleOrdering: false,
	whenToArrive: EMPTYRANGE,
	whenToLeave: EMPTYRANGE,
	minutesNeeded: undefined
};
var EMPTYROUTE = {
	tasks: [EMPTYTASK],
	useShortestTime: true,	//else use shortest distance
	minutesAvailiable: undefined
};
var EMPTYFAVORITE = {
	name:"",
	addr:"",
	lat:undefined,		//should NEVER be left undefined
	lon:undefined,		//should NEVER be left undefined
	category:"blank",
	notes:""
}


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
	for (var property in base) {
		if (extender[property] != undefined)
			o[property] = extender[property];
	}
	return o;
};

var RouteTools = {};

RouteTools.EMPTYRANGE = EMPTYRANGE;
RouteTools.EMPTYFAVORITE = EMPTYFAVORITE;

RouteTools.makeTask = function(data) {
	return _replaceSpecifiedMembers(EMPTYTASK, data);
};

RouteTools.makeRoute = function(data) {
	return _replaceSpecifiedMembers(EMPTYROUTE, data);
};

RouteTools.rangeToString = function(range) {
	return "<"+range.start+","+range.end+">";
};

RouteTools.locToLatLon = function(loc) {
	return {lat: loc.lat, lon: loc.lon};
}

RouteTools.imgStringToPieces = function(url) {
	//example url: "assets/textButton-normal-findRoute.png";
	var index1 = url.lastIndexOf('/');
	var index2 = url.lastIndexOf('.');
	if (index2==-1)		index2 = url.length;
	var prefix = url.substring(0, index1+1);		//includes the '/'
	var suffix = url.substring(index2, url.length);	//includes the '.'
	var srcName = url.substring(index1+1, index2);
	var namePieces = srcName.split('-');
	return {
		prefix: prefix,
		category: namePieces[0],
		dispMode: namePieces[1],
		name: namePieces[2],
		suffix: suffix
	};
}
RouteTools.piecesToImgString = function(pieces) {
	return (pieces.prefix+pieces.category+"-"+pieces.dispMode+"-"+pieces.name+pieces.suffix);
}
RouteTools.alterImgUrlPiece = function($img, piece, newVal) {
	var pieces = RouteTools.imgStringToPieces($img.attr("src"));
	pieces[piece] = newVal;
	$img.attr("src", RouteTools.piecesToImgString(pieces));
}	

RouteTools.ROUTESTARTINGATCMU = RouteTools.makeRoute({tasks:[RouteTools.makeTask({label:"CMU",loc:TestData.CMULoc})]});

return RouteTools;
})();
