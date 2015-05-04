var TestData = {
    CMULoc: { name:"CMU", addr:"5000 Forbes Avenue, Pittsburgh, PA 15213", lat:40.4436501, lon:-79.9440521 },
    fakeUserId: 6,
    fakeUserName: "Bob",
    fakeHomeLoc: { name:"Home", addr:"123 Fake Street, Pittsburgh, PA 12345", lat:40.42, lon:-80 },
    fakeFavorites: [
        { id:1234, name:"Starbucks", category:"coffee", notes:"", business_id:null, user_id:6, latitude:40.41, longitude:-80.01,
            street_1:"456 Fake Street", street_2:"", city:"Pittsburgh", state:"PA", zip_code:"12345" },
        { id:2345, name:"Chipotle", category:"restaurant", notes:"Note note note", business_id:null, user_id:6, latitude:40, longitude:-80.02,
            street_1:"789 Fake Street", street_2:"", city:"Pittsburgh", state:"PA", zip_code:"12345" },
        { id:6789, name:"Library", category:"books", notes:"", business_id:null, user_id:6, latitude:40, longitude:-80.03,
            street_1:"987 Fake Street", street_2:"", city:"Pittsburgh", state:"PA", zip_code:"12345" }
    ],
    makeFakeSuggestions: function(str) { return [
        { name:str+"_1", addr:"AAA 1st Street, Pittsburgh, PA 12345", lat:40.44, lon:-80 },
        { name:str+"_2", addr:"BBB 2nd Street, Pittsburgh, PA 12345", lat:40.45, lon:-80 },
        { name:str+"_3", addr:"CCC 3rd Street, Pittsburgh, PA 12345", lat:40.46, lon:-80 }
    ];}
}


var RouteTools = (function() {

//Define our route-related object types.
//  Time is measured in minutes.
var EMPTYRANGE = { start: undefined, end: undefined };
var EMPTYTASK = {
    label: "",  //what the user entered.  May be an activityType, address, or business name
    loc: undefined, //format: {name, addr, lat, lon}
    //Timing attributes:
    flexibleOrdering: false,
    whenToArrive: EMPTYRANGE,
    whenToLeave: EMPTYRANGE,
    minutesNeeded: undefined
};
var EMPTYROUTE = {
    tasks: [EMPTYTASK],
    useShortestTime: true,  //else use shortest distance
    minutesAvailiable: undefined
};
var EMPTYFAVORITE = {
    id:-1,
    name:"",
    street_1:"",
    street_2:"",
    city:"",
    state:"",
    zip_code:"",
    latitude:undefined,     //should NEVER be left undefined
    longitude:undefined,    //should NEVER be left undefined
    category:"blank",
    notes:"",
    business_id: null,
    user_id: null           //should NEVER be left null
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
RouteTools.routeIsFilledOut = function(route) {
    for (var i=0; i<route.tasks.length; i++) {
        if (route.tasks[i].loc==undefined || route.tasks[i].error!=undefined)
            return false;
    }
    return true;
}

RouteTools.favToLoc = function(fav) {
    return {
        name: fav.name,
        addr: RouteTools.piecesToAddrString(fav),
        lat: fav.latitude,
        lon: fav.longitude
    };
}
RouteTools.locToLatLon = function(loc) {
    return {lat: loc.lat, lon: loc.lon};
}

RouteTools.coaxToCategory = function(str) {
	var CATEGORIES = [ "atm", "bank", "books", "coffee", "gas", "groceries", "home", "pharmacy", "postOffice", "restaurant", "work" ];
	if (CATEGORIES.indexOf(str.toLowerCase()) != -1)
		return str.toLowerCase();
	return "blank";
}

RouteTools.imgStringToPieces = function(url) {
    //example url: "assets/textButton-normal-findRoute.png";
    var index1 = url.lastIndexOf('/');
    var index2 = url.lastIndexOf('.');
    if (index2==-1)     index2 = url.length;
    var prefix = url.substring(0, index1+1);        //includes the '/'
    var suffix = url.substring(index2, url.length); //includes the '.'
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

RouteTools.isAddress = function(str) {
	//broken
	return (str.length > 10);
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
function addrPiecesToTwoLines(pieces) {
	var line1 = pieces.street_1
		+ (pieces.street_2!="" ? ", " : "")
		+ pieces.street_2;
	var line2 = pieces.city
		+ ((pieces.city!="" && pieces.state!="") ? ", " : "")
		+ pieces.state
		+ ((pieces.state!="" && pieces.zip_code!="") ? " " : "");
		+ pieces.zip_code;
	return [ line1, line2 ];
}
RouteTools.addrStringToTwoLines = function(addr) {
	return addrPiecesToTwoLines(RouteTools.addrStringToPieces(addr));
}
RouteTools.piecesToAddrString = function(pieces) {
	var lines = addrPiecesToTwoLines(pieces);
	return lines[0] + (lines[1]!="" ? ", " : "") + lines[1];
}

RouteTools.objsEqual = function(o1, o2) {
	var k1 = Object.keys(o1).sort();
	var k2 = Object.keys(o2).sort();
	if (k1.length != k2.length)
		return false;
	for (var i=0; i<k1.length; i++) {
		var k = k1[i];
		if (k2[i] != k)
			return false;
		if ((typeof o1[k]==="object") && (typeof o2[k]==="object")) {
			if (!RouteTools.objsEqual(o1[k], o2[k]))
				return false;
		} else {
			if (o1[k] != o2[k])
				return false;
		}
		return true;
	}
}

RouteTools.ROUTESTARTINGATCMU = RouteTools.makeRoute({tasks:[RouteTools.makeTask({label:"CMU",loc:TestData.CMULoc})]});

return RouteTools;
})();
