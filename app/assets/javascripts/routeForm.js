(function(ourServerUrl, initialRoute) {	//start IIAF
var TASKHEIGHT = 36;				//a rough number, for now
var NUMOFNEARBYPOINTSTOGET = 5;

var myRoute = initialRoute;
var busy = false;					//indicates we're busy talking to the server, so the user can't spam "find route"
var taskNoBeingEdited = undefined;	//multipurpose variable signaling the currently-focused task
var locationOptions = {};			//options from server for a task.  Format: {label1:[loc1,loc2,...],label2:[],...}, where loc has the format given by RouteTools.EMPTYLOC
var currentSuggestionNum = 0;		//tracks calls to grabSuggestions() so we ignore old responses
var taskPrototype;					//helps us create tasks; drawn from the HTML.  Will be filled in when the document is loaded.
var cachedHomeLoc = undefined;

/* WORK STILL NEEDED:
	make the pins numbered
	add task number to the front of the task's label
	
*/


/* Helper functions */
function getTaskNumber($o) {
	var taskId = $o.closest("tr").attr("id");
	var numAsString = taskId.substring(4,taskId.length);
	return parseInt(numAsString,10);
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


/* Stuff for the ordering of tasks */
function deleteTask(number) {
	if (myRoute.tasks.length==1)
		myRoute.tasks[0] = RouteTools.makeTask({});
	else
		myRoute.tasks.splice(number,1);
	updateForm();
	updatePins();
}

function addTask() {
	myRoute.tasks.push(RouteTools.makeTask({}));
	updateForm();
	updatePins();
}

function moveTask(oldPos, newPos) {
	if (newPos<0) newPos = 0;
	if (newPos>myRoute.tasks.length) newPos = myRoute.tasks.length-1;
	var task = myRoute.tasks[oldPos];
	var insertAt = newPos + (newPos>oldPos?1:0);
	var removeAt = oldPos + (newPos<oldPos?1:0);
	myRoute.tasks.splice(insertAt,0,task);
	myRoute.tasks.splice(removeAt,1);
	updateForm();
	updatePins();
}

function showDeleteTaskWindow(number) {
	var label = myRoute.tasks[number].label;
	if (label==="") label = "empty";
	if (confirm("Are you sure you want to delete task #"+(number+1)+" ("+label+")?"))
		deleteTask(number);
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
	//prepare functions to respond to Ajax call, and execute it
	var onSuccess = function(reply) {
		showMessage("Success!");
		setTimeout(function(){showMessage("")}, 2000);	//clear message
		locationOptions = reply;
		fillInRoute(myRoute, locationOptions);
		updateForm();
		updatePins();
		busy = false;
	}
	var onFailure = function(err) {
		showMessage("Failed");
		busy = false;
	}
	setTimeout(function(){onFailure("NotImplemented");}, 3000);	//pretend we're doing ajax here
	doAjax("GET","welcome/getAllNearby.json",{fixedPoint:[lat,lon], label:label, num:n},onSuccess,onFailure);
}
function asyncSetToHome(taskNo) {
	if (cachedHomeLoc!=undefined) {
		myRoute.tasks[taskNo].loc = cachedHomeLoc;
	} else {
		var fakeUserName = "Bob";
		var fakeHomeLoc = { name: "Home", addr: "123 Fake Street, Pittsburgh PA 12345",lat: 10,lon:11};
		//prepare functions to respond to Ajax call, and execute it
		var userName = fakeUserName;
		var onSuccess = function(reply) {
			cachedHomeLoc = {name:"Home", addr:reply.addr, lat:reply.lat, lon:reply.lon};
			myRoute.tasks[taskNo].loc = cachedHomeLoc;
			if ($('div#popup-task-editor').visible)
				showEditTaskWindow(taskNo);	//we refresh it
			updatePins();
		}
		var onFailure = function(err) {
		}
		//setTimeout(function(){onSuccess(fakeHomeLoc);}, 2000);	//pretend we're doing ajax here
		doAjax("GET","welcome/findHome.json",{apple:userName},onSuccess,onFailure);
	}
}


/* Stuff for detailed task editing */
function showEditTaskWindow(number) {
	taskNoBeingEdited = number;
	updateTaskEditWindow(myRoute.tasks[number]);
	$('div#popup-task-editor').show();
	$('div#popup-locChoices').hide();
}
function hideEditTaskWindow(keepResults) {
	if (keepResults && taskNoBeingEdited!=undefined) {
		myRoute.tasks[taskNoBeingEdited] = readTaskFromTaskEditWindow();
		updateForm();
		updatePins();
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


/* Stuff for form updating */
function showMessage(msg) {
	$('span#message').empty().append(msg);
}
function updateForm() {
	//update table display
	var tasksTable = $('table#tasks').empty();
	for (var i=0; i<myRoute.tasks.length; i++) {
		var taskRow = taskPrototype.clone(true).attr("id","task"+i).show();
		var labelText = myRoute.tasks[i].label;
		taskRow.find('td.task-label').find('input').attr("value",labelText);
		tasksTable.append(taskRow);
	}
	//update the rest of the form
	if (myRoute.useShortestTime)
		$("input#least-time").attr("checked", true);
	else
		$('input#least-distance').attr("checked", true);
	$('input#time-limit').val(myIntToString(myRoute.minutesAvailiable));
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
function updatePins() {
/*	MapControls.clearMap();
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
function updateTaskEditWindow(task) {
	$('input#popup-label').val(task.label);
	if (task.loc!=undefined) {
		$('input#popup-address').val(task.loc.addr);
		$('input#popup-businessName').val(task.loc.name);
		$('input#popup-lat').val(myFloatToString(task.loc.lat));
		$('input#popup-lon').val(myFloatToString(task.loc.lon));
	} else {
		$('input#popup-address').val("");
		$('input#popup-businessName').val("");
		$('input#popup-lat').val("");
		$('input#popup-lon').val("");
	}
	$('input#popup-flexibleOrdering').attr('checked', task.flexibleOrdering);
	$('input#popup-minutesNeeded').val(myIntToString(task.minutesNeeded));
	$('input#popup-startTime').val(myIntToString(task.startTime));
	$('input#popup-endTime').val(myIntToString(task.endTime));
	$('input#popup-whenToArrive-start').val(myIntToString(task.whenToArrive.start));
	$('input#popup-whenToArrive-end').val(myIntToString(task.whenToArrive.end));
	$('input#popup-whenToLeave-start').val(myIntToString(task.whenToLeave.start));
	$('input#popup-whenToLeave-end').val(myIntToString(task.whenToLeave.end));
}
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
$(document).ready(function() {
	//add event listeners for main form
	var readMinutesAvailiableAndUpdate = function() {
		myRoute.minutesAvailiable = myStringToInt($(this).val);
		updateForm();
	};
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
	setDraggable($('td.move-button'), draggingFns);
	$('td.task-label').find('input').focusout(function(){setTimeout(hideQuickEditTaskWindow,150);});
	$('td.task-label').find('input').focusin(function(){setTimeout(showQuickEditTaskWindow(getTaskNumber($(this))),250);});
	$('td.task-label').find('input').keyup(function(){handleTaskLabelChange(getTaskNumber($(this)),$(this).val());});
	$('td.edit-button').click(function(){showEditTaskWindow(getTaskNumber($(this)));});
	$('td.delete-button').click(function(){showDeleteTaskWindow(getTaskNumber($(this)));});
	$('button#add-stop').click(addTask);
	$("input[name='least']").change(function(){myRoute.useShortestTime=($(this).val()==='time');});
	$('input#time-limit').change(readMinutesAvailiableAndUpdate);
	$('button#find-route').click(getOptionsFromServer);
	//add event listeners for popup menu
	$('button#accept-popup-task-editor').click(function(){hideEditTaskWindow(true);});
	$('button#cancel-popup-task-editor').click(function(){hideEditTaskWindow(false);});
	//clone HTML needed for reference (AFTER event listeners are added)
	taskPrototype = $('tr#taskPrototype').clone(true);
	//make HTML match the data
	updateForm(myRoute.tasks);
	updateLocChoicesArea([]);
	updatePins();
});

})("localhost:3000", RouteTools.ROUTESTARTINGATCMU);	//end IIAF
