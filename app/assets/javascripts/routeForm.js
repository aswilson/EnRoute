(function(ourServerUrl, initialRoute) {	//start IIAF
var FAKEIT = false;		//if FAKEIT==true, fake talking to backend (also lets us pretend we're logged in)
var TASKHEIGHT = 37;					//a rough number, for now
var NUMOFNEARBYPOINTSTOGET = 5;
var BADTIMECONSTRAINTSERROR = "Impossible time constraints";

var myUserInfo = { id:-1, name:"", homeLoc:undefined, favorites:[] };
var myRoute = initialRoute;				//one difference between this and a normal route as seen in RouteTools: here, tasks may have an additional field "error"
var mySettings = {distInMiles: true};
var locationOptions = {};				//map of location options for a task, from server.  Format: {label1:[loc1,loc2,...],label2:[],label3:errorString,...}, where loc has the format given by RouteTools.EMPTYTASK.loc
var altPins = [];						//a list of all pins down as alternate locations (for easy removal)
var taskNoBeingEdited = undefined;		//when saving changes, indicates which task gets the changes
var favoriteNoBeingEdited = undefined;	//when saving changes, indicates which favorite gets the changes
var busy = false;						//indicates we're busy talking to the server, so the user can't spam it
var curMsgNum = 0;						//used to make showMsgMomentarily() work properly
var taskPrototype, favoritePrototype;	//helps create new tasks/favorites; drawn from the HTML.  Will be filled in when the document is loaded.
var pinPopoverPrototype;				//helps create popovers for pins
var locationPrototype, stepsPrototype, instructionPrototype;	//helps create directions table; drawn from the HTML.  Will be filled in when the document is loaded.

/* WORK STILL NEEDED:
--Major visual things
	--Make the images all transparent again (especially the blank category images)
	--Fix problems with RouteTools address stuff: isAddress(),addrStringToPieces(),piecesToAddrString()
--making fillInRoute actually smart (ie, acknowledge constraints)
	--<Jackie> read the values off the timepicker
	--make it smart
	--detecting impossible conditions before talking to backend (and setting task.error accordingly)
--fix problems with two pins on the same location, particularly a suggestion and a chosen location: when removing the suggestion, it may remove the real one instead
	--probably involves changing the lookup system in map.js
--Minor visual things
	--add hover-over hints (tooltips) for what stuff means.  See taskState for an example of how.
	--update all the textButtons: wrap in an <a> so that the icon changes when hover over, and put the id in the <a> rather than the <img>
		--POSSIBLY make the image change when hover over (RouteTools.alterImgUrlPiece is useful for this)
	--make favorites scrollable if it gets too long (or just cap it)
--cap the number of steps in the route
*/


/* Helper functions */
function getTaskNumber(o) {
	var taskId = o.closest("tr").attr("id");
	var numAsString = taskId.substring(4,taskId.length);
	return parseInt(numAsString,10);
}
function getFavoriteNumber(o) {
	var favId = o.closest("tr").attr("id");
	var numAsString = favId.substring(8,favId.length);
	return parseInt(numAsString,10);
}
function doAjax(ty,action,dat,onSuccess,onFail) {
	$.ajax({ type: ty, url: action, data: dat
	}).done( function(reply) {
		onSuccess(reply)
	}).fail( function( xmlHttpRequest, statusText, errorThrown ) {
		console.log("Ajax failed.\n\n"
			+ "XML Http Request: " + JSON.stringify( xmlHttpRequest )
			+ ",\nStatus Text: " + statusText
			+ ",\nError Thrown: " + errorThrown );
		onFail(errorThrown);
	});
}
function setDraggable(elem, draggingFns) {
	//based on https://css-tricks.com/snippets/jquery/draggable-without-jquery-ui/
	var w = $(window);
	elem.on("mousedown", function(e) {
		var obj = $(this);
		draggingFns.onGrab(obj);
		var startX = e.pageX;
		var startY = e.pageY;
		thingToMove = draggingFns.getThingToMove(obj);
		var z_backup = thingToMove.css('z-index');
		var origOffset = thingToMove==undefined ? undefined : thingToMove.offset();
		thingToMove.css('z-index',1000);	//move to very front
		w.on("mousemove", function(e2) {
			if (thingToMove!=undefined) {
				thingToMove.offset({
					left: origOffset.left+(e2.pageX-startX),
					top: origOffset.top+(e2.pageY-startY)
				});
			}
			draggingFns.onMove(obj, e2.pageX-startX, e2.pageY-startY);
		});
		w.on("mouseup", function(e2) {
			w.unbind("mousemove");
			w.unbind("mouseup");
			thingToMove.css('z-index', z_backup);
			if (thingToMove!=undefined)
				thingToMove.offset(origOffset);
			draggingFns.onRelease(obj, e2.pageX-startX, e2.pageY-startY);
		});
		e.preventDefault(); // disable selection
	});
}
function myIntToString(n) {
	return (n!=undefined ? ""+n : "");
}
function myStringToInt(s) {
	var v = parseInt(s,10);
	return (isNaN(v) ? undefined : v);
}
function showMsg(msg,type) {
	var MSGTYPES = ["error", "warning", "info"];
	curMsgNum++;
	$('span.statusMessage').empty().append(msg);
	for (var i=0; i<MSGTYPES.length; i++)
		$('span.statusMessage').removeClass(MSGTYPES[i]);
	if (MSGTYPES.indexOf(type) == -1)
		type = "info";
	$('span.statusMessage').addClass(type);
}
function showMsgMomentarily(msg,type,time) {
	showMsg(msg,type);
	var myMsgNum = curMsgNum;
	setTimeout(function(){
		if (curMsgNum == myMsgNum)	//only erase our message if it is the most recent
			showMsg("","info");
	}, time);
}


/* Stuff for updating the displays */
function updateBackgroundSizes() {
	$('#menu-background').height($('#menu').height());
	$(".overlay").height($(".tab-content").height());
}
function updateRouteForm() {
	//update task list display
	var tasksTable = $('#tasks-table').empty();
	for (var i=0; i<myRoute.tasks.length; i++) {
		var taskRow = taskPrototype.clone(true).attr("id","task"+i).show();
		taskRow.find('span#taskId').html(i+1);
		taskRow.find('input.task-label').attr("value",myRoute.tasks[i].label);
		if (i==0 || i==(myRoute.tasks.length-1)) {
			RouteTools.alterImgUrlPiece(taskRow.find('a.move-button img'), "name", "locked");
		} else {
			RouteTools.alterImgUrlPiece(taskRow.find('a.move-button img'), "name", "unlocked");
		}
		setTaskAlertIcon(taskRow.find('.taskStatus'), myRoute.tasks[i], i);
		taskRow.hover(function(){
			var taskNo = getTaskNumber($(this));
			showAlternatePins(taskNo);
		});
		tasksTable.append(taskRow);
	}
	//update the rest of the form
	$('#time-limit').val(myIntToString(myRoute.minutesAvailiable));
	var leastOptStr = (myRoute.useShortestTime) ? "time" : "distance";
	$("#minimize-option").text(leastOptStr);
	$("#minimize-option").val(leastOptStr);
	var distOptStr = (mySettings.distInMiles) ? "miles" : "kilometers";
	$("#distance-option").text(distOptStr);
	$("#distance-option").val(distOptStr);
	$("#route-output").hide();
	$("#route-input").show();
	updateBackgroundSizes();
}
function updateFavoritesList() {
	var favoritesTable = $('#favorites-table').empty();
	for (var i=0; i<myUserInfo.favorites.length; i++) {
		var favRow = favoritePrototype.clone(true).attr("id","favorite"+i).show();
		favRow.find("input:radio[name=favToAdd]").val(""+i);
		favRow.find('.favorite-label').empty().append(myUserInfo.favorites[i].name);
		RouteTools.alterImgUrlPiece(favRow.find('.categoryTypeIcon'), "name", myUserInfo.favorites[i].category.toLowerCase());
		favoritesTable.append(favRow);
	}
	updateBackgroundSizes();
}
function updateTaskEditWindow(task) {
	$('span#taskModal_label').empty().append("Task: "+task.label);
	$('input#taskModal_minutesNeeded').val(myIntToString(task.minutesNeeded));
	setTimerangeDisp("taskModal_arrive", task.whenToArrive);
	setTimerangeDisp("taskModal_leave", task.whenToLeave);
}
function updateFavoriteEditWindow(fav) {
	function strOrDashes(s) {
		if (s === "" || s === " ") {
			return "-----";
		} else return s;
	}
	var addr = RouteTools.piecesToAddrString(fav);
	$('input#favoritesModal_name').val(fav.name);
	$('input#favoritesModal_name').prev().empty().append(strOrDashes(fav.name));
	$('input#favoritesModal_addr').val(addr);
	$('input#favoritesModal_addr').prev().empty().append(strOrDashes(fav.street_1));
	$('input#favoritesModal_notes').val(fav.notes);
	$('input#favoritesModal_notes').prev().empty().append(strOrDashes(fav.notes));
	$('input#favoritesModal_category').val(fav.category.toLowerCase());
	setCategorySelectedDisp($('div#favoritesModal_category_container'), fav.category.toLowerCase());
}
function updateMap() {
	altPins = [];
	MapControls.clearMap();
	var prevPinNum = undefined;
	for (var i=0; i<myRoute.tasks.length; i++) {
		var loc = myRoute.tasks[i].loc;
		if (loc!=undefined) {
			var id = "pinPopover_"+i;
			var $popover = makeBasicPopup(id,loc,myRoute.tasks[i].label);
			var pinNum = MapControls.placePin(loc, i, true, $popover.get(0), function(infobox){});
			if (prevPinNum!=undefined)
				var lineNum = MapControls.addLine(prevPinNum, pinNum, '#666600');
			prevPinNum = pinNum;
		}
	}
	MapControls.recenter();
}
function updateDirections(directionData) {
	//directionData takes this form: {steps: [{text: [] dLabel:string, dAddr:string, duration:string }]}
	var directionsTable = $('#directions-table').empty();
	var startRow = locationPrototype.clone(true).attr("id", "location0");
	startRow.find('div.location-label').empty().append(directionData.sLabel);
	startRow.find('div.location-address').empty().append(directionData.start);
	directionsTable.append(startRow);
	for (var i=0; i < directionData.steps.length; i++) {
		var steps = directionData.steps[i];
		var stepsRow = stepsPrototype.clone(true).attr("id", "steps"+i);
		var stepsTable = stepsRow.find('.steps-table').empty();
		for (var j=0; j < steps.text.length; j++) {
			var s = steps.text[j];
			var instructionRow = instructionPrototype.clone(true).attr("id", "instruction"+i+"_"+j);
			instructionRow.find('div.instruction-text').empty().append(s);
			var instrIcon = instructionRow.find('.instruction-icon');
			if (s.indexOf("left") > -1) instrIcon.attr("src","/assets/map-left.png");
			else if (s.indexOf("right") > -1) instrIcon.attr("src","/assets/map-right.png");
			else if (s.indexOf("continue") > -1) instrIcon.attr("src","/assets/map-continue.png");
			var durationCell = instructionRow.find('.instruction-duration').closest('td');
			if (j==0) {
				durationCell.find('.instruction-duration').empty().append(steps.duration.text);
				durationCell.attr("rowspan",steps.text.length);
			} else {
				durationCell.remove();
			}
			stepsTable.append(instructionRow);
		}
		
		directionsTable.append(stepsRow);
		var destRow = locationPrototype.clone(true).attr("id", "location"+(i+1));
		destRow.find('div.location-label').empty().append(steps.dLabel);
		destRow.find('div.location-address').empty().append(steps.dAddr);
		directionsTable.append(destRow);
	}
}
function showAlternatePins(taskNo) {
function makeInitializer(id,taskNo,optNo) {
		return function(infobox){
			$("#"+id+" .pinPopover-useMe-button").click(function(){
				myRoute.tasks[taskNo].loc = altOptions[optNo];
				updateRouteForm();
				updateMap();
			});
		};
	}
	//clear old altPins
	for (var j=0; j<altPins.length; j++)
		MapControls.removePin(altPins[j]);
	altPins = [];
	//add new altPins
	var task = myRoute.tasks[taskNo];
	var altOptions = locationOptions[task.label];
	if (altOptions==undefined || $.type(altOptions)==="string")
		return;
	for (var j=0; j<altOptions.length; j++) {
		if (RouteTools.objsEqual(altOptions[j],task.loc))
			continue;
		var id = "pinPopover_"+taskNo+"_"+j;
		var $popover = makeBasicPopup(id,altOptions[j],task.label);
		$popover.find('img.pinPopover-useMe-button').show();
		var pinNum = MapControls.placePin(altOptions[j], taskNo, false, $popover.get(0), makeInitializer(id,taskNo,j));
		altPins.push(pinNum);
	}
	MapControls.recenter();
}
function setTimerangeDisp(baseId, range) {
	var l = baseId;
	//get type
	var t = "whenever";
	if (range.start!=undefined && range.end==undefined) {
		t = "after"
	} else if (range.start==undefined && range.end!=undefined) {
		t = "before"
	} else if (range.start!=undefined && range.end!=undefined) {
		if (range.start==range.end)
			t = "at"
		else
			t = "between"
	}
	//set text values
	$("#"+l+"_option").text(t);
	$("#"+l+"_option").val(t);
	$("#"+l+"_at").val(t==="at" ? myIntToString(range.start) : "");
	$("#"+l+"_after").val(myIntToString(range.start));
	$("#"+l+"_before").val(myIntToString(range.end));
	//set visibilities
	if (t==="at")						$("#"+l+"_at").show();
		else							$("#"+l+"_at").hide();
	if (t==="after" || t==="between")	$("#"+l+"_after").show();
		else							$("#"+l+"_after").hide();
	if (t==="between")					$("#"+l+"_and").show();
		else							$("#"+l+"_and").hide();
	if (t==="before" || t==="between")	$("#"+l+"_before").show();
		else							$("#"+l+"_before").hide();
}
function setCategorySelectedDisp($catContainer, val) {
	var imgs = $catContainer.find('img');
	for (var i=0; i<imgs.length; i++) {
		var found = $(imgs[i]);
		var oldSrc = found.attr("src");
		if (RouteTools.imgStringToPieces(oldSrc).name == val) {
			found.addClass("selected");
			RouteTools.alterImgUrlPiece(found,"dispMode","red2");
		} else {
			found.removeClass("selected");
			RouteTools.alterImgUrlPiece(found,"dispMode","blue2");
		}
	}
}
function setTaskAlertIcon($statusArea, task, taskNo) {
	var $img = $statusArea.find("img");
	if (task.error != undefined && task.error!="") {
		RouteTools.alterImgUrlPiece($img, "category", "taskIcons");
		RouteTools.alterImgUrlPiece($img, "name", "alert");
		$statusArea.attr("title",task.error);
		$statusArea.tooltip();
/*	} else if (task.loc != undefined) {
		var pinImgName = (taskNo<8 ? ""+(taskNo+1) : "blank");
		RouteTools.alterImgUrlPiece($img, "category", "pin");
		RouteTools.alterImgUrlPiece($img, "name", pinImgName);
		var imgSize = $img.attr("width");
		$img.attr("width",imgSize/2);
		$img.css('margin-left', function(index, curValue) {
			return parseInt(curValue,10) + (imgSize/4) + 'px';
		});
*/
	} else {
		$img.hide();
	}
}
function makeBasicPopup(id,loc,label) {
	var $popover = pinPopoverPrototype.clone(true).attr("id",id).show();
	var catName = RouteTools.coaxToCategory(label);
	var addrLines = RouteTools.addrStringToTwoLines(loc.addr);
	RouteTools.alterImgUrlPiece($popover.find("img.pinPopover-icon"), "name", catName);
	$popover.find("div.pinPopover-label").empty().append(label);
	$popover.find("div.pinPopover-name").empty().append(loc.name);
	$popover.find("div.pinPopover-address-1").empty().append(addrLines[0]);
	$popover.find("div.pinPopover-address-2").empty().append(addrLines[1]);
	$popover.find('img.pinPopover-useMe-button').hide();
	return $popover;
}


/* Stuff for reading from the displays */
function readTaskFromEditWindow(baseTask) {
	//baseTask needed since the form does not contain all fields
	var task = RouteTools.makeTask(baseTask);
	task.minutesNeeded = myStringToInt($('input#taskModal_minutesNeeded').val());
	task.whenToArrive = getTimerange("taskModal_arrive");
	task.whenToLeave = getTimerange("taskModal_leave");
	return task;
}
function readFavoriteFromEditWindow(baseFav) {
	//baseFav needed since the form does not contain all fields
	var fav = RouteTools.makeFavorite(baseFav);
	fav.name = $('input#favoritesModal_name').val();
	fav.notes = $('input#favoritesModal_notes').val();
	fav.category = $('input#favoritesModal_category').val();
	var addrPieces = RouteTools.addrStringToPieces($('input#favoritesModal_addr').val())
	var addrChanged = false;
	for (var k in addrPieces) {
		if (addrPieces[k]!=fav[k]) {
			fav[k] = addrPieces[k];
			addrChanged = true;
		}
	}
	if (addrChanged) {
		fav.latitude = undefined;
		fav.longitude = undefined;
	}
	return fav;
}
function getTimerange(baseId) {
	var range = {start:undefined, end:undefined};
	var t = $("#"+baseId+"_option").val();
	if (t==="at" || t==="after" || t==="between")
		range.start = myStringToInt($("#"+baseId+"_after").val());
	if (t==="before" || t==="between")
		range.end = myStringToInt($("#"+baseId+"_before").val());
	if (t==="at") {
		range.start = myStringToInt($("#"+baseId+"_at").val());
		range.end = range.start;
	}
	return range;
}


/* Server communication stuff */
function getUsernameAndId() {
	//we actually don't talk to the server at all: we use a hidden field
	var onSuccess = function(userInfo) {
		myUserInfo.id = userInfo.id;
		myUserInfo.name = userInfo.username;
		$('span#username').empty().append(myUserInfo.name);
		RouteTools.alterImgUrlPiece($('#login-button img'), "name", "signOut");
	}
	if (!FAKEIT) {
		var id = myStringToInt($("#hidden-userID").val());
		var username = $("#hidden-username").val();
		onSuccess({id:id, username:username});
	} else {
		onSuccess({id:TestData.fakeUserID, username:TestData.fakeUserName});
	}
}
function getHomeLoc() {
	$('div#homeAddr').empty().append("(getting from server...)");
	var onSuccess = function(newHomeLoc) {
		myUserInfo.homeLoc = {name:"Home", addr:newHomeLoc.addr, lat:newHomeLoc.lat, lon:newHomeLoc.lon};
		var addr = RouteTools.addrStringToPieces(myUserInfo.homeLoc.addr);
		$('div#homeAddr').empty().append(addr.street_1);
		var needsRedraw = false;
		for (var i=0; i<myRoute.tasks.length; i++) {
			var t = myRoute.tasks[i];
			if (t.label.toLowerCase()==="home") {
				needsRedraw = true;
				t.label = "Home";
				t.loc = myUserInfo.homeLoc;
				t.error = undefined;
				if (taskNoBeingEdited==i)	//we refresh it
					updateTaskEditWindow(t);
			}
		}
		if (needsRedraw)
			updateMap();
		showMsgMomentarily("Successfully obtained home address from server","info",1500);
	}
	var onFailure = function(err) {
		console.log("Failed to get home address from server: "+err);
		$('div#homeAddr').empty().append("???");
		showMsgMomentarily("Failed to get home address from server.","warning",3000);
	}
	if (!FAKEIT)
		doAjax("GET","/welcome/findHome.json",{},onSuccess,onFailure);
	else
		setTimeout(function(){onSuccess(TestData.fakeHomeLoc);}, 1000);
}
function getFavorites() {
	var onSuccess = function(newFavorites) {
		var currentlyEditing = (favoriteNoBeingEdited!=undefined);
		var currentlyEditingNewOne = currentlyEditing && (favoriteNoBeingEdited>=myUserInfo.favorites.length);
		myUserInfo.favorites = newFavorites;
		updateFavoritesList();
		if (currentlyEditingNewOne) {
			favoriteNoBeingEdited = myUserInfo.favorites.length;
		} else if (currentlyEditing) {
			favoriteNoBeingEdited = undefined;
			$("#favoritesModal").modal('hide');
		}
		showMsgMomentarily("Successfully obtained favorites from server","info",1500);
	}
	var onFailure = function(err) {
		console.log("Failed to get favorites from server: "+err);
		showMsgMomentarily("Failed to get favorites from server","warning",3000);
	}
	if (!FAKEIT)
		doAjax("GET","/favorites.json",{},onSuccess,onFailure);
	else
		setTimeout(function(){onSuccess(TestData.fakeFavorites);}, 3000);
}
function saveFavorite(fav) {
	fav.user_id = myUserInfo.id;
	if (busy) return;
	busy = true;
	showMsg("waiting on server...","info");
	var isNew = (fav.id==undefined || fav.id==-1);
	var ajaxVerb = (isNew) ? "POST" : "PUT";
	var ajaxPath = (isNew) ? "/favorites.json" : "/favorites/"+fav.id+".json";
	var onSuccess = function(filledOutFav) {
		busy = false;
		if (isNew) {
			myUserInfo.favorites.push(filledOutFav);
		} else {
			for (var i=0; i<myUserInfo.favorites.length; i++) {
				if (myUserInfo.favorites[i].id==filledOutFav.id)
					myUserInfo.favorites[i] = filledOutFav;
			}
		}
		updateFavoritesList();
		favoriteNoBeingEdited = undefined;
		$("#favoritesModal").modal('hide');
		showMsgMomentarily("Successfully saved favorite \""+filledOutFav.name+"\"","info",1500);
	}
	var onFailure = function(err) {
		busy = false;
		console.log("Failed to save favorite to server: "+err);
		showMsgMomentarily("Failed to save favorites to server","warning",3000);
	}
	if (!FAKEIT) {
		doAjax(ajaxVerb,ajaxPath,{favorite:fav},onSuccess,onFailure);
	} else {
		var fakeResults = RouteTools.makeFavorite(fav);
		if (fakeResults.id==-1)
			fakeResults.id = Math.floor((Math.random() * 100) + 1);
		setTimeout(function(){onSuccess(fakeResults);}, 3000);
	}
}
function fillInRouteWithFreshOptions() {
	if (busy) return;
	busy = true;
	showMsg("waiting on server...","info");
	//prepare request
	var knownPoints = [];
	var unresolvedLabels = [];
	for (var i=0; i<myRoute.tasks.length; i++) {
		var loc = myRoute.tasks[i].loc;
		if (loc==undefined)
			unresolvedLabels.push(myRoute.tasks[i].label);
		else
			knownPoints.push(RouteTools.locToLatLon(loc));
	}
	var requestBody = {
		fixedPoints: knownPoints,
		labels: unresolvedLabels,
		n: NUMOFNEARBYPOINTSTOGET
	};
	//prepare functions to respond to Ajax call, and execute it
	var onSuccess = function(reply) {
		busy = false;
		for (var k in reply)
			locationOptions[k] = reply[k];
		fillInRoute(myRoute, locationOptions);
		updateRouteForm();
		updateMap();
		if (RouteTools.routeIsFilledOut(myRoute)) {
			showMsgMomentarily("Success!","info",2000);
			getAndUpdateDirections();
		} else {
			showMsgMomentarily("Route could not be fully filled out","error",2000);
		}
	}
	var onFailure = function(err) {
		busy = false;
		console.log("Failed to get locations from server: "+err);
		showMsgMomentarily("Failed to get locations from server","error",3000);
	}
	if (!FAKEIT) {
		doAjax("GET","/welcome/getAllNearby.json",requestBody,onSuccess,onFailure);
	} else {
		var reply = {};
		for (var i=0; i<requestBody.labels.length; i++) {
			if (i%2 == 1)
				reply[requestBody.labels[i]] = "Test error message";
			else
				reply[requestBody.labels[i]] = TestData.makeFakeSuggestions(requestBody.labels[i]);
		}
		setTimeout(function(){onSuccess(reply);}, 1500);
	}
}


/* Processing functions */
function updateTaskLabelAndLoc(task, newText) {
	if (task.label === newText)
		return;
	//prepare wrapup function
	task.label = newText;
	task.loc = undefined;
	if (task.error != BADTIMECONSTRAINTSERROR)
		task.error = undefined;
	if (!busy)
		showMsg("getting new location for task \""+task.label+"\"","info");
	var wrapupFn = function(newLoc) {
		task.loc = newLoc;
		updateRouteForm();
		updateMap();
		if (!busy)
			showMsg("","info");
	};
	//find the new location then call the wrapup function.  Return once we hit a good option.
	if (newText.toLowerCase()==="home") {
		wrapupFn(myUserInfo.homeLoc);
		return;
	}
	for (var i=0; i<myUserInfo.favorites.length; i++) {
		if (myUserInfo.favorites[i].name.toLowerCase() === newText.toLowerCase()) {
			wrapupFn(RouteTools.favToLoc(myUserInfo.favorites[i]));
			return;
		}
	}
	if (RouteTools.isAddress(newText)) {
		MapControls.getLatLon(newText, function(latLon) {
			var retVal = latLon==undefined ? undefined : {
					name: newText,
					addr: newText,
					lat: latLon.lat,
					lon: latLon.lon
				};
			wrapupFn(retVal);
		});
		return;
	}
	wrapupFn(undefined);
}
function fillInRoute(route, locChoices) {
	//for now, this will be dead stupid: take the first choice every time.
	for (var i=0; i<route.tasks.length; i++) {
		var loc = route.tasks[i].loc;
		if (route.tasks[i].loc==undefined) {
			var res = locChoices[route.tasks[i].label];
			if (res==undefined) {
				route.tasks[i].error = "No suitable location found";
			} else if ($.type(res) === "string") {
				route.tasks[i].error = "No suitable location found: " + res;
			} else if (res.length==0) {
				route.tasks[i].error = "No suitable location found";
			} else {
				route.tasks[i].loc = res[0];
			}
		}
	}
};
function getAndUpdateDirections() {
	if (myRoute.tasks.length < 2)
		return;
	showMsg("Getting directions...","info");
	//prepare helper function
	function indexForWaypoint(waypoint_order, i) {
		// Takes an index of myRoute and translates it to the index we want to use
		if (i == 0 || i == (myRoute.tasks.length-1)) return i;
		return waypoint_order[i-1]+1;
	}
	//prepare helper function
	function translateDirections(googleDirections) {
		var dirRoute = googleDirections.routes[0];
		var waypoint_order = dirRoute.waypoint_order;
		var output = {
			steps: [],	//one step per stop, plus this blank one at the start
			sLabel: myRoute.tasks[0].label,
			start: myRoute.tasks[0].loc.addr
		};
		for (var i=0; i<dirRoute.legs.length; i++) {
			var index = indexForWaypoint(waypoint_order, i);
			var next = indexForWaypoint(waypoint_order, i+1);
			var leg = dirRoute.legs[index];
			var instructions = [];
			for (var j=0; j < leg.steps.length; j++)
				instructions.push(leg.steps[j].instructions);
				output.steps.push({
				text: instructions,
				dLabel: myRoute.tasks[next].label,
				dAddr: myRoute.tasks[next].loc.addr,
				duration: leg.duration
			});
		}
		return output;
	}
	//request the directions
	MapControls.getDirections(myRoute, function(googleDirections) {
		if (googleDirections==undefined) {
			showMsgMomentarily("Failed to get directions from google","error",2000);
		} else if (googleDirections.status != google.maps.DirectionsStatus.OK) {
			showMsgMomentarily("Failed to get directions from google: "+googleDirections.status,"error",2000);
		} else {
			showMsg("","info");
			MapControls.clearLines();
			MapControls.drawRoute(googleDirections, '#00FF00');
			var directionData = translateDirections(googleDirections);
			$("#route-input").hide();
			$("#route-output").show();
			updateDirections(directionData);
			updateBackgroundSizes();
		}
	});
};


/* Apply it all */
//when the window loads, initialize the map
google.maps.event.addDomListener(window, 'load', function() {
	MapControls.initialize('map-canvas');
	updateMap();
});
$(document).ready(function() {
	/* Tab-changing listeners and general listeners */
	$("a[data-toggle='tab']").on("shown.bs.tab", function(e) {
		var newTargetImg = $(e.target).children().first();
		if (e.relatedTarget != undefined) {
			var oldTargetImg = $(e.relatedTarget).children().first();
			RouteTools.alterImgUrlPiece(oldTargetImg,"dispMode","normal");
		}
		RouteTools.alterImgUrlPiece(newTargetImg,"dispMode","clicked");
		updateBackgroundSizes();
	});
	$('#login-button').click(function(){
		$('#loginModal').modal('show');
	});

	/* Settings tab listeners */
	$("input#time-limit").change(function(){
		myRoute.minutesAvailiable = myStringToInt($(this).val());
		$(this).val(myIntToString(myRoute.minutesAvailiable));
	});
	$("#minimize-option-dropdown li a").click(function(){
		var t = $(this).text();
		myRoute.useShortestTime = (t==="time");
		$("#minimize-option").text($(this).text());
		$("#minimize-option").val($(this).text());
	});
	$("#distance-option-dropdown li a").click(function(){
		var t = $(this).text();
		mySettings.distInMiles = (t==="miles");
		$("#distance-option").text($(this).text());
		$("#distance-option").val($(this).text());
	});

	/* Routes tab listeners */
	var draggingFns = {
		getThingToMove: function(elem) {
			return elem.find('img');	//can't move a <td> or <tr> directly
		},
		onGrab: function(elem) {},
		onMove: function(elem, xChange, yChange) {},
		onRelease: function(elem, xChange, yChange) {
			var taskNo = getTaskNumber(elem);
			var numSpacesMoved = Math.round(yChange / TASKHEIGHT);
			if (Math.abs(xChange)>TASKHEIGHT*2)
				return;
			var newPos = taskNo + numSpacesMoved;
			if (taskNo == newPos) {
				myRoute.tasks[taskNo].flexibleOrdering = !(myRoute.tasks[taskNo].flexibleOrdering);
				updateRouteForm();
			} else {
				myRoute.tasks[taskNo].flexibleOrdering = false;
				RouteTools.moveTask(myRoute, taskNo, newPos);
				updateRouteForm();
				updateMap();
			}
		}
	}
	setDraggable($("a.move-button"), draggingFns);
	$("input.task-label").focusout(function(){
		var taskNo = getTaskNumber($(this));
		var newText = $(this).val();
		updateTaskLabelAndLoc(myRoute.tasks[taskNo], newText);
	});
	$("a.edit-button").click(function(){
		var tNum = getTaskNumber($(this));
		taskNoBeingEdited = tNum;
		updateTaskEditWindow(myRoute.tasks[tNum]);
		$('#taskModal').modal('show');
	});
	$("a.delete-button").click(function(){
		var taskNo = getTaskNumber($(this));
		var label = myRoute.tasks[taskNo].label;
		if (label==="") label = "empty";
		if (confirm("Are you sure you want to delete task #"+(taskNo+1)+" ("+label+")?")) {
			RouteTools.deleteTask(myRoute, taskNo);
			updateRouteForm();
			updateMap();
			$("#add-stop-button").show();
		}
	});
/*	$(".taskStatus").hover(function(){
		var taskNo = getTaskNumber($(this));
		showAlternatePins(taskNo);
	});*/
	$("#add-stop-button").click(function(){
		RouteTools.addTask(myRoute, {});
		updateRouteForm();
		if (myRoute.tasks.length > 7) $(this).hide();
	});
	$("#route-find-button").click(function() {
		if (RouteTools.routeIsFilledOut(myRoute))
			getAndUpdateDirections();
		else
			fillInRouteWithFreshOptions();
	});
	$("#route-back-button").click(function() {
		$("#route-output").hide();
		$("#route-input").show();
		updateBackgroundSizes();
	});

	/* Favorites tab listeners */
	$('#favorites-table tr').click(function() {
		$(this).find("input:radio[name=favToAdd]").prop('checked', true).change();
	});
	$('a.favorite-edit-button').click(function(){
		console.log("clicked");
		var fNum = getFavoriteNumber($(this));
		favoriteNoBeingEdited = fNum;
		updateFavoriteEditWindow(myUserInfo.favorites[fNum]);
		$('#favoritesModal').modal('show');
	});
	$('#create-new-fav-button').click(function(){
		favoriteNoBeingEdited = myUserInfo.favorites.length;
		updateFavoriteEditWindow(RouteTools.EMPTYFAVORITE);
		$("#favoritesModal").modal('show');
	});
	$('#add-fav-to-route-button').click(function(){
		var checkedVal = $("input[name='favToAdd']:checked").val();
		if (checkedVal == undefined)
			return;
		var fav = myUserInfo.favorites[myStringToInt(checkedVal)];
		var taskInfo = {
			label: fav.name,
			loc: {name:fav.name, addr:RouteTools.piecesToAddrString(fav), lat:fav.latitude, lon:fav.longitude}
		};
		RouteTools.addTask(myRoute, taskInfo);
		updateRouteForm();
		$("a[href=#routeTab]").tab('show');
		showMsgMomentarily("added \""+fav.name+"\" to end of route","info",2000);
		updateMap();
	});
	
	/* Task-editing Modal listeners */
	function makeEditableTimerange(baseId) {
		var l = baseId;
		$("#"+l+"_option-dropdown li a").click(function(){
			var t = $(this).text();
			$("#"+l+"_option").text(t);
			$("#"+l+"_option").val(t);
			if (t==="at")						$("#"+l+"_at").show();
				else							$("#"+l+"_at").hide();
			if (t==="after" || t==="between")	$("#"+l+"_after").show();
				else							$("#"+l+"_after").hide();
			if (t==="between")					$("#"+l+"_and").show();
				else							$("#"+l+"_and").hide();
			if (t==="before" || t==="between")	$("#"+l+"_before").show();
				else							$("#"+l+"_before").hide();
		});
	}
	makeEditableTimerange("taskModal_arrive");
	makeEditableTimerange("taskModal_leave");
	$('#task-save-button').click(function() {
		if (taskNoBeingEdited!=undefined) {
			myRoute.tasks[taskNoBeingEdited] = readTaskFromEditWindow(myRoute.tasks[taskNoBeingEdited]);
			updateRouteForm();
		}
		taskNoBeingEdited = undefined;
		$("#taskModal").modal('hide');
	});
	$('#task-cancel-button').click(function() {
		$("#taskModal").modal('hide');
	});
	
	/* Favorite-editing Modal listeners */ 
	$('.favorite-category-icon').click(function() {
		var newCat = $(this).find('input').val();
		$('input#favoritesModal_category').val(newCat);
		setCategorySelectedDisp($('div#favoritesModal_category_container'), newCat);
	});
	$(".favorite-category-icon").hover(function() {
		var $img = $(($(this).find('img'))[0]);
		var oldMode = RouteTools.imgStringToPieces($img.attr("src")).dispMode;
		if (oldMode === "blue2")
			RouteTools.alterImgUrlPiece($img, 'dispMode', 'red1');
	}, function() {
		var $img = $(($(this).find('img'))[0]);
		var oldMode = RouteTools.imgStringToPieces($img.attr("src")).dispMode;
		if (oldMode === "red1")
			RouteTools.alterImgUrlPiece($img, 'dispMode', 'blue2');
	});
	$('#favorite-save-button').click(function() {
		if (favoriteNoBeingEdited!=undefined) {
			var favBase = (favoriteNoBeingEdited<myUserInfo.favorites.length) ? myUserInfo.favorites[favoriteNoBeingEdited] : RouteTools.EMPTYFAVORITE;
			var favToSave = readFavoriteFromEditWindow(favBase);
			saveFavorite(favToSave);
//			myUserInfo.favorites[favoriteNoBeingEdited] = favToSave;
//			updateFavoritesList();
		}
//		favoriteNoBeingEdited = undefined;
//		$("#favoritesModal").modal('hide');
	});
	$('#favorite-cancel-button').click(function() {
		favoriteNoBeingEdited = undefined;
		$("#favoritesModal").modal('hide');
	});
	
	/* General listeners */
	$('.actually-text-field').click(function() {
		var input = $(this).next();
		var value = $(this).html();
		if (value == "-----") value = "";
		$(this).html("");
		input.attr("value", value);
		$(this).hide();
		input.show();
		input.focus();
	});
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
	$('#password').click(function() {
		return confirm("Are you sure you want to change your password?");
	});
	$(".clickable-button").hover(function() {
		RouteTools.alterImgUrlPiece($(this), 'dispMode', 'hovered');
	}, function() {
		RouteTools.alterImgUrlPiece($(this), 'dispMode', 'normal');
	});
	
	/* Clone HTML needed for reference (AFTER event listeners are added) */
	taskPrototype = $('tr#taskPrototype').clone(true);
	favoritePrototype = $('tr#favoritePrototype').clone(true);
	pinPopoverPrototype = $('div#pinPopover_Prototype').clone(true);
	locationPrototype = $('tr#locationPrototype').clone(true);
	stepsPrototype = $('tr#stepsPrototype').clone(true);
	instructionPrototype = $('tr#instructionPrototype').clone(true);

	/* Make HTML match the data */
	var addr = (myUserInfo.homeLoc!=undefined) ? myUserInfo.homeLoc.addr : "???";
	$('div#homeAddr').empty().append(addr);
	updateFavoritesList();
	updateRouteForm();
	$("a[href=#routeTab]").tab('show');
	
	/* Start getting user info */
	getUsernameAndId();
	var isLoggedIn = (myUserInfo.name != "");
	if (myUserInfo.name != "") {
		$("div.overlay").hide();		//needed so the view isn't blocked when FAKEIT==true
		showMsg("Getting home address and favorites from server...","info");
		getHomeLoc();
		getFavorites();
	} else {
		$("#saveTab div.options-table-container").hide();
		$("#favoritesTab div.options-table-container").hide();
		$("#userTab div.options-table-container").hide();
	}
});

})("enroute-dhcs.herokuapp.com", RouteTools.ROUTESTARTINGATCMU);	//end IIAF
