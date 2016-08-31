angular
.module('myApp')

.controller('SearchCtrl', ['$scope', '$location', '$timeout', '$anchorScroll', 'ytSearchYouTube', 'ytChanSearch', 'ytChanFilter', 'ytSearchParams', 'ytResults', 'ytSearchHistory', 'ytVideoItems', 'ytComputeCssClass', 'ytScrollTo', 'ytInitMap', 'ytCheckScrollBtnStatus', 'ytTranslate', 'ytFixedHeader', 'ytSortOrder', SearchCtrl])

function SearchCtrl($scope, $location, $timeout, $anchorScroll, ytSearchYouTube, ytChanSearch, ytChanFilter, ytSearchParams, ytResults, ytSearchHistory, ytVideoItems, ytComputeCssClass, ytScrollTo, ytInitMap, ytCheckScrollBtnStatus, ytTranslate, ytFixedHeader, ytSortOrder){
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
	vm.scrollBtn = false;
	//Retrieving our saved variables, if any
	vm.type = ytSearchParams.getSearchType();
	vm.results = ytResults.getResults();
	vm.chanResults = ytResults.getChanResults();
	vm.params = ytSearchParams.get();
	vm.status = ytResults.getStatus();
	vm.langs = ytTranslate.langs;
	vm.translate = translate;
	vm.params.lang = vm.langs[0];
	vm.videosReverse = ytSortOrder.videosReverse;
	vm.sort = sort;

	//If advanced view is active when revisiting state, we need to initMap() on ctrl start
	$timeout(function(){
		vm.initMap();
	});

	$location.url('/search');

	window.addEventListener('scroll', function(){
		$scope.$apply(vm.scrollBtn = ytCheckScrollBtnStatus().check());
	});

	function initMap() {
		vm.mapObj = ytInitMap(update);
		vm.map = vm.mapObj.map;
		vm.circle = vm.mapObj.circle;

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

	function vidSubmit(keyword, channelId, order, publishedAfter, publishedBefore, safeSearch, location, locationRadius, pageToken, lang){
		vm.viewVideo = false;
		vm.params.searchedKeyword = keyword;
		ytSearchYouTube(keyword, channelId, order, publishedAfter, publishedBefore, safeSearch, location, locationRadius, pageToken, lang).transAndResults()
		.then(function(response){
			//In case we make a translated search, we want to hold onto that query
			vm.params.advKeyword = response.config.params.q;
			vm.params.searchedKeyword = response.config.params.q;
			//Also reset auto-translate in case we want to then grab the next page of the translated search (so the translator doesn't unnecessarily try to re-translate an already-translated word)
			vm.params.lang = vm.langs[0];
			vm.results = response.data.items;
			vm.params.nextPageToken = response.data.nextPageToken;
			vm.params.prevPageToken = response.data.prevPageToken;
			vm.status.channelsCollapsed = true;
			vm.status.videosCollapsed = false;
			ytResults.setStatus(vm.status);
			//Saving the results to our service
			ytResults.setResults(vm.results);

			// Autoscroll up
			$timeout(function(){
				vm.scrollTo('scroll-point');
				vm.offSet = true;
				ytFixedHeader().init();
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
				ytFixedHeader().init();
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
		vm.type.basic = !vm.type.basic;
		vm.type.advanced = !vm.type.advanced;
		ytSearchParams.setSearchType(vm.type);
		$timeout(function(){
			vm.initMap();
		});
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

	function translate(keyword, lang){
		ytTranslate.translate(keyword, lang)
		.then(function(response){
			vm.params.advKeyword = response.data.text[0];
		});
	}

	function sort(){
		vm.videosReverse = !vm.videosReverse;
		ytSortOrder.videosReverse = vm.videosReverse;
	}
};


