var TestData = {
	CMULoc: { name:"CMU", addr:"500 Rorbes Avenue, Pittsburgh, PA 15213", lat:3, lon:4 },
	fakeUserName: "Bob",
	fakeHomeLoc: { name:"Home", addr:"123 Fake Street, Pittsburgh PA 12345", lat:10, lon:11 },
	fakeFavorites: [
		{ name:"Starbucks", addr:"456 Fake Street, Pittsburgh PA 12345", lat:10, lon:12, category:"coffee", notes:"" },
		{ name:"Chipotle", addr:"789 Fake Street, Pittsburgh PA 12345", lat:10, lon:13, category:"restaurant", notes:"" },
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

publicStuff.categories = {
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
  'postOffice' : 'AddCategory-11.png'
}
//Category_ClickPins -> category-blue1
//AddCategory-01 -> category-blue2
//AddCategory-12 -> category-red2
//AddCategory-23 -> category-red2
//SearchBox -> category-grey
//button-Normal -> button-normal
//button-ClickOn -> button-clicked
//button-MoveOver -> button-hovered
//ClickOn -> button-clicked2
//ClickOn -> icon-clicked
//findroute-ClickOn -> taskIcons-clicked
 //findroute-MoveOver -> taskIcons-hovered
 //findroute-Normal -> taskIcons-normal
	//01 -> unlocked (blue)
	//02 -> clock (blue)
	//03 -> delete (red)
	//04 -> help (red)
	//05 -> locked (blue)
//LogInWindow-01 -> checkmarkInCircle (green)
//LogInWindow-02 -> xInCircle (red)
//LogInWindow-02 -> user (blue1)
//01 -> findRoute
//02 -> signIn
//03 -> addStop
//04 -> register
//05 -> logIn
//06 -> go
//4 -> star
//5 -> map
//07 -> radioButton (Selected / Unselected)
//08 -> save
//09 - zoomOut
//10 - zoomIn
//Delete
//AddStop
//AdvancedOption
//AddCategory-34
//Help
//Move.png

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
publicStuff.categoryToImg = function(cat) {
	var s = publicStuff.categories[cat];
	return (s==undefined) ? "AddCategory-00.png" : s;
}
publicStuff.imgToCategory = function(cat) {
	for (var k in publicStuff.categories) {
		if (publicStuff.categories[k]===cat)
			return k;
	}
	return "";
}
publicStuff.categoryIcon_toSelected = function(url) {
  // Assumes url is unselected url
  var num = parseInt(url.match(/\d+/)[0]) + 11;
  return "AddCategory-" + num + ".png";
}
publicStuff.categoryIcon_toUnselected = function(url) {
  // Assumes url is selected url
  var n = parseInt(url.match(/\d+/)[0]) - 11;
  var num = n > 9 ? "" + n: "0" + n;
  return "AddCategory-" + num + ".png";
}

publicStuff.replaceUrlTail = function(oldUrl, newTail) {
	var index = oldUrl.lastIndexOf('/');
	var prefix = index!=-1 ? oldUrl.substring(0,index) : "";
	return (prefix + (prefix===""?"":"/") + newTail);
}	

publicStuff.ROUTESTARTINGATCMU = publicStuff.makeRoute({tasks:[publicStuff.makeTask({label:"CMU",loc:TestData.CMULoc})]});

return publicStuff;
})();