
/* Image name-changing notes (not neccicarilly meaningful to anyone but me)
	//I renamed (most of) the icons to have the format category-dispStyle-name
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
//NOTE DONE YET (also not searched for in .html, .js): map-
//NOTE: there are a few used images that still don't conform to the category-dispStyle-name format
//Pins: all get "pin" as the category.  DispTypes:
	click -> clicked
	fade -> faded
	MoveOn -> hovered
	normal -> normal
	other_<something> -> <translation of something>2
*/


var TestData = {
	CMULoc: { name:"CMU", addr:"500 Forbes Avenue, Pittsburgh, PA 15213", lat:40.438194, lon:-79.9960447 },
	fakeUserId: 6,
	fakeUserName: "Bob",
	fakeHomeLoc: { name:"Home", addr:"123 Fake Street, Pittsburgh PA 12345", lat:40, lon:-80 },
	fakeFavorites: [
		{ id:1234, name:"Starbucks", label:"coffee", notes:"", business_id:null, user_id:6, latitude:40, longitude:-81,
			street_1:"456 Fake Street", street_2:"", city:"Pittsburgh", state:"PA", zip_code:"12345" },
		{ id:2345, name:"Chipotle", label:"restaurant", notes:"Note note note", business_id:null, user_id:6, latitude:40, longitude:-82,
			street_1:"789 Fake Street", street_2:"", city:"Pittsburgh", state:"PA", zip_code:"12345" },
		{ id:6789, name:"Library", label:"books", notes:"", business_id:null, user_id:6, latitude:40, longitude:-83,
			street_1:"987 Fake Street", street_2:"", city:"Pittsburgh", state:"PA", zip_code:"12345" }
	],
	makeFakeSuggestions: function(str) { return [
		{ name:str+"_1", addr:"AAA 1st Street, Pittsburgh PA 12345", lat:41, lon:-79, notes:"" },
		{ name:str+"_2", addr:"BBB 2nd Street, Pittsburgh PA 12345", lat:42, lon:-79, notes:"Note note note" },
		{ name:str+"_3", addr:"CCC 3rd Street, Pittsburgh PA 12345", lat:43, lon:-79, notes:"" }
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
	id:-1,
	name:"",
	street_1:"",
	street_2:"",
	city:"",
	sttate:"",
	zip_code:"",
	latitude:undefined,		//should NEVER be left undefined
	longitude:undefined,	//should NEVER be left undefined
	label:"blank",
	notes:"",
	business_id: null,
	user_id: null			//should NEVER be left null
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

RouteTools.makeFavorite = function(data) {
	return _replaceSpecifiedMembers(EMPTYFAVORITE, data);
};

RouteTools.makeRoute = function(data) {
	return _replaceSpecifiedMembers(EMPTYROUTE, data);
};

RouteTools.deleteTask = function(route, number) {
	if (route.tasks.length==1)
		route.tasks[0] = RouteTools.makeTask({});
	else
		route.tasks.splice(number,1);
}
RouteTools.addTask = function(route, tInfo) {
	route.tasks.push(RouteTools.makeTask(tInfo));
}

RouteTools.moveTask = function(route, oldPos, newPos) {
	if (newPos<0) newPos = 0;
	if (newPos>route.tasks.length) newPos = route.tasks.length-1;
	var task = route.tasks[oldPos];
	var insertAt = newPos + (newPos>oldPos?1:0);
	var removeAt = oldPos + (newPos<oldPos?1:0);
	route.tasks.splice(insertAt,0,task);
	route.tasks.splice(removeAt,1);
}

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

RouteTools.piecesToAddrString = function(pieces) {
	return (pieces.street_1
		+ (pieces.street_2!="" ? ", " : "")
		+ pieces.street_2
		+ ", " + pieces.city
		+ ", " + pieces.state
		+ " " + pieces.zip_code);
}
RouteTools.addrStringToPieces = function(addr) {
	var addrPieces = addr.split(',');
	var stateAndZip = addrPieces[addrPieces.length-1].split(' ');
	var wellFormed = stateAndZip.length==2 && (addrPieces.length==4 || addrPieces.length==3);
	if (wellFormed) {
		return {
			street_1: addrPieces[0].trim(),
			street_2: (addrPieces.length==4 ? addrPieces[1].trim() : ""),
			city: addrPieces[addrPieces.length-2].trim(),
			state: stateAndZip[0].trim(),
			zip_code: stateAndZip[1].trim()
		};
	} else {
		return {
			street_1: addr,
			street_2: "",
			city: "",
			state: "",
			zip_code: ""
		};
	}
}

RouteTools.ROUTESTARTINGATCMU = RouteTools.makeRoute({tasks:[RouteTools.makeTask({label:"CMU",loc:TestData.CMULoc})]});

return RouteTools;
})();
