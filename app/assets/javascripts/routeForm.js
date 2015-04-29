(function(ourServerUrl, initialRoute) {	//start IIAF
var TASKHEIGHT = 37;					//a rough number, for now
var NUMOFNEARBYPOINTSTOGET = 5;

var myRoute = initialRoute;
var myFavorites = [];
var mySettings = {distInMiles: true};
var cachedHomeLoc = undefined;
var taskNoBeingEdited = undefined;		//when saving changes, indicates which task gets the changes
var favoriteNoBeingEdited = undefined;	//when saving changes, indicates which favorite gets the changes
var mapReady = false;					//used to indicate whether it is safe to call the MapControls functions
var busy = false;						//indicates we're busy talking to the server, so the user can't spam "find route"
var currentSuggestionNum = 0;			//tracks calls to grabSuggestions() so we ignore old responses
var locationOptions = {};				//map of location options for a task, from server.  Format: {label1:[loc1,loc2,...],label2:[],...}, where loc has the format given by RouteTools.EMPTYTASK.loc
var taskPrototype, favoritePrototype;	//helps create new tasks/favorites; drawn from the HTML.  Will be filled in when the document is loaded.

/* WORK STILL NEEDED:
	make the pins numbered
	add task number to the front of the task's label
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
	$.ajax({ type: ty, url: "/"+action, data: dat
	}).done( function(reply) {
		onSuccess(reply)
	}).fail( function( xmlHttpRequest, statusText, errorThrown ) {
		alert("Ajax failed.\n\n"
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
	return parseInt(s,10) || undefined;
}
function myFloatToString(n) {
	return (n!=undefined ? ""+n : "");
}
function myStringToFloat(s) {
	return parseFloat(s) || undefined;
}


/* Stuff for route manipulation */
function deleteTask(number) {
	if (myRoute.tasks.length==1)
		myRoute.tasks[0] = RouteTools.makeTask({});
	else
		myRoute.tasks.splice(number,1);
	updateRouteForm();
	updateMap();
}
function addTask(t) {
	myRoute.tasks.push(RouteTools.makeTask(t));
	updateRouteForm();
	updateMap();
}
function moveTask(oldPos, newPos) {
	if (newPos<0) newPos = 0;
	if (newPos>myRoute.tasks.length) newPos = myRoute.tasks.length-1;
	var task = myRoute.tasks[oldPos];
	var insertAt = newPos + (newPos>oldPos?1:0);
	var removeAt = oldPos + (newPos<oldPos?1:0);
	myRoute.tasks.splice(insertAt,0,task);
	myRoute.tasks.splice(removeAt,1);
	updateRouteForm();
	updateMap();
}
function updateHome(newHomeLoc) {
	cachedHomeLoc = {name:"Home", addr:newHomeLoc.addr, lat:newHomeLoc.lat, lon:newHomeLoc.lon};
	for (var i=0; i<myRoute.tasks.length; i++) {
		var t = myRoute.tasks[i].label;
		if (t==="Home"||t==="HOME"||t==="home")
			myRoute.tasks[i].loc = cachedHomeLoc;
	}
	if ($('div#popup-task-editor').visible && taskNoBeingEdited!=undefined)
		updateTaskEditWindow(myRoute.tasks[taskNoBeingEdited]);	//we refresh it
	updateMap();
}


/* Stuff for updating the displays */
function showMessage(msg) {
	$('span#message').empty().append(msg);
}
function updateRouteForm() {
	//update task list display
	var tasksTable = $('#tasks-table').empty();
	for (var i=0; i<myRoute.tasks.length; i++) {
		var taskRow = taskPrototype.clone(true).attr("id","task"+i).show();
		taskRow.find('input.task-label').attr("value",myRoute.tasks[i].label);
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
}
function updateFavoritesList() {
	//update favorites list display
	var favoritesTable = $('#favorites-table').empty();
	for (var i=0; i<myFavorites.length; i++) {
		var favRow = favoritePrototype.clone(true).attr("id","favorite"+i).show();
		var v1 = favRow.find('.favorite-label');
		var v = favRow.find('.categoryTypeIcon');
		var oldSrc = favRow.find('.categoryTypeIcon').attr("src");
		var newIcon = RouteTools.categoryToImg(myFavorites[i].category);
		favRow.find('.categoryTypeIcon').attr("src",RouteTools.replaceUrlTail(oldSrc, newIcon));
		favRow.find('.favorite-label').empty().append(myFavorites[i].name);
		favoritesTable.append(favRow);
	}
}
function updateTaskEditWindow(task) {
	$('span#taskModal_label').empty().append("Task: "+task.label);
	$('input#taskModal_flexibleOrdering').attr('checked', task.flexibleOrdering);
	$('input#taskModal_minutesNeeded').val(myIntToString(task.minutesNeeded));
	setTimerangeDisp("taskModal_arrive", task.whenToArrive);
	setTimerangeDisp("taskModal_leave", task.whenToLeave);
}
function updateFavoriteEditWindow(fav) {
	$('input#favoritesModal_name').val(fav.name);
	$('input#favoritesModal_name').prev().empty().append(fav.name);
	$('input#favoritesModal_addr').val(fav.addr);
	$('input#favoritesModal_addr').prev().empty().append(fav.addd);
	$('input#favoritesModal_notes').val(fav.notes);
	$('input#favoritesModal_notes').prev().empty().append(fav.notes);
	$('input#favoritesModal_category').val(fav.category);
	setCategorySelected($('div#favoritesModal_category_container'), fav.category);
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
			var loc = myRoute.tasks.loc;
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
function setCategorySelected(catContainer, val) {
	var imgs = catContainer.find('img');
	var srcToFind = RouteTools.categoryToImg(val);
	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
	for (var i=0; i<imgs.length; i++) {
		var found = $(imgs[i]);
		var oldSrc = found.attr("src");
		if (found.hasClass("selected")) {
			found.removeClass("selected");
			var newSrc = RouteTools.replaceUrlTail(oldSrc, RouteTools.categoryIcon_toUnselected(oldSrc));
			found.attr("src", newSrc);
		}
		if (endsWith(found.attr("src"),srcToFind)) {
			found.addClass("selected");
			var newSrc = RouteTools.replaceUrlTail(oldSrc, RouteTools.categoryIcon_toSelected(srcToFind));
			found.attr("src", newSrc);
		}
	}
}

/* Stuff for reading from the displays */
function readTaskFromTaskEditWindow() {
	var formInfo = {whenToArrive:{}, whenToLeave:{}, loc:undefined};
	formInfo.label = $('input#popup-label').val();
	var loc = {
		addr: $('input#popup-address').val(),
		name: $('input#popup-businessName').val(),
		lat: myStringToFloat($('input#popup-lat').val()),
		lon: myStringToFloat($('input#popup-lon').val())
	};
	if (loc.addr!="" && loc.name!="" && loc.lat!=undefined && loc.lon!=undefined)
		formInfo.loc = loc;
	formInfo.flexibleOrdering = $('input#popup-flexibleOrdering').attr('checked');
	formInfo.minutesNeeded = myStringToInt($('input#popup-minutesNeeded').val());
	formInfo.startTime = myStringToInt($('input#popup-startTime').val());
	formInfo.endTime = myStringToInt($('input#popup-endTime').val());
	formInfo.whenToArrive.start = myStringToInt($('input#popup-whenToArrive-start').val());
	formInfo.whenToArrive.end = myStringToInt($('input#popup-whenToArrive-end').val());
	formInfo.whenToLeave.start = myStringToInt($('input#popup-whenToLeave-start').val());
	formInfo.whenToLeave.end = myStringToInt($('input#popup-whenToLeave-end').val());
	return RouteTools.makeTask(formInfo);
}
function readTaskFromFavoriteEditWindow() {
	alert("coming soon!");
}




/* AJAX stuff */
function getOptionsFromServer() {
	if (busy) return;
	busy = true;
	showMessage("waiting on server...");
	//prepare request
	var knownPoints = [];
	var unresolvedLabels = [];
	for (var i=0; i<myRoute.tasks.length; i++) {
		var loc = myRoute.tasks[i].loc;
		if (loc==undefined)
			unresolvedLabels.push(myRoute.tasks[i].label);
		else
			knownPoints.push(locToLatLon(loc));
	}
	var requestBody = {
		fixedPoints: knownPoints,
		labels: unresolvedLabels,
		n: NUMOFNEARBYPOINTSTOGET
	};
	alert("About to get options from server based on this request:\n"+requestBody);
	//prepare functions to respond to Ajax call, and execute it
	var onSuccess = function(reply) {
		showMessage("Success!");
		setTimeout(function(){showMessage("")}, 2000);	//clear message
		locationOptions = reply;
		fillInRoute(myRoute, locationOptions);
		updateRouteForm();
		updateMap();
		busy = false;
	}
	var onFailure = function(err) {
		showMessage("Failed");
		busy = false;
	}
	setTimeout(function(){onFailure("NotImplemented");}, 3000);	//pretend we're doing ajax here
	doAjax("GET","welcome/getAllNearby.json",requestBody,onSuccess,onFailure);
}
function asyncSetToHome() {
	if (cachedHomeLoc!=undefined) {
		myRoute.tasks[taskNo].loc = cachedHomeLoc;
	} else {
		var onFailure = function(err) { }
		//setTimeout(function(){updateHome(TestData.fakeHomeLoc);}, 2000);	//pretend we're doing ajax here
		doAjax("GET","welcome/findHome.json",{},updateHome,onFailure);
	}
}


/* Stuff for detailed task editing */
function hideEditTaskWindow(keepResults) {
	if (keepResults && taskNoBeingEdited!=undefined) {
		myRoute.tasks[taskNoBeingEdited] = readTaskFromTaskEditWindow();
		updateRouteForm();
		updateMap();
	}
	taskNoBeingEdited = undefined;
	$('div#popup-task-editor').hide();
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
		asyncSetToHome(taskNo);
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
function initDoStuff() {
	// Some initializing
	  // Show the routes tab (tab5) on init
	  // Sets the menu background
//	$('#tabs a[href="#tab5"]').tab('show');
	$('#menu-background').height($('#menu').height());
	var overlay = $("#overlay");
	overlay.height($(".tab-content").height());
}
function addPlanRouteListeners() {
	//add event listeners for main form
/*	var readMinutesAvailiableAndUpdate = function() {
		myRoute.minutesAvailiable = myStringToInt($(this).val);
		updateRouteForm();
	};*/
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
			moveTask(oldTaskNo, newPos);
		}
	}
	setDraggable($('a.move-button'), draggingFns);
	$('input.task-label').focusout(function(){setTimeout(hideQuickEditTaskWindow,150);});
	$('input.task-label').focusin(function(){setTimeout(showQuickEditTaskWindow(getTaskNumber($(this))),250);});
	$('input.task-label').keyup(function(){handleTaskLabelChange(getTaskNumber($(this)),$(this).val());});
	$('a.edit-button').click(function(){
		var tNum = getTaskNumber($(this));
		taskNoBeingEdited = tNum;
		updateTaskEditWindow(myRoute.tasks[tNum]);
	});
	$('a.delete-button').click(function(){
		var taskNo = getTaskNumber($(this));
		var label = myRoute.tasks[taskNo].label;
		if (label==="") label = "empty";
		if (confirm("Are you sure you want to delete task #"+(taskNo+1)+" ("+label+")?"))
			deleteTask(taskNo);
	});
	$('#add-stop-button').click(function(){addTask({});});
/*	$("input[name='least']").change(function(){myRoute.useShortestTime=($(this).val()==='time');});
	$('input#time-limit').change(readMinutesAvailiableAndUpdate);*/
	$('#route-find-button').click(getOptionsFromServer);
	$("#route-find-button").click(function() {
		$("#route-input").hide();
		$("#route-output").show();
		$('#menu-background').height($('#menu').height());
	});
	$("#route-back-button").click(function() {
		$("#route-output").hide();
		$("#route-input").show();
		$('#menu-background').height($('#menu').height());
	});
/*	//add event listeners for popup menu
	$('button#accept-popup-task-editor').click(function(){hideEditTaskWindow(true);});
	$('button#cancel-popup-task-editor').click(function(){hideEditTaskWindow(false);});*/
}
$(document).ready(function() {
	initDoStuff();
	
	/* Tab-changing listeners */
	// Changes image on menu tab bar icons when selected
alert("not done");
	$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
alert(e);
	  var target = $(e.target).children().first();
alert(target);
	  //target.attr("src" , '<%= image_path "tab-ClickOn-" + target.attr("name") + ".png" %>' );
	  target.attr("src", "tab-ClickOn-" + target.attr("name") + ".png");
	  var related = $(e.relatedTarget).children().first();
alert(related);
	  //target.attr("src" , '<%= image_path "tab-Normal-" + related.attr("name") + ".png" %>' );
	  related.attr("src", "tab-Normal-" + related.attr("name") + ".png");
	  $('#menu-background').height($('#menu').height());

	  var overlay = $(".overlay");
	  overlay.height($(".tab-content").height());
	});
	
	/* Settings tab listeners */
	$("#minimize-option-dropdown li a").click(function(){
		$("#minimize-option").text($(this).text());
		$("#minimize-option").val($(this).text());
	});
	$("#distance-option-dropdown li a").click(function(){
		$("#distance-option").text($(this).text());
		$("#distance-option").val($(this).text());
	});

	/* Routes tab listeners */
	addPlanRouteListeners();

	/* Favorites tab listeners */
	// Selects the favorite when user clicks anywhere in a row in Favorites tab
	$('a.favorite-edit-button').click(function(){
		var fNum = getFavoriteNumber($(this));
		favoriteNoBeingEdited = fNum;
		updateFavoriteEditWindow(myFavorites[fNum]);
	});
	$('#favorite-table tr').click(function() {
		$( this ).find("input:radio[name=favToAdd]").prop('checked', true).change();
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
	
	/* Favorite-editing Modal listeners */ 
	// Add listeners to "back" and "ok"
	$('#favorite-back-button').click(function() {
		$('#favoritesModal').modal('hide');
	});
	$('#favorite-save-button').click(function() {
		alert("I should do stuff here");
		$('#favoritesModal').modal('hide');
	});
	// Visually changes category icon in Edit Favorite modal when selected
	$('.favorite-category-icon').click(function() {
		var newCat = $(this).find('input').val();
		$('input#favoritesModal_category').val(newCat);
		setCategorySelected($('div#favoritesModal_category_container'), newCat);
	});
	
	// Set up relationship between .actually-text-field and .not-actually-text-field
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
	
	//clone HTML needed for reference (AFTER event listeners are added)
	taskPrototype = $('tr#taskPrototype').clone(true);
	favoritePrototype = $('tr#favoritePrototype').clone(true);
	//make HTML match the data
	myFavorites = TestData.fakeFavorites;
	updateRouteForm();
	updateMap();
	updateFavoritesList();
/*	updateLocChoicesArea([]); */
});

})("enroute-dhcs.herokuapp.com", RouteTools.ROUTESTARTINGATCMU);	//end IIAF