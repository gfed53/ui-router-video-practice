angular
.module('myApp')

.controller('SearchCtrl', ['$scope', '$location', '$timeout', '$anchorScroll', 'ytSearchYouTube', 'ytChanSearch', 'ytChanFilter', 'ytSearchParams', 'ytResults', 'ytSearchHistory', 'ytVideoItems', 'ytComputeCssClass', 'ytScrollTo', SearchCtrl])

function SearchCtrl($scope, $location, $timeout, $anchorScroll, ytSearchYouTube, ytChanSearch, ytChanFilter, ytSearchParams, ytResults, ytSearchHistory, ytVideoItems, ytComputeCssClass, ytScrollTo){
	var vm = this;
	vm.initMap = initMap;
	vm.vidSubmit = vidSubmit;
	vm.setVideoId = setVideoId;	
	vm.chanSubmit = chanSubmit;
	vm.chanFilter = chanFilter;
	vm.chanClear = chanClear;
	vm.viewVideo = false;
	vm.filterActive = false;
	vm.toggleAdv = toggleAdv;
	vm.clearSelection = clearSelection;
	vm.searchAndChanFilter = searchAndChanFilter;
	vm.saveSearch = saveSearch;
	vm.addToPlaylist = ytVideoItems.services.setItem;
	vm.computeCssClass = computeCssClass;
	vm.scrollTo = scrollTo;
	vm.checkScrollBtnStatus = checkScrollBtnStatus;
	//Retrieving our saved variables, if any
	vm.results = ytResults.getResults();
	vm.chanResults = ytResults.getChanResults();
	vm.params = ytSearchParams.get();
	vm.status = ytResults.getStatus();
	vm.offSet = checkScrollBtnStatus();

	$location.url('/search');

	$scope.$watch('search.status.videosCollapsed', function(current, original){
			var showText = 'Show Videos',
			hideText = 'Hide Videos';
			
			vm.status.videoButtonValue = ytResults.checkStatus(current, original, vm.status.videoButtonValue, showText, hideText);
		});

	$scope.$watch('search.status.channelsCollapsed', function(current, original){
			var showText = 'Show Channels',
			hideText = 'Hide Channels';

			vm.status.channelButtonValue = ytResults.checkStatus(current, original, vm.status.channelButtonValue, showText, hideText);
		});

	function initMap() {
		vm.map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 39, lng: -99},
			zoom: 4
		});

		vm.circle = new google.maps.Circle({
			center: {lat: 39, lng: -99},
			radius: 100000,
			editable: true,
			draggable: true
		});

		vm.circle.setMap(vm.map);
		vm.circle.addListener('center_changed', function(){
			update();
		});

		vm.circle.addListener('radius_changed', function(){
			update();
		});

		function update(){
			vm.center = vm.circle.getCenter();
			vm.lat = vm.center.lat();
			vm.lng = vm.center.lng();
			vm.radius = vm.circle.getRadius();
			vm.params.lat = JSON.stringify(vm.lat);
			vm.params.lng = JSON.stringify(vm.lng);
			vm.params.radius = JSON.stringify(vm.radius/1000);
			vm.params.location = vm.params.lat+','+vm.params.lng;
			vm.params.locationRadius = vm.params.radius+'km';
			$scope.$apply();
		}
	}

	function vidSubmit(keyword, channelId, order, publishedAfter, publishedBefore, safeSearch, location, locationRadius, pageToken){
		vm.viewVideo = false;
		vm.params.searchedKeyword = keyword;
		ytSearchYouTube(keyword, channelId, order, publishedAfter, publishedBefore, safeSearch, location, locationRadius, pageToken).getResults()
		.then(function(response){
			vm.results = response.data.items;
			vm.params.nextPageToken = response.data.nextPageToken;
			vm.params.prevPageToken = response.data.prevPageToken;
			vm.status.channelsCollapsed = true;
			vm.status.videosCollapsed = false;
			ytResults.setStatus(vm.status);

			//Saving our params to our service
			ytSearchParams.set(vm.params);
			//Saving the results to our service
			ytResults.setResults(vm.results);

			// Autoscroll up
			$timeout(function(){
				vm.scrollTo('scroll-point');
				vm.offSet = true;
			}, 1000);
			
		})
	}

	function setVideoId(videoId){
		ytVideoItems.services.setVideoId(videoId);
	}

	function chanSubmit(channel){
		vm.searchedChannel = channel;
		ytChanSearch(channel).getResults()
		.then(function(response){
			vm.chanResults = response.data.items;
			vm.status.channelsCollapsed = false;
			vm.status.videosCollapsed = true;
			ytResults.setStatus(vm.status);
			ytResults.setChanResults(vm.chanResults);
			$timeout(function(){
				vm.scrollTo('scroll-point');
				vm.offSet = true;
			}, 1000);
			
		})
	}

	function chanFilter(id, image){
		ytChanFilter.set(id, image);
		vm.params.image = image;
		vm.params.channelId = id;
		vm.filterActive = true;
		vm.scrollTo('form-advanced-video-search');
	}

	function chanClear(){
		ytChanFilter.clear();
		vm.params.image = '';
		vm.params.channelId = undefined;
		vm.filterActive = false;
	}

	function toggleAdv(){
		$('#advanced-search, #form-basic-video-search').slideToggle();
		vm.initMap();
	}

	function clearSelection(){
		//Clears location/locationRadius params
		vm.params.lat = undefined;
		vm.params.lng = undefined;
		vm.params.radius = undefined;
		vm.params.location = undefined;
		vm.params.locationRadius = undefined;
	}

	function searchAndChanFilter(channel){
		vm.searchedChannel = channel;
		ytChanSearch(channel).getResults()
		.then(function(response){
			vm.firstChanResult = response.data.items[0];
			vm.chanFilter(vm.firstChanResult.id.channelId, vm.firstChanResult.snippet.thumbnails.default.url);
			
		})
	}

	function saveSearch(params){
		ytSearchHistory.set(params);
	}

	function computeCssClass(first, last){
		return ytComputeCssClass(first, last);
	}

	function scrollTo(scrollLocation){
		ytScrollTo().scrollToElement(scrollLocation);
	}

	function checkScrollBtnStatus(){
		var bool;
		if(vm.results.length>0 || vm.chanResults.length>0){
			bool = true;
		} else {
			bool = false;
		}
		return bool;
	}
};


