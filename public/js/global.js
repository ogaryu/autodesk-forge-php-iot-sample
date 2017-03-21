var viewer;
var pusher;
var documentJsonData = '';
var currentSelectionLevel= '';
var currentSelectionRoom= '';
var currentSelectionNodeWithGUID = '';
var roomMeshData = [];
var roomLabel = "部屋";

$(document).ready(function(){
	
	setEventHandlers();

	setAjaxForm();
	
});

var setEventHandlers = function(){

	$("#loginbtn").click(function() {

		$.ajaxSetup({
			headers: {
				'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
			}
		});

		$.ajax({
			url: '/authenticate',
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: {},
			async: false,
			success: function (data) {

				var data = JSON.parse(data);

				var authwindow = popupCenter(data['url'], "Autodesk Login", 800, 400);

				authwindow.onload = function() {
				};
			},
			error: function () {

			}
		});

	});

	$("#logoutbtn").click(function() {

		$.ajaxSetup({
			headers: {
				'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
			}
		});

		$.ajax({
			type: "GET",
			url : "/logout",
			data : {},
			success : function(data){
				document.location.reload(true);
			}
		},"json");

	});

	$('.panel-heading').on('click', function(){
		var self = $(this);
		$('.panel .panel-heading').not(this).next().slideUp();
		$(this).next().slideDown();
	});

	$('.panel-heading').on('mouseover', function(){
		$(this).css('background-color', '#75acd4');
		$(this).css('cursor', 'pointer');
	});

	$('.panel-heading').on('mouseout', function(){
		$(this).css('background-color', '#92c6ec');
		$(this).css('cursor', 'pointer');
	});

	$('.header-right-btn').on('hover', function(){
		$(this).css('background-color', '#dedede');
		$(this).css('cursor', 'pointer');
	});

	// get Pusher client service object
	Pusher.logToConsole = true;

	pusher = new Pusher('944b0a219f0ce7b8efa4', {
		encrypted: true
	});

	// subscribe to Pusher to get sensors data
	$("#pusher-subscribe").click(function() {

		var channel = pusher.subscribe('iot_channel');

		channel.bind('iot_event', function(data) {

			var sensorlist = "";
			
			setEnvironmentData(data);
		});

		alert("pusher service subscribed");
	});
};

// common ajax request for form
var setAjaxForm = function(){

	$('.ajaxform').off('submit');

	$('.ajaxform').on('submit', function(e){

		e.preventDefault();

		var form = $(this);
		var dataString = form.serialize();
		var formAction = form.attr('action');
		var formRequest = form.attr('data-request-type');
		var formMethod = form.attr('method');

		if(formMethod == undefined || formMethod == ''){
			formMethod = 'GET';
		}

		//dataString['_token'] = $('meta[name="csrf-token"]').attr('content');

		$.ajax({
			type: formMethod,
			url : formAction,
			data : dataString,
			success : function(data){

				// console.log("ajax forms response: " + data);

				if(formRequest == 'hub'){
					var self = $("#hub-body").parent().find('.panel-heading');
					$("#hub-body").html(data);
					$('.panel .panel-heading').not(self).next().slideUp();
					$("#hub-body").slideDown();
					setAjaxForm();
				}
				else if(formRequest == 'projects'){
					$("#projects-body").html(data);
					$('.panel .panel-heading').next().slideUp();
					$("#projects-body").slideDown();
					setAjaxForm();
				}
				else if(formRequest == 'items'){
					$("#items-body").html(data);
					$('.panel .panel-heading').next().slideUp();
					$("#items-body").slideDown();
					setAjaxForm();
					setViewer();
				}
				else if(formRequest == 'issues'){
					$("#issues-body").html(data);
					$('.panel .panel-heading').next().slideUp();
					$("#issues-body").slideDown();
					setAjaxForm();
				}
			}
		},"json");
	});
};

var get3LegToken = function() {
	var token = makeSyncRequest('/token');
	if (token != '') console.log('3 legged token (User Authorization): ' + token);
	return token;
}

var makeSyncRequest = function(url) {
	var xmlHttp = null;
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false);
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

var setEnvironmentData = function(data) {
	
	var roomId = getCurrentRoomId();
	
	if(roomId != ''){
		
		for (var i = 0; i < data.message.length; i++) {

			switch(data.message[i].datatype){
				case 'temperature':
					$('#room-environment-box p.room-temperature-data').text(data.message[i].value + '℃');
					break;
				case 'humidity':
					$('#room-environment-box p.room-humidity-data').text(data.message[i].value + '％');
					break;
				case 'illuminance':

					var newVal = data.message[i].value;

					$('#room-environment-box p.room-illuminance-data').text(data.message[i].value + 'lx');
					
					for(var j = 0; j < roomMeshData.length; j++){
						
						if(roomMeshData[j].roomId == roomId){
							
							var meshArr = roomMeshData[j].mesh;
							
							for(var k = 0; k < meshArr.length; k++){
								var material = meshArr[k].material;
								var rgb = material.color;
								var currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
								var newHex = '';

								if(newVal > 0 && newVal <= 10){
									newHex = lightenDarkenColor(roomMeshData[j].defaultColor, -90);
								}
								else if(newVal > 10 && newVal <= 100){
									newHex = lightenDarkenColor(roomMeshData[j].defaultColor, -70);
								}
								else if(newVal > 100 && newVal <= 200){
									newHex = lightenDarkenColor(roomMeshData[j].defaultColor, -50);
								}
								else if(newVal > 200 && newVal <= 400){
									newHex = lightenDarkenColor(roomMeshData[j].defaultColor, 0);
								}
								else if(newVal > 400 && newVal <= 600){
									newHex = lightenDarkenColor(roomMeshData[j].defaultColor, 30);
								}
								else if(newVal > 600 && newVal <= 800){
									newHex = lightenDarkenColor(roomMeshData[j].defaultColor, 50);
								}
								else if(newVal > 800 && newVal <= 1000){
									newHex = lightenDarkenColor(roomMeshData[j].defaultColor, 70);
								}
								else if(newVal > 1000){
									newHex = lightenDarkenColor(roomMeshData[j].defaultColor, 90);
								}
								else {
									newHex = currentHex;
								}
								
								var colorThreeStr = newHex.replace('#', '0x');
								var colorValue = parseInt(colorThreeStr, 16);

								meshArr[k].material.color.setHex(colorThreeStr);

								meshArr[k].geometry.colorsNeedUpdate = true;

							}
						}
						
					}
					
					break;
				
				case 'sound':
					$('#room-environment-box p.room-sound-data').text(data.message[i].value + 'db');
					break;
			}
		};

		viewer.impl.sceneUpdated(true);
	}
};

var setViewer = function() {

	$('.item_viewer').on('click', function () {

		$('#viewer').html('');
		$('#subitems-body table tbody').html('');

		var options = {
			'env' : 'AutodeskProduction',
			'document' : 'urn:'+ $(this).attr('data-derivative-urn'),
			'getAccessToken': get3LegToken,
			'refreshToken': get3LegToken,
			'language': 'en'
		};

		var viewerElement = document.getElementById('viewer');

		viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerElement, {});

		Autodesk.Viewing.Initializer(options, function () {

			viewer.initialize();

			viewer.addEventListener(
				Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT,
				onInstanceTreeCreated
			);

			viewer.addEventListener(
				Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
				function(event) {
					loadExtensions(viewer);
				}
			);

			viewer.addEventListener(
				Autodesk.Viewing.SELECTION_CHANGED_EVENT,
				onItemSelected
			);

			loadDocument(options.document);
		});
	});

	var loadDocument = function(documentId){
		// first let's get the 3 leg token (developer & user & autodesk)
		var oauth3legtoken = get3LegToken();

		Autodesk.Viewing.Document.load(
			documentId,

			function (doc) { // onLoadCallback

				documentJsonData = doc;

				var geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {
					'type': 'geometry',
				}, true);

				if (geometryItems.length > 0) {

					geometryItems.forEach(function (item, index) {

						var li = $('<tr>').append($('<td class="table-text"><div>' + item.name + '</div></td>'))
						$(li).append($('<td class="table-btn">').append($('<button type="button" class="btn btn-primary">').append('<i class="fa fa-cubes"></i>View')));

						$(li).find('.btn').click(function () {
							viewer.impl.unloadCurrentModel();
							viewer.load(doc.getViewablePath(geometryItems[index]), null, null, null, doc.acmSessionId /*session for DM*/);
						});

						$('#subitems-body table tbody').append(li);

					});

					$('.panel .panel-heading').next().slideUp();
					$("#subitems-body").slideDown();

					var svfURN = doc.getViewablePath(geometryItems[0]);

					var sharedPropertyDbPath = doc.getPropertyDbPath();

					var onLoadModelSuccess = function(model){
						console.log('onLoadModelSuccess()!');
						console.log('Validate model loaded: ' + (viewer.model === model));
						console.log(model);

					}

					viewer.load(svfURN, sharedPropertyDbPath, onLoadModelSuccess, null, doc.acmSessionId /*session for DM*/);
				}
				// viewer.loadDocumentWithItemAndObject(documentId);
			},
			function (errorMsg) { // onErrorCallback
				// showThumbnail(documentId.substr(4, documentId.length - 1));
				console.log(errorMsg);
			}
			, {
				'oauth2AccessToken': oauth3legtoken,
				'x-ads-acm-namespace': 'WIPDM',//'WIPDMSecured',
				'x-ads-acm-check-groups': 'true'
			}
		)
	}
};

var getCurrentRoomId = function(){
	
	return currentSelectionRoom;
};

var setCurrentRoomId = function(roomId){

	currentSelectionRoom = roomId;
};

var lightenDarkenColor = function (col, amt) {
	var usePound = false;
	if (col[0] == "#") {
		col = col.slice(1);
		usePound = true;
	}
	var num = parseInt(col, 16);
	var r = (num >> 16) + amt;
	if (r > 255) {
		r = 255;
	} else if (r < 0) {
		r = 0;
	}
	var b = ((num >> 8) & 0x00FF) + amt;
	if (b > 255) {
		b = 255;
	} else if (b < 0) {
		b = 0;
	}
	var g = (num & 0x0000FF) + amt;
	if (g > 255) {
		g = 255;
	} else if (g < 0) {
		g = 0;
	}
	return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
};

var componentToHex = function (c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

var rgbToHex = function (r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var popupCenter = function(url, title, w, h) {
	// Fixes dual-screen position                         Most browsers      Firefox
	var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
	var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

	var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

	var left = ((width / 2) - (w / 2)) + dualScreenLeft;
	var top = ((height / 2) - (h / 2)) + dualScreenTop;
	var newWindow = window.open(url, title, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);

	// Puts focus on the newWindow
	if (window.focus) {
		newWindow.focus();
	}

	return newWindow;
}

//returns bounding box as it appears in the viewer
// (transformations could be applied)
function getModifiedWorldBoundingBox(fragIds, fragList) {

	var fragbBox = new THREE.Box3();
	var nodebBox = new THREE.Box3();

	fragIds.forEach(function(fragId) {

		fragList.getWorldBounds(fragId, fragbBox);
		nodebBox.union(fragbBox);
	});

	return nodebBox;
}

// Returns bounding box as loaded in the file
// (no explosion nor transformation)
function getOriginalWorldBoundingBox(fragIds, fragList) {

	var fragBoundingBox = new THREE.Box3();
	var nodeBoundingBox = new THREE.Box3();

	var fragmentBoxes = fragList.boxes;

	fragIds.forEach(function(fragId) {

		var boffset = fragId * 6;

		fragBoundingBox.min.x = fragmentBoxes[boffset];
		fragBoundingBox.min.y = fragmentBoxes[boffset+1];
		fragBoundingBox.min.z = fragmentBoxes[boffset+2];
		fragBoundingBox.max.x = fragmentBoxes[boffset+3];
		fragBoundingBox.max.y = fragmentBoxes[boffset+4];
		fragBoundingBox.max.z = fragmentBoxes[boffset+5];

		nodeBoundingBox.union(fragBoundingBox);
	});

	return nodeBoundingBox;
}

function callbackGetProperties(result) {

	if (result.properties) {

		for (var i = 0; i < result.properties.length; i++) {

			var prop = result.properties[i];

			console.log(prop);

			if(result.properties[i].displayName == "parent"){
				var parentDbId = result.properties[i].displayValue;
			}
		}
	}
}

function loadExtensions(viewer) {
	viewer.loadExtension('Autodesk.ADN.Viewing.Extension.ModelStructurePanel');
	viewer.loadExtension('Autodesk.ADN.Viewing.Extension.DockingPanel');
	viewer.loadExtension('Autodesk.ADN.Viewing.Extension.GeometrySelector');
}

function onInstanceTreeCreated(event) {

	var instanceTree = viewer.model.getData().instanceTree;

	var rootId = this.rootId = instanceTree.getRootId();
	var rootName = instanceTree.getNodeName(rootId);
	var childCount = 0;

	instanceTree.enumNodeChildren(rootId, function(childId) {

		var childName = instanceTree.getNodeName(childId);
		console.log(childName);
		childCount++;
	});
	
}

function onItemSelected (event) {
	
	if(event.dbIdArray.length > 0) {

		//viewer.select([]);

		var dbidArr = event.dbIdArray;

		var levelFlag = false;
		var roomFlag = false;
		var roomAllFlag = false;
		var parentDbId = null;
		
		findParentNodeAndSetCollaplsedFalse(dbidArr[0]);

	}
}

function findChildNodeAndSetCollapsedTrue(dbId){

	var instanceTree = viewer.model.getData().instanceTree;

	instanceTree.enumNodeChildren(dbId, function(childId) {

		if(viewer.modelstructure.isGroupNode(dbId)) {
			viewer.modelstructure.setGroupCollapsed(dbId, true);
		}

		viewer.model.getProperties(dbId, function(result) {

			if (result.properties) {

				for (var i = 0; i < result.properties.length; i++) {

					if (result.properties[i].displayName == "child") {
						childDbId = result.properties[i].displayValue;
						findChildNodeAndSetCollapsedTrue(childDbId);
					}
				}
			}
		});
	});
}

function findParentNodeAndSetCollaplsedFalse(dbId){

	if(viewer.modelstructure.isGroupNode(dbId)) {
		viewer.modelstructure.setGroupCollapsed(dbId, false);
	}

	viewer.model.getProperties(dbId, function(result) {
	
		if (result.properties) {
	
			for (var i = 0; i < result.properties.length; i++) {
	
				if (result.properties[i].displayName == "parent") {
					parentDbId = result.properties[i].displayValue;
					findParentNodeAndSetCollaplsedFalse(parentDbId);
				}
			}
		}
	});
}

function selectParentNodeWithGUID(nodeId){

	viewer.getProperties(nodeId, function(result){

		if (result.properties) {
			for (var i = 0; i < result.properties.length; i++) {

				if(result.properties[i].displayName == "GUID"){

					viewer.select(nodeId);
					viewer.fitToView([nodeId]);

					currentSelectionNodeWithGUID = nodeId;
					
				}
				else if(result.properties[i].displayName == "parent"){
					var parentDbId = result.properties[i].displayValue;
					selectParentNodeWithGUID(parentDbId);
				}
			}
		}
	});
}

function guid () {

	var d = new Date().getTime();

	var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
		/[xy]/g,
		function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
		});

	return guid;
};


///////////////////////////////////////////////////////////////////////////////
// PropertyPanel viewer Extension
// by Philippe Leefsma, October 2014
//
///////////////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

/**
 * SampleModelStructurePanel is a simple model structure panel that on click, selects
 * the node, and on control-modifier + hover, isolates the node.
 */

Autodesk.ADN.Viewing.Extension.ModelStructurePanel = function (viewer, options) {

	// base constructor
	Autodesk.Viewing.Extension.call(this, viewer, options);

	var _self = this;

	var _panel = null;

	var _initialModelStructurePanel = null;

	///////////////////////////////////////////////////////////////////////////
	// load callback
	//
	///////////////////////////////////////////////////////////////////////////
	_self.load = function () {

		Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel =
			
			function (viewer, title, options) {

				_self = this;
				
				Autodesk.Viewing.UI.ModelStructurePanel.call(
					_self,
					viewer.container,
					'AdnModelStructurePanel',
					'Room Selector',
					options);
			};

		Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype =
			Object.create(Autodesk.Viewing.UI.ModelStructurePanel.prototype);

		Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.constructor =
			Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel;

		/**
		 * Override initialize to listen for the selection
		 * changed event to update this panel automatically
		 */
		Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.initialize = function () {

			Autodesk.Viewing.UI.ModelStructurePanel.prototype.initialize.call(_self);

		}

		Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.ctrlDown = function (event) {

			return (_self.isMac && event.metaKey) ||
				(!_self.isMac && event.ctrlKey);
		}

		/**
		 * Override onClick to select the given node
		 */
		Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel.prototype.onClick = function (nodeId, event) {

			currentSelectionLevel = '';
			
			viewer.getProperties(nodeId, function(result){

				if (result.properties) {
					
					var levelFlag = false;
					var roomFlag = false;
					var roomName = "";

					for (var i = 0; i < result.properties.length; i++) {

						if(result.properties[i].displayName == "Type" && result.properties[i].displayValue.indexOf('レベル') != -1){

							levelFlag = true;
							
							// show all
							viewer.showAll();
							
							// hide route node completely
							var rootId = viewer.model.getRootId();
							viewer.turnOff(rootId);

							// show selected node
							viewer.turnOn(nodeId);

							// select node
							viewer.select(nodeId);

							currentSelectionLevel = nodeId;
						}
						else if(result.properties[i].displayName == "Type" && result.properties[i].displayValue.indexOf(roomLabel) != -1){

							roomFlag = true;

							for (var j = 0; j < result.properties.length; j++) {
								if(result.properties[j].displayName == "Name"){
									roomName = result.properties[j].displayValue
								}
							}
						}
					}
					
					if(levelFlag == true){
						
						var overlaySceneName = "overlay-room-geometry";
						if (viewer.impl.overlayScenes[overlaySceneName]) {
							viewer.impl.clearOverlay(overlaySceneName);
						}
						
						viewer.search(roomLabel, function(idArray){
								viewer.turnOff(idArray);
							}, function(){}
						)
					}
					else if(roomFlag == true){

						setCurrentRoomId(nodeId);
						
						viewer.turnOn(rootId);
						viewer.select(nodeId);
						viewer.fitToView([nodeId]);

						$('p.room-show-label').text(roomName);
						
						// var temp = Math.floor( Math.random() * (38+1-15) ) + 15 ;
						// var humi = Math.floor( Math.random() * (90+1-30) ) + 30 ;
						// var lux =  Math.floor( Math.random() * (2000+1-50) ) + 50 ;
						// var sound = Math.floor( Math.random() * (100+1-10) ) + 10 ;
						
						// $('p.room-temperature-data').text(temp + '℃');
						// $('p.room-humidity-data').text(humi + '％');
						// $('p.room-illuminance-data').text(lux + 'lx');
						// $('p.room-sound-data').text(sound + 'db');

						$('ul.room-person-list-ul').empty();
						// $('ul.room-person-list-ul').append('<li class="list-group-item">伊勢崎 俊明</li>');
						// $('ul.room-person-list-ul').append('<li class="list-group-item">小笠原 龍司</li>');
						// $('ul.room-person-list-ul').append('<li class="list-group-item">齋藤 茂和</li>');
						// $('ul.room-person-list-ul').append('<li class="list-group-item">柴田 麻美</li>');
						// $('ul.room-person-list-ul').append('<li class="list-group-item">高見澤 克明</li>');
						$('ul.room-person-list-ul').append('<li class="list-group-item">Toshiaki Isezaki</li>');
						$('ul.room-person-list-ul').append('<li class="list-group-item">Ryuji Ogasawara</li>');
						$('ul.room-person-list-ul').append('<li class="list-group-item">Shigekazu Saito</li>');
						$('ul.room-person-list-ul').append('<li class="list-group-item">Mami Shibata</li>');
						$('ul.room-person-list-ul').append('<li class="list-group-item">Katsuaki Takamizawa</li>');

						$('ul.room-task-list-ul').empty();
						// $('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-check" aria-hidden="true"></span> 足場の準備・確認</li>');
						// $('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-check" aria-hidden="true"></span> 天井パネルの搬入</li>');
						// $('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-unchecked" aria-hidden="true"></span> 天井パネルのはめ込み</li>');
						// $('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-unchecked" aria-hidden="true"></span> 照明器具の位置確認</li>');
						// $('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-unchecked" aria-hidden="true"></span> 空調吹き出し口の位置確認</li>');
						$('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-check" aria-hidden="true"></span> Prepare scaffoldings</li>');
						$('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-check" aria-hidden="true"></span> Installation ceiling panels</li>');
						$('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-unchecked" aria-hidden="true"></span> Set in ceiling panels</li>');
						$('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-unchecked" aria-hidden="true"></span> Check positions of lightings</li>');
						$('ul.room-task-list-ul').append('<li class="list-group-item"><span class="glyphicon glyphicon-unchecked" aria-hidden="true"></span> Check positions of air vent</li>');
					}
					else {

						var overlaySceneName = "overlay-room-geometry";
						if (viewer.impl.overlayScenes[overlaySceneName]) {
							viewer.impl.clearOverlay(overlaySceneName);
						}
						
						var rootId = viewer.model.getRootId();
						viewer.turnOn(rootId);
						viewer.isolate(nodeId);
						viewer.select(nodeId);
					}
				}
			});
		}

		_panel = new Autodesk.ADN.Viewing.Extension.AdnModelStructurePanel(viewer);
		
		viewer.setModelStructurePanel(_panel);

		console.log("Autodesk.ADN.Viewing.Extension.ModelStructurePanel loaded");

		return true;
	};

	///////////////////////////////////////////////////////////////////////////
	// unload callback
	//
	///////////////////////////////////////////////////////////////////////////
	_self.unload = function () {

		//TODO: cannot unload properly ...
		//viewer.showModelStructurePanel(false);
		
		console.log("Autodesk.ADN.Viewing.Extension.ModelStructurePanel unloaded");

		return true;
	};
};

Autodesk.ADN.Viewing.Extension.ModelStructurePanel.prototype =
	Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.ModelStructurePanel.prototype.constructor =
	Autodesk.ADN.Viewing.Extension.ModelStructurePanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
	'Autodesk.ADN.Viewing.Extension.ModelStructurePanel',
	Autodesk.ADN.Viewing.Extension.ModelStructurePanel);


/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Tool.RoomSelector
// by Ryuji Ogasawara, May 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Tool");

Autodesk.ADN.Viewing.Tool.RoomSelector = function(viewer) {

	var _names = ["roomselector"];
	var _active = false;
	var _isDragging = false;
	var _selectionFilter = [];

	this.isActive = function() {
		return _active;
	};

	this.getNames = function() {
		return _names;
	};

	this.getName = function() {
		return _names[0];
	};

	this.activate = function() {

		_active = true;
		_isDragging = false;
		_selectionFilter = [];

	};

	this.deactivate = function() {
		_active = false;
		this.destroy();
	};

	this.mouse = { x: 0, y: 0 };
	this.camera = viewer.getCamera();
	this.targetList = [];

	this.handleButtonDown = function (event, button) {

		_isDragging = true;

		var screenPoint = {
			x: event.clientX,
			y: event.clientY
		};

		// this.mouse = this.normalizeCoords(screenPoint);
		//
		// var raycaster = new THREE.Raycaster();
		//
		// raycaster.setFromCamera(this.mouse, this.camera);
        //
		// // クリック判定
		// var obj = raycaster.intersectObjects( this.targetList );
        //
		// // クリックしていたら、alertを表示  
		// if ( obj.length > 0 ){
        //
		// 	alert("click!!")
        //
		// }
        //
		// var element = viewer.impl.clientToWorld(event.canvasX, event.canvasY, true);
		//
		// var result = viewer.impl.hitTest(event.canvasX, event.canvasY, false);
		
		return false;
	};

	this.handleButtonUp = function (event, button) {

		_isDragging = false;
		return false;
	};

	this.handleMouseMove = function (event) {

		if (!_isDragging) {


		}
		return false;
	};

	this.destroy = function() {

		this.clearOverlay();

	};
	
	this.normalizeCoords = function(screenPoint) {

		var viewport =
			viewer.navigation.getScreenViewport();

		var n = {
			x: (screenPoint.x - viewport.left) / viewport.width,
			y: (screenPoint.y - viewport.top) / viewport.height
		};

		return n;
	};
}


/////////////////////////////////////////////////////////////////////
// Autodesk.ADN.Viewing.Extension.DockingPanel
// by Philippe Leefsma, May 2015
//
/////////////////////////////////////////////////////////////////////
AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.DockingPanel = function (viewer, options) {

	Autodesk.Viewing.Extension.call(this, viewer, options);

	var _panel = null;

	var _lineMaterial = null;

	var _vertexMaterial = null;

	var _roomSelector = null;

	/////////////////////////////////////////////////////////////////
	// Extension load callback
	//
	/////////////////////////////////////////////////////////////////
	this.load = function () {

		_panel = new Panel(
			viewer.container,
			guid());
		
		_lineMaterial = createLineMaterial();

		_vertexMaterial = createVertexMaterial();
		
		_faceMaterial = createFaceMaterial("#b4ff77", 0.9, true);

		_roomSelector = new Autodesk.ADN.Viewing.Tool.RoomSelector(viewer);
        
		viewer.toolController.registerTool(_roomSelector);

		_panel.setVisible(true);
		
		console.log('Autodesk.ADN.Viewing.Extension.DockingPanel loaded');

		return true;
	}

	/////////////////////////////////////////////////////////////////
	//  Extension unload callback
	//
	/////////////////////////////////////////////////////////////////
	this.unload = function () {

		_panel.setVisible(false);

		console.log('Autodesk.ADN.Viewing.Extension.DockingPanel unloaded');

		return true;
	}

	/////////////////////////////////////////////////////////////////
	// Generates random guid to use as DOM id
	//
	/////////////////////////////////////////////////////////////////
	function guid() {

		var d = new Date().getTime();

		var guid = 'xxxx-xxxx-xxxx-xxxx'.replace(
			/[xy]/g,
			function (c) {
				var r = (d + Math.random() * 16) % 16 | 0;
				d = Math.floor(d / 16);
				return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
			});

		return guid;
	}

	///////////////////////////////////////////////////////////////////////////
	// vertex material
	//
	///////////////////////////////////////////////////////////////////////////
	function createVertexMaterial() {

		var material = new THREE.MeshPhongMaterial({ color: 0xff0000 });

		viewer.impl.matman().addMaterial(
			'adn-material-vertex',
			material,
			true);

		return material;
	}

	///////////////////////////////////////////////////////////////////////////
	// line material
	//
	///////////////////////////////////////////////////////////////////////////
	function createLineMaterial() {

		var material = new THREE.LineBasicMaterial({
			color: 0x0000ff,
			linewidth: 2,
			depthTest: false,
			depthWrite: false
		});

		viewer.impl.matman().addMaterial(
			'adn-material-line',
			material,
			true);

		return material;
	}

	///////////////////////////////////////////////////////////////////////////
	// face material
	//
	///////////////////////////////////////////////////////////////////////////
	function createFaceMaterial(colorhex, opacity, transparent) {

		var colorHexStr = colorhex;
		var colorThreeStr = colorHexStr.replace('#', '0x');
		var colorValue = parseInt(colorThreeStr, 16);

		var material = new THREE.MeshPhongMaterial({
			color: colorValue,
			opacity: opacity,
			transparent: transparent,
			side: THREE.DoubleSide
		});

		viewer.impl.matman().addMaterial(
			'adn-material-face-' + guid(),
			material,
			true);

		return material;
	}
	
	///////////////////////////////////////////////////////////////////////////
	// draw a line
	//
	///////////////////////////////////////////////////////////////////////////
	function drawLine(start, end, overlaySceneName) {

		var lineGeom = new THREE.Geometry();

		lineGeom.vertices.push(start.clone());
		lineGeom.vertices.push(end.clone());
		
		var line = new THREE.Line(lineGeom, _lineMaterial, THREE.LinePieces);

		// var geometry = new THREE.Geometry();
        //
		// geometry.vertices.push(new THREE.Vector3(
		// 	start.x, start.y, start.z));
        //
		// geometry.vertices.push(new THREE.Vector3(
		// 	end.x, end.y, end.z));
        //
		// geometry.computeLineDistances();
        //
		// var line = new THREE.Line(geometry, _lineMaterial);
		
		//viewer.impl.scene.add(line);
		
		viewer.impl.addOverlay(overlaySceneName, line);
	}

	///////////////////////////////////////////////////////////////////////////
	// draw a vertex
	//
	///////////////////////////////////////////////////////////////////////////
	function drawVertex (v, radius, overlaySceneName) {

		var vertex = new THREE.Mesh(
			new THREE.SphereGeometry(radius, 20),
			_vertexMaterial);

		vertex.position.set(v.x, v.y, v.z);

		//viewer.impl.scene.add(vertex);
		viewer.impl.addOverlay(overlaySceneName, vertex);
	}

	///////////////////////////////////////////////////////////////////////////
	// create a geometry
	//
	///////////////////////////////////////////////////////////////////////////
	function createFaceGeometry(vA, vB, vC, geom){

		if(!geom){
			var geom = new THREE.Geometry();
		}
		
		var vIndex = geom.vertices.length;

		geom.vertices.push(vA.clone());
		geom.vertices.push(vB.clone());
		geom.vertices.push(vC.clone());

		var face = new THREE.Face3(vIndex, vIndex + 1, vIndex + 2);

		// face.vertexColors[0] = new THREE.Color(cA);
		// face.vertexColors[1] = new THREE.Color(cB);
		// face.vertexColors[2] = new THREE.Color(cC); 
		
		geom.faces.push(face);
		geom.computeFaceNormals();
		
		return geom;
	}

	///////////////////////////////////////////////////////////////////////////
	// draw a face
	//
	///////////////////////////////////////////////////////////////////////////
	function drawFaceMesh(geom, overlaySceneName, material, mesh){

		if(!material) {
			material = _faceMaterial
		}
		
		var faceMesh = new THREE.Mesh(geom, material);

		edges = new THREE.FaceNormalsHelper( faceMesh, 2, 0x00ff00, 1 );

		var normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
		_faceNormal = faceMesh.geometry.faces[0].normal.applyMatrix3(normalMatrix).normalize();

		viewer.impl.addOverlay(overlaySceneName, faceMesh);
		viewer.impl.addOverlay(overlaySceneName, edges);

		//_roomSelector.targetList.push(faceMesh);
		
		return faceMesh;
		
	}

	///////////////////////////////////////////////////////////////////////////
	// Sort face meshes by its normal
	//
	///////////////////////////////////////////////////////////////////////////
	function sortFaceByFaceNormal(faceMeshArray){
		
		var sortedFaceMeshes = {};
		//var sortedFaceMeshArray = [];
		
		var topFaceMeshArray = [];
		var bottomFaceMeshArray = [];
		var frontFaceMeshArray = [];
		var backFaceMeshArray = [];
		var leftFaceMeshArray = [];
		var rightFaceMeshArray = [];
		
		var topFaceNormal = new THREE.Vector3(0, 0, 1);
		var bottomFaceNormal = new THREE.Vector3(0, 0, -1);
		var frontFaceNormal = new THREE.Vector3(0, -1, 0);
		var backFaceNormal = new THREE.Vector3(0, 1, 0);
		var leftFaceNormal = new THREE.Vector3(-1, 0, 0);
		var rightFaceNormal = new THREE.Vector3(1, 0, 0);
		
		for(var i = 0; i < faceMeshArray.length; i++){

			var faces = faceMeshArray[i].geometry.faces;
			
			if(faces.length > 0) {
				
				var face_normal = faces[0].normal;
				
				if(face_normal.equals(topFaceNormal)){
					topFaceMeshArray.push(faceMeshArray[i]);
				}
				else if(face_normal.equals(bottomFaceNormal)){
					bottomFaceMeshArray.push(faceMeshArray[i]);
				} 
				else if(face_normal.equals(frontFaceNormal)){
					frontFaceMeshArray.push(faceMeshArray[i]);
				}
				else if(face_normal.equals(backFaceNormal)){
					backFaceMeshArray.push(faceMeshArray[i]);
				}
				else if(face_normal.equals(leftFaceNormal)){
					leftFaceMeshArray.push(faceMeshArray[i]);
				}
				else if(face_normal.equals(rightFaceNormal)){
					rightFaceMeshArray.push(faceMeshArray[i]);
				}
			}
		}
		
		sortedFaceMeshes.topFaceMeshArray = topFaceMeshArray;
		sortedFaceMeshes.bottomFaceMeshArray = bottomFaceMeshArray;
		sortedFaceMeshes.frontFaceMeshArray = frontFaceMeshArray;
		sortedFaceMeshes.backFaceMeshArray = backFaceMeshArray;
		sortedFaceMeshes.leftFaceMeshArray = leftFaceMeshArray;
		sortedFaceMeshes.rightFaceMeshArray = rightFaceMeshArray;
		
		return sortedFaceMeshes;
	}
	
	function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
	function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
	function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
	function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

	function applyMaterialToSortedFaceMesh(sortedFaceMeshes){

		var colorHexArray = ["#ff77b4", "#b4ff77", "#77b4ff", "#c277ff", "#ffc277", "#f8ff77"];
		var materialArray = [];
		
		for(var k = 0; k < colorHexArray.length; k++){
			var material = createFaceMaterial(colorHexArray[k], 0.9, true);
			materialArray.push(material);
		}

		for(var i = 0; i < sortedFaceMeshes.topFaceMeshArray.length; i++){
			sortedFaceMeshes.topFaceMeshArray[i].material = materialArray[0];
		}
		for(var i = 0; i < sortedFaceMeshes.bottomFaceMeshArray.length; i++){
			sortedFaceMeshes.bottomFaceMeshArray[i].material = materialArray[1];
		}
		for(var i = 0; i < sortedFaceMeshes.frontFaceMeshArray.length; i++){
			sortedFaceMeshes.frontFaceMeshArray[i].material = materialArray[2];
		}
		for(var i = 0; i < sortedFaceMeshes.backFaceMeshArray.length; i++){
			sortedFaceMeshes.backFaceMeshArray[i].material = materialArray[3];
		}
		for(var i = 0; i < sortedFaceMeshes.leftFaceMeshArray.length; i++){
			sortedFaceMeshes.leftFaceMeshArray[i].material = materialArray[4];
		}
		for(var i = 0; i < sortedFaceMeshes.rightFaceMeshArray.length; i++){
			sortedFaceMeshes.rightFaceMeshArray[i].material = materialArray[5];
		}

	}

	function applyBasicMaterialToMergedFaceMesh(sortedFaceMeshes){

		// var red = 0xff0000; // red
		// var green = 0x00ff00; // green
		// var blue = 0x0000ff; // blue
		//
		// var colors = [new THREE.Color(red), new THREE.Color(green), new THREE.Color(blue)];
		// var colorIndex = 0;
        //
		// var sortedFaceMeshArray = sortedFaceMeshes.bottomFaceMeshArray;
        //
		// for(var i = 1; i < sortedFaceMeshArray.length; i++){
		// 	sortedFaceMeshArray[0].geometry.mergeMesh(sortedFaceMeshArray[i]);
		// }
        //
		// sortedFaceMeshArray[0].geometry.mergeVertices();
        //
		// for(var i = 0; i < sortedFaceMeshArray.length; i++){
        //
		// 	//var faceMeshes = sortedFaceMeshArray[i];
        //
		// 	if(colorIndex > 2){
		// 		colorIndex = 0;
		// 	}
        //
		// 	// for(var j = 0; j < faceMeshes.length; j++){
		// 	// 	faceMeshes[j].geometry.faces[0].vertexColors[0] = colors[1];
		// 	// 	faceMeshes[j].geometry.faces[0].vertexColors[1] = colors[1];
		// 	// 	faceMeshes[j].geometry.faces[0].vertexColors[2] = colors[0];
		// 	// 	faceMeshes[j].geometry.colorsNeedUpdate = true;
		// 	// 	faceMeshes[j].geometry.elementsNeedUpdate = true;
		// 	// }
        //
		// 	var mesh = sortedFaceMeshArray[i];
		//	
		//	
        //
		// 	if(i%2 ==0){ //First triangle on each side edge
		// 		mesh.geometry.faces[0].vertexColors = [colors[0],colors[1],colors[0]];
		// 	}
		// 	else{ //Second triangle on each side edge
		// 		mesh.geometry.faces[0].vertexColors = [colors[1],colors[1],colors[0]];
		// 	}
        //
		// 	sortedFaceMeshArray[i].geometry.colorsNeedUpdate = true;
		// 	sortedFaceMeshArray[i].geometry.elementsNeedUpdate = true;
        //
		// 	// for(var k = 0; k < faceMeshes.length; k++){
		// 	//	
		// 	// 	var mesh = faceMeshes[k];
         //    //
		// 	// 	if(k%2 ==0){ //First triangle on each side edge
		// 	// 		mesh.geometry.faces[0].vertexColors = [colors[0],colors[1],colors[0]];
		// 	// 	}
		// 	// 	else{ //Second triangle on each side edge
		// 	// 		mesh.geometry.faces[0].vertexColors = [colors[1],colors[1],colors[0]];
		// 	// 	}
         //    //
		// 	// 	faceMeshes[k].geometry.colorsNeedUpdate = true;
		// 	// 	faceMeshes[k].geometry.elementsNeedUpdate = true;
		// 	// }
		//	
		// 	++colorIndex;
		// };

	}

	function applyMaterialBySortedFaceMesh(sortedFaceMeshes){

		// var colorHexArray = ["#b4ff77", "#ff77b4", "#77b4ff", "#c277ff", "#ffc277", "#f8ff77"];
		// var materialArray = [];
		// var materialIndex = 0;
        //
		// var colorA = new THREE.Color( 0xffffff );
		// colorA.setRGB( hexToR("#b4ff77"), hexToG("#b4ff77"), hexToB("#b4ff77") );
        //
		// var colorB = new THREE.Color( 0xffffff );
		// colorB.setRGB( hexToR("#f8ff77"), hexToG("#f8ff77"), hexToB("#f8ff77") );
        //
		// var colorC = new THREE.Color( 0xffffff );
		// colorC.setRGB( hexToR("#b4ff77"), hexToG("#b4ff77"), hexToB("#b4ff77") );
		//
		//
		// for(var k = 0; k < colorHexArray.length; k++){
		// 	var material = createFaceMaterial(colorHexArray[k], 0.8, true);
        //
		// 	material.vertexColors[0] = colorA;
		// 	material.vertexColors[1] = colorB;
		// 	material.vertexColors[2] = colorC;
		//	
		// 	materialArray.push(material);
		// }
		//
		// var sortedFaceMeshArray = sortedFaceMeshes.sortedFaceMeshArray;
		//
		// for(var i = 0; i < sortedFaceMeshArray.length; i++){
		//	
		// 	var faceMeshes = sortedFaceMeshArray[i];
		//	
		// 	if(materialIndex > 5){
		// 		materialIndex = 0;
		// 	}
		//	
		// 	for(var j = 0; j < faceMeshes.length; j++){
		//		
		// 		faceMeshes[j].material = materialArray[0];
		// 	}
        //
		// 	++materialIndex;
		//	
		// };
        //
		// var topFaceMeshArray = sortedFaceMeshes.topFaceMeshArray;
        //
		// for(var i = 0; i < topFaceMeshArray.length; i++){
        //
		// 	var faceMeshes = topFaceMeshArray[i];
        //
		// 	for(var j = 0; j < faceMeshes.length; j++){
        //
		// 		faceMeshes[j].material.opacity = 0.0;
		// 	}
        //
		// };

		// var topFaceNormal = new THREE.Vector3(0, 0, 1);
		// var bottomFaceNormal = new THREE.Vector3(0, 0, -1);
		// var bottomFaceMeshArray = sortedFaceMeshes.bottomFaceMeshArray;
        //
		// for(var i = 0; i < bottomFaceMeshArray.length; i++){
        //
		// 	var faceMeshes = bottomFaceMeshArray[i];
        //
		// 	for(var j = 0; j < faceMeshes.length; j++){
        //
		// 		var faces = faceMeshes[j].geometry.faces;
		// 		for(var k = 0; k< faces.length; k++){
		// 			if(faces[k].normal.equals(bottomFaceNormal)){
		// 				faces[k].normal = topFaceNormal;
		// 			}
		// 		}
		// 	}
		// };
	}

	/////////////////////////////////////////////////////////////////
	// The custom Panel
	//
	/////////////////////////////////////////////////////////////////
	var Panel = function(
		parentContainer, id) {

		var _thisPanel = this;

		_thisPanel.content = document.createElement('div');

		Autodesk.Viewing.UI.DockingPanel.call(
			this,
			parentContainer,
			id,
			// '作業環境 チェックパネル', jpn
			'Working Conditions',
			{shadow:true});

		$(_thisPanel.container).addClass('docking-panel');
		$(_thisPanel.container).addClass('work-environment-check-panel');

		/////////////////////////////////////////////////////////////
		// Custom html
		//
		/////////////////////////////////////////////////////////////
		var html = [

			'<form class="form-inline docking-panel-controls" role="form">',

			'<div id="room-show-box">',
			'<div class="room-show-button">',
			'<button class="btn btn-info" id="' + id + '-room-show-btn">',
			'<span class="glyphicon glyphicon-th-large" aria-hidden="true"> ',
			'</span> ',
			// '部屋を表示', jpn
			'Show Rooms',
			'</button>',
			'</div>',
			'<div class="room-show-current">',
			'<p class="room-show-label"></p>',
			'</div>',
			'</div>',
			'<div id="room-environment-box">',
			// '<div class="room-box-title"><p>環境データ</p></div>', jpn
			'<div class="room-box-title"><p>Environmental Data</p></div>',
			'<div class="room-environment-row">',
			'<div class="room-environment-cell"><p class="room-environment-cell-label">Temp</p><p class="room-environment-cell-data room-temperature-data"></p></div>',
			'<div class="room-environment-cell"><p class="room-environment-cell-label">Humi</p><p class="room-environment-cell-data room-humidity-data"></p></div>',
			'</div>',
			'<div class="room-environment-row">',
			'<div class="room-environment-cell"><p class="room-environment-cell-label">Illumi</p><p class="room-environment-cell-data room-illuminance-data"></p></div>',
			'<div class="room-environment-cell"><p class="room-environment-cell-label">Sound</p><p class="room-environment-cell-data room-sound-data"></p></div>',
			'</div>',
			'</div>',
			'<div id="room-person-box">',
			// '<div class="room-box-title"><p>チェックイン中の作業員</p></div>', jpn
			'<div class="room-box-title"><p>Current working members</p></div>',
			'<div class="room-person-list">',
			'<ul class="list-group room-person-list-ul">',
			'</ul>',
			'</div>',
			'</div>',
			'<div id="room-task-box">',
			// '<div class="room-box-title"><p>本日の作業工程</p></div>', jpn
			'<div class="room-box-title"><p>Todays work schedule</p></div>',
			'<div class="room-task-list">',
			'<ul class="list-group room-task-list-ul">',
			'</ul>',
			'</div>',
			'</div>',
			'</form>'
		];

		$(_thisPanel.container).append(html.join('\n'));

		$('#' + id + '-room-show-btn').click(onRoomShowButtonClicked);

		/////////////////////////////////////////////////////////////
		// button clicked handler
		//
		/////////////////////////////////////////////////////////////
		function onRoomShowButtonClicked(event) {

			event.preventDefault();

			roomMeshData = [];

			if(currentSelectionLevel != ''){

				var instanceTree = viewer.model.getData().instanceTree;

				instanceTree.enumNodeChildren(currentSelectionLevel, function(childId) {

					viewer.getProperties(childId, function(result) {

						if (result.properties) {

							var roomFlag = false;

							for (var i = 0; i < result.properties.length; i++) {

								// Retrieve room data
								if (result.properties[i].displayName == "Name" && result.properties[i].displayValue == roomLabel) {

									roomFlag = true;

									console.log(roomLabel + ": " + childId);
									
									//viewer.turnOn(childId);
									var overlaySceneName = "overlay-room-geometry";
									viewer.impl.createOverlayScene(overlaySceneName);
									
									var colorIndex = 0;
									var colorHexArray = ["#ff77b4", "#b4ff77", "#77b4ff", "#c277ff", "#ffc277", "#f8ff77" ];
									var materialArray = [];

									for(var k = 0; k < colorHexArray.length; k++){
										var material = createFaceMaterial(colorHexArray[k], 0.9, true);
										materialArray.push(material);
									}
									
									// var defaultMaterial = createFaceMaterial("#b4ff77", 0.8, true);
									// var vertexColorsMaterial = new THREE.MeshBasicMaterial({
									// 	vertexColors: THREE.VertexColors,
									// 	opacity: 0.8,
									// 	transparent: true,
									// 	side: THREE.DoubleSide
									// });

									instanceTree.enumNodeChildren(childId, function(roomChildId) {

										console.log("部屋の子要素: " + roomChildId);
										
										instanceTree.enumNodeChildren(roomChildId, function(roomFragDbId) {
											
											console.log("部屋のフラグメント要素: " + roomFragDbId);

											instanceTree.enumNodeFragments(roomFragDbId, function(fragId){

												console.log("部屋のフラグメントID: " + fragId);

												var renderProxy = viewer.impl.getRenderProxy(
													viewer.model,
													fragId);
												
												console.log(renderProxy);
                                                
												var matrix = renderProxy.matrixWorld;
												var indices = renderProxy.geometry.ib;
												var positions = renderProxy.geometry.vb;
												var stride = renderProxy.geometry.vbstride;
												var offsets = renderProxy.geometry.offsets;
                                                
												if (!offsets || offsets.length === 0) {
                                                
													offsets = [{start: 0, count: indices.length, index: 0}];
												}
                                                
												var vA = new THREE.Vector3();
												var vB = new THREE.Vector3();
												var vC = new THREE.Vector3();
                                                
												for (var oi = 0, ol = offsets.length; oi < ol; ++oi) {
                                                
													var start = offsets[oi].start;
													var count = offsets[oi].count;
													var index = offsets[oi].index;
                                                
													var checkFace = 0;
													var faceMeshArray = [];

													for (var i = start, il = start + count; i < il; i += 3) {
														
														var a = index + indices[i];
														var b = index + indices[i + 1];
														var c = index + indices[i + 2];
                                                
														vA.fromArray(positions, a * stride);
														vB.fromArray(positions, b * stride);
														vC.fromArray(positions, c * stride);
                                                
														vA.applyMatrix4(matrix);
														vB.applyMatrix4(matrix);
														vC.applyMatrix4(matrix);
                                                
														drawVertex (vA, 0.05, overlaySceneName);
														drawVertex (vB, 0.05, overlaySceneName);
														drawVertex (vC, 0.05, overlaySceneName);
                                                
														// drawLine(vA, vB, overlaySceneName);
														// drawLine(vB, vC, overlaySceneName);
														// drawLine(vC, vA, overlaySceneName);
														
														var faceGeometry = createFaceGeometry(vA, vB, vC);
														var faces = faceGeometry.faces;

														if(colorIndex > 5)
															colorIndex = 0;
														
														for(var f = 0; f < faces.length; f++){
															if(faces[f].normal.z <= 0) {
																var faceMesh = drawFaceMesh(faceGeometry, overlaySceneName, materialArray[colorIndex], renderProxy);
																faceMeshArray.push(faceMesh);
															}
														}
													}
													
													var roomMesh = { roomId : roomChildId, mesh : faceMeshArray, defaultColor: colorHexArray[colorIndex]};
													
													roomMeshData.push(roomMesh);

													var sortedFaceMeshes = sortFaceByFaceNormal(faceMeshArray);
													
												}
											});
										});

										++colorIndex;
									});

								}
							}
						}
					})
					
				})
			}
		}

		/////////////////////////////////////////////////////////////
		// setVisible override (not used in that sample)
		//
		/////////////////////////////////////////////////////////////
		_thisPanel.setVisible = function(show) {

			Autodesk.Viewing.UI.DockingPanel.prototype.setVisible.call(this, show);

			if(show) {
            
				viewer.toolController.activateTool(
					_roomSelector.getName());
			}
			else {
            
				viewer.toolController.deactivateTool(
					_roomSelector.getName());
			}
		}

		/////////////////////////////////////////////////////////////
		// initialize override
		//
		/////////////////////////////////////////////////////////////
		_thisPanel.initialize = function() {

			this.title = this.createTitleBar(
				this.titleLabel ||
				this.container.id);

			this.closer = this.createCloseButton();

			this.container.appendChild(this.title);
			this.title.appendChild(this.closer);
			this.container.appendChild(this.content);

			this.initializeMoveHandlers(this.title);
			this.initializeCloseHandler(this.closer);
		};

		/////////////////////////////////////////////////////////////
		// onTitleDoubleClick override
		//
		/////////////////////////////////////////////////////////////
		var _isMinimized = false;

		_thisPanel.onTitleDoubleClick = function (event) {

			_isMinimized = !_isMinimized;

			if(_isMinimized) {

				$(_thisPanel.container).addClass(
					'docking-panel-minimized');
			}
			else {
				$(_thisPanel.container).removeClass(
					'docking-panel-minimized');
			}
		};
	};

	/////////////////////////////////////////////////////////////
	// Set up JS inheritance
	//
	/////////////////////////////////////////////////////////////
	Panel.prototype = Object.create(
		Autodesk.Viewing.UI.DockingPanel.prototype);

	Panel.prototype.constructor = Panel;

	/////////////////////////////////////////////////////////////
	// Add needed CSS
	//
	/////////////////////////////////////////////////////////////
	var css = [

		'form.docking-panel-controls{',
		'margin: 20px;',
		'}',

		'input.docking-panel-name {',
		'height: 30px;',
		'margin-left: 5px;',
		'margin-bottom: 5px;',
		'margin-top: 5px;',
		'border-radius:5px;',
		'}',

		'div.docking-panel {',
		'top: 0px;',
		'left: 0px;',
		'width: 300px;',
		'height: 600px;',
		'resize: none;',
		'}',

		'div.docking-panel-minimized {',
		'height: 34px;',
		'min-height: 34px',
		'}',

		'div.room-box-title {',
		'width: 100%;',
		'height: 24px;',
		'color: white;',
		'margin: 0px;',
		'font-size: 14px;',
		'}',

		'div.room-box-title p {',
		'color: white;',
		'margin: 0px;',
		'padding: 0px;',
		'font-size: 14px;',
		'}',
		
		'#room-show-box {',
		'width: 100%;',
		'height: 40px;',
		'padding: 0px;',
		'}',

		'div.room-show-button {',
		'float: left;',
		//'width: 120px;', jpn
		'width: 150px;',
		'height: 40px;',
		'}',

		'div.room-show-current {',
		'float: left;',
		// 'width: 140px;', jpn
		'width: 110px;',
		'height: 40px;',
		'}',

		'p.room-show-label {',
		'color: white;',
		// 'font-size: 14px;',
		// 'white-space: nowrap;',
		// 'text-overflow: ellipsis;',
		// 'overflow: hidden;',
		// 'margin: 8px 2px;',
		'font-size: 13px;',
		'margin: 0px 2px;',
		'}',
		
		'#room-environment-box {',
		'width: 100%;',
		'height: 100px;',
		'padding: 10px 0px 0px 0px;',
		'}',

		'div.room-environment-row {',
		'width: 100%;',
		'height: 40px;',
		'}',

		'div.room-environment-cell {',
		'float: left;',
		'width: 50%;',
		'height: 40px;',
		'}',

		'p.room-environment-cell-label {',
		'float: left;',
		// 'width: 30%;', jpn
		'width: 35%;',
		'height: 40px;',
		'color: white;',
		// 'margin: 0px;', jpn
		'margin: 4px 0px;',
		'}',

		'p.room-environment-cell-data {',
		'float: left;',
		// 'width: 70%;', jpn
		'width: 65%;',
		'height: 40px;',
		'color: #fff368;',
		'font-size: 24px;',
		'margin: 0px;',
		'}',

		'#room-person-box {',
		'width: 100%;',
		'height: 180px;',
		'padding: 10px 0px 0px 0px;',
		'}',

		'div.room-person-list {',
		'width: 100%;',
		'height: 145px;',
		'overflow-y: scroll;',
		'}',
		
		'#room-task-box {',
		'width: 100%;',
		'height: 180px;',
		'padding: 10px 0px 0px 0px;',
		'}',

		'div.room-task-list {',
		'width: 100%;',
		'height: 145px;',
		'overflow-y: scroll;',
		'}'
		
	].join('\n');

	$('<style type="text/css">' + css + '</style>').appendTo('head');
};

Autodesk.ADN.Viewing.Extension.DockingPanel.prototype =
	Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.DockingPanel.prototype.constructor =
	Autodesk.ADN.Viewing.Extension.DockingPanel;

Autodesk.Viewing.theExtensionManager.registerExtension(
	'Autodesk.ADN.Viewing.Extension.DockingPanel',
	Autodesk.ADN.Viewing.Extension.DockingPanel);


Autodesk.Viewing.Viewer3D.prototype.turnOff = function(dbIds){

	var vm = new Autodesk.Viewing.Private.VisibilityManager(
		viewer.impl,
		viewer.model);
	
	vm.hide(dbIds);

	if (Array.isArray(dbIds)) {
		for (var i = 0; i < dbIds.length; i++) {
			var dbid = dbIds[i];
    
			vm.setNodeOff(dbid, true);
		}
    
	}
	else
	{
		vm.setNodeOff(dbIds, true);
	}

};

Autodesk.Viewing.Viewer3D.prototype.turnOn = function(dbIds) {

	var vm = new Autodesk.Viewing.Private.VisibilityManager(
		viewer.impl,
		viewer.model);
	
	vm.show(dbIds);

	if (Array.isArray(dbIds)) {
		for (var i = 0; i < dbIds.length; i++) {
			var dbid = dbIds[i];
    
			vm.setNodeOff(dbid, false);
		}
	}
	else
	{
		vm.setNodeOff(dbIds, false);
	}

};
