(function(ourServerUrl, initialRoute) {	//start IIAF
var FAKEIT = false;	//if FAKEIT==true, fake talking to backend (lets us pretend we're logged in)
var TASKHEIGHT = 37;					//a rough number, for now
var NUMOFNEARBYPOINTSTOGET = 5;

var myUserInfo = { name:"", homeLoc:undefined, favorites:[] };
var myRoute = initialRoute;				//one difference between this and a normal route as seen in RouteTools: here, tasks may have an additional field "error"
var mySettings = {distInMiles: true};
var taskNoBeingEdited = undefined;		//when saving changes, indicates which task gets the changes
var favoriteNoBeingEdited = undefined;	//when saving changes, indicates which favorite gets the changes
var mapReady = false;					//used to indicate whether it is safe to call the MapControls functions
var busy = false;						//indicates we're busy talking to the server, so the user can't spam "find route"
var locationOptions = {};				//map of location options for a task, from server.  Format: {label1:[loc1,loc2,...],label2:[],...}, where loc has the format given by RouteTools.EMPTYTASK.loc
var taskPrototype, favoritePrototype;	//helps create new tasks/favorites; drawn from the HTML.  Will be filled in when the document is loaded.

/* WORK STILL NEEDED:
	--get a successfull getFavorites() test not using FAKEIT
	--add the ability to alter a favorite, which includes looking up lat/lon and talking to the server
	--getting location choices from the backend
		--decide between fixed points and unknowns
		--set task.error as needed
	--get pins to display on map properly: involves altering or removing updateMap()
	--Make fillInRoute() !!!
	--everything in page two of the routes tab...
	--the popup for details that appears near pins on the map...
	--let the user change the chosen location...
		--will involve altering or removing: updateLocChoicesArea, handleTaskLabelChange, takeSuggestion, showQuickEditTaskWindow, hideQuickEditTaskWindow
	--detecting impossible conditions before talking to backend (and setting task.error accordingly)
	--timepicker for the times ("chronic" gem recommended)
	--kill login popup: take user to a new page instead
	--confirm working of password change (or, better, disable it, since they'd need to go to a new page, anyhow)
	--have option on the front page to NOT log in, but rather go straight to the map
	--add pages: /about, /privacy, /feedback (or just remove the links to them)
	
	--Make the images all transparent again
	--get rid of the ugly black in the background when you mouse-over an <a> tag
	--update all the textButtons: wrap in an <a> so that the icon changes when hover over, and put the id in the <a> rather than the <img>
		--POSSIBLY make the image change when hover over (RouteTools.alterImgUrlPiece is useful for this)
	--make favorites scrollable if it gets too long
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
function showMsgMomentarily(msg,type,time) {
	showMsg(msg,type);
	setTimeout(function(){showMsg("","info")}, time);
}


/* Stuff for updating the displays */
function showMsg(msg,type) {
	var msgTypes = ["error", "warning", "info"];
	$('span.statusMessage').empty().append(msg);
	for (var i=0; i<msgTypes.length; i++)
		$('span.statusMessage').removeClass(msgTypes[i]);
	if (msgTypes.indexOf(type) != -1)
		$('span.statusMessage').addClass(type);
}
function updateBackgroundSizes() {
	$('#menu-background').height($('#menu').height());
	$(".overlay").height($(".tab-content").height());
}
function updateRouteForm() {
	//update task list display
	var tasksTable = $('#tasks-table').empty();
	for (var i=0; i<myRoute.tasks.length; i++) {
		var taskRow = taskPrototype.clone(true).attr("id","task"+i).show();
		taskRow.find('input.task-label').attr("value",myRoute.tasks[i].label);
		setTaskAlertIcon(taskRow.find('.taskStatus'), myRoute.tasks[i], i);
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
	updateBackgroundSizes();
}
function updateFavoritesList() {
	var favoritesTable = $('#favorites-table').empty();
	for (var i=0; i<myUserInfo.favorites.length; i++) {
		var favRow = favoritePrototype.clone(true).attr("id","favorite"+i).show();
		favRow.find("input:radio[name=favToAdd]").val(""+i);
		favRow.find('.favorite-label').empty().append(myUserInfo.favorites[i].name);
		RouteTools.alterImgUrlPiece(favRow.find('.categoryTypeIcon'), "name", myUserInfo.favorites[i].category);
		favoritesTable.append(favRow);
	}
	updateBackgroundSizes();
}
function updateTaskEditWindow(task) {
	$('span#taskModal_label').empty().append("Task: "+task.label);
	$('input#taskModal_flexibleOrdering').prop('checked', task.flexibleOrdering);
	$('input#taskModal_minutesNeeded').val(myIntToString(task.minutesNeeded));
	setTimerangeDisp("taskModal_arrive", task.whenToArrive);
	setTimerangeDisp("taskModal_leave", task.whenToLeave);
}
function updateFavoriteEditWindow(fav) {
	function strOrDashes(s) {
		return (s==="" ? "-----" : s);
	}
	$('input#favoritesModal_name').val(fav.name);
	$('input#favoritesModal_name').prev().empty().append(strOrDashes(fav.name));
	$('input#favoritesModal_addr').val(fav.addr);
	$('input#favoritesModal_addr').prev().empty().append(strOrDashes(fav.addr));
	$('input#favoritesModal_notes').val(fav.notes);
	$('input#favoritesModal_notes').prev().empty().append(strOrDashes(fav.notes));
	$('input#favoritesModal_category').val(fav.category);
	setCategorySelectedDisp($('div#favoritesModal_category_container'), fav.category);
}
function updateLocChoicesArea(locSuggestions) {
	//update message display
	if (locSuggestions==undefined || locSuggestions.length==0) {
		$('span#locChoices-message').empty().append("No suitable locations found (click \"Find Route\" to try again)");
		$('ul#locChoices-list').empty();
		return;
	}
	$('span#locChoices-message').empty().append("Location choices:");
	var htmlLocList = $('ul#locChoices-list').empty();
	function makeCallbackFn(num) {	//see http://stackoverflow.com/questions/7053965/when-using-callbacks-inside-a-loop-in-javascript-is-there-any-way-to-save-a-var
		return function() { takeSuggestion(num); };
	};
	for (var i=0; i<locSuggestions.length; i++) {
		var loc = $('<li>').click(makeCallbackFn(i)).append(locSuggestions[i].name+": "+locOps[i].addr);
		htmlLocList.append(loc);
	}
}
function updateMap() {
	if (mapReady) {
/*		MapControls.clearMap();
		var prevPinNum = undefined;
		for (var i=0; i<myRoute.tasks.length; i++) {
			var loc = myRoute.tasks[i].loc;
			if (loc!=undefined) {
				var pinNum = MapControls.placePin(locToLatLon(loc, "pin.png"));
				if (prevPinNum!=undefined)
					var lineNum = MapControls.addLine(prevPinNum, pinNum);
				prevPinNum = pinNum;
			}
		}
		MapControls.recenter();*/
	}
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
			RouteTools.alterImgUrlPiece(found,"dispMode","red1");
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
	} else if (task.loc != undefined) {
		var pinImgName = (taskNo<8 ? ""+(taskNo+1) : "blank");
		RouteTools.alterImgUrlPiece($img, "category", "pin");
		RouteTools.alterImgUrlPiece($img, "name", pinImgName);
		var imgSize = $img.attr("width");
		$img.attr("width",imgSize/2);
		$img.css('margin-left', function(index, curValue) {
			return parseInt(curValue,10) + (imgSize/4) + 'px';
		});
	} else {
		$img.hide();
	}
}


/* Stuff for reading from the displays */
function readTaskFromEditWindow(baseTask) {
	//baseTask needed since the form does not contain all fields
	var task = RouteTools.makeTask(baseTask);
	task.flexibleOrdering = $('input#taskModal_flexibleOrdering').prop('checked');
	task.minutesNeeded = myStringToInt($('input#taskModal_minutesNeeded').val());
	task.whenToArrive = getTimerange("taskModal_arrive");
	task.whenToLeave = getTimerange("taskModal_leave");
	return task;
}
function readFavoriteFromEditWindow() {
	var fav = {};
	fav.name = $('input#favoritesModal_name').val();
	fav.addr = $('input#favoritesModal_addr').val();
	fav.notes = $('input#favoritesModal_notes').val();
	fav.category = $('input#favoritesModal_category').val();
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
function getUsername() {
	//we actually don't talk to the server at all: we use a hidden field
	var onSuccess = function(newUsername) {
		myUserInfo.name = newUsername;
		$('span#username').empty().append(myUserInfo.name);
	}
	if (!FAKEIT)
		onSuccess($("#hidden-username").val());
	else
		onSuccess(TestData.fakeUserName);
}
function getHomeLoc() {
	showMsg("Getting home address from server...","info");
	$('span#homeAddr').empty().append("(getting from server...)");
	var onSuccess = function(newHomeLoc) {
		myUserInfo.homeLoc = {name:"Home", addr:newHomeLoc.addr, lat:newHomeLoc.lat, lon:newHomeLoc.lon};
		$('span#homeAddr').empty().append(myUserInfo.homeLoc.addr);
		for (var i=0; i<myRoute.tasks.length; i++) {
			var t = myRoute.tasks[i];
			if (t.label==="Home"||t.label==="HOME"||t.label==="home") {
				t.label = "Home";
				t.loc = myUserInfo.homeLoc;
				t.error = undefined;
				if (taskNoBeingEdited==i)	//we refresh it
					updateTaskEditWindow(t);
			}
		}
		updateMap();
		showMsgMomentarily("Successfully obtained home address from server","info",1500);
	}
	var onFailure = function(err) {
		console.log("Failed to get home address from server: "+err);
		$('span#homeAddr').empty().append("???");
		showMsgMomentarily("Failed to get home address from server.","warning",3000);
	}
	if (!FAKEIT)
		doAjax("GET","/welcome/findHome.json",{},onSuccess,onFailure);
	else
		setTimeout(function(){onSuccess(TestData.fakeHomeLoc);}, 1000);	//pretend we're doing ajax here
}
function getFavorites() {
	showMsg("Getting favorites from server...","info");
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
		showMsgMomentarily("Failed to get favorites from server.","warning",3000);
	}
	if (!FAKEIT)
		doAjax("GET","/favorites.json",{},onSuccess,onFailure);
	else
		setTimeout(function(){onSuccess(TestData.fakeFavorites);}, 3000);	//pretend we're doing ajax here
}
function getOptionsFromServer() {
alert("getOptionsFromServer() isn't ready!");
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
	alert("About to get options from server based on this request:\n"+requestBody);
	//prepare functions to respond to Ajax call, and execute it
	var onSuccess = function(reply) {
		showMsgMomentarily("Success!","info",2000);
		locationOptions = reply;
		fillInRoute(myRoute, locationOptions);
		updateRouteForm();
		updateMap();
		busy = false;
	}
	var onFailure = function(err) {
		console.log("Failed to get locations from server: "+err);
		showMsgMomentarily("Failed to get locations from server","error",3000);
		busy = false;
	}
	if (!FAKEIT)
		doAjax("GET","/welcome/getAllNearby.json",requestBody,onSuccess,onFailure);
	else
		setTimeout(function(){onFailure("NotImplemented");}, 3000);	//pretend we're doing ajax here
}


/* Stuff for quick task editing */
function showQuickEditTaskWindow(number) {
	taskNoBeingEdited = number;
	updateLocChoicesArea(locationOptions[myRoute.tasks[number].label]);
	$('div#popup-task-editor').hide();
	$('div#popup-locChoices').show();
}
function takeSuggestion(suggestionNumber) {
	if (taskNoBeingEdited==undefined) return;
	var task = myRoute.tasks[taskNoBeingEdited];
	var locOps = locationOptions[task.label];
	if (locOps==undefined || locOps.length<=suggestionNumber) return;
	task.loc = locOps[suggestionNumber];
	hideQuickEditTaskWindow();
}
function hideQuickEditTaskWindow() {
	taskNoBeingEdited = undefined;
	$('div#popup-locChoices').hide();
}
var handleTaskLabelChange = function(taskNo, newText) {
	myRoute.tasks[taskNo].label = newText;
	myRoute.tasks[taskNo].loc = undefined;
	if (newText==="Home"||newText==="HOME"||newText==="home")
		myRoute.tasks[taskNo].loc = myUserInfo.homeLoc;
}


/* The main thinker function */
function fillInRoute(route, locChoices) {
	//for now, this will be dead stupid: take the first choice every time.
	for (var i=0; i<route.tasks.length; i++) {
		var loc = route.tasks[i].loc;
		if (route.tasks[i].loc==undefined) {
			var choices = locChoices[route.tasks[i].label];
			if (choices!=undefined && choices.length!=0)
				route.tasks[i].loc = choices[0];
		}
	}
};


/* Apply it all */
//when the window loads, initialize the map
/*google.maps.event.addDomListener(window, 'load', function() {
	MapControls.initialize('map-canvas');
	mapReady=true;
	updateMap();
});*/
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
			var numSpacesMoved = Math.round(yChange / TASKHEIGHT);
			if (Math.abs(xChange)>TASKHEIGHT*2 || numSpacesMoved==0)
				return;
			var oldTaskNo = getTaskNumber(elem);
			var newPos = oldTaskNo + numSpacesMoved;
			RouteTools.moveTask(myRoute, oldTaskNo, newPos);
			updateRouteForm();
			updateMap();
		}
	}
	setDraggable($("a.move-button"), draggingFns);
//	$("input.task-label").focusout(function(){setTimeout(hideQuickEditTaskWindow,150);});
//	$("input.task-label").focusin(function(){setTimeout(showQuickEditTaskWindow(getTaskNumber($(this))),250);});
//	$("input.task-label").keyup(function(){handleTaskLabelChange(getTaskNumber($(this)),$(this).val());});
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
		}
	});
	$("#add-stop-button").click(function(){
		RouteTools.addTask(myRoute, {});
		updateRouteForm();
		updateMap();
	});
	$("#route-find-button").click(function() {
		getOptionsFromServer();
		$("#route-input").hide();
		$("#route-output").show();
		updateBackgroundSizes();
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
			loc: {name:fav.name, addr:fav.addr, lat:fav.lat, lon:fav.lon}
		};
		RouteTools.addTask(myRoute, taskInfo);
		updateRouteForm();
		updateMap();
		showMsgMomentarily("added \""+fav.name+"\" to end of route","info",2000);
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
			updateMap();
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
	$('#favorite-save-button').click(function() {
		if (favoriteNoBeingEdited!=undefined) {
			myUserInfo.favorites[favoriteNoBeingEdited] = readFavoriteFromEditWindow();
			updateFavoritesList();
		}
		favoriteNoBeingEdited = undefined;
		$("#favoritesModal").modal('hide');
	});
	$('#favorite-cancel-button').click(function() {
		$("#favoritesModal").modal('hide');
	});
	
	/* Set up relationship between .actually-text-field and .not-actually-text-field */
	$('.actually-text-field').click(function() {
		var input = $(this).next();
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
	
	/* Clone HTML needed for reference (AFTER event listeners are added) */
	taskPrototype = $('tr#taskPrototype').clone(true);
	favoritePrototype = $('tr#favoritePrototype').clone(true);

	/* Make HTML match the data */
	var addr = (myUserInfo.homeLoc!=undefined) ? myUserInfo.homeLoc.addr : "???";
	$('span#homeAddr').empty().append(addr);
	updateFavoritesList();
	updateRouteForm();
	updateMap();
//	updateLocChoicesArea([]);
	$("a[href=#routeTab]").tab('show');
	
	/* Start getting user info */
	getUsername();
	var isLoggedIn = (myUserInfo.name != "");
	if (myUserInfo.name != "") {
		$("div.overlay").hide();		//needed so we can see stuff when FAKEIT==true
		getHomeLoc();
		getFavorites();
	} else {
		$("#saveTab div.options-table-container").hide();
		$("#favoritesTab div.options-table-container").hide();
		$("#userTab div.options-table-container").hide();
	}
});

})("enroute-dhcs.herokuapp.com", RouteTools.ROUTESTARTINGATCMU);	//end IIAF

/* What was the point in this?  I just removed it, for now
	$('#favorite-form input').on('change', function() {
		 $('input[name=favToAdd]', '#favorite-form').parent().parent().find("#favorites-edit-button").hide();
		 $('input[name=favToAdd]:checked', '#favorite-form').parent().parent().find("#time-options-button").show();
	  });
*/
