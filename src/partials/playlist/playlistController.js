(function(){
	angular
	.module('myApp')

	.controller('PlaylistCtrl', ['$state', '$timeout', 'ytVideoItems', 'ytSearchHistory', 'ytSearchParams', 'ytPlaylistSort', 'ytFilters', 'ytPlaylistView', PlaylistCtrl])

	function PlaylistCtrl($state, $timeout, ytVideoItems, ytSearchHistory, ytSearchParams, ytPlaylistSort, ytFilters, ytPlaylistView){
		var vm = this;
		vm.items = ytVideoItems.services.getItems();
		vm.setVideoId = setVideoId;
		vm.pastSearches = ytSearchHistory.get();
		vm.grab = grab;
		vm.clear = clear;
		vm.clearItem = clearItem;
		vm.clearAllVideos = clearAllVideos;
		vm.clearAllSearches = clearAllSearches;
		vm.videosReverse = ytPlaylistSort.videos.reverse;
		vm.videosPredicate = ytPlaylistSort.videos.predicate;
		vm.searchesReverse = ytPlaylistSort.searches.reverse;
		vm.searchesPredicate = ytPlaylistSort.searches.predicate;
		vm.collapsed = ytPlaylistView.get();
		vm.sortVideos = sortVideos;
		vm.sortSearches = sortSearches;
		vm.closeAll = closeAll;
		vm.openAll = openAll;
		vm.addedAfterVideos = addedAfterVideos;
		vm.addedBeforeVideos = addedBeforeVideos;
		vm.addedAfterSearches = addedAfterSearches;
		vm.addedBeforeSearches = addedBeforeSearches;

		vm.videosTest = function(){
			console.log(vm.items);
		}

		vm.searchesTest = function(){
			console.log(vm.pastSearches);
		}

		// console.log(localStorage);
		// console.log(vm.items);
		// console.log(vm.pastSearches);
		

		//Grabs one of our saved searches, then automatically switches to the search state in its advanced search mode.
		function grab(search){
			ytSearchParams.set(search);
			ytSearchParams.setToAdvanced();
			$state.go('search');
		}

		//Removes selected search from history/localStorage (permanently)
		function clear(search){
			ytSearchHistory.clearItem(search);
		}

		//Removes ALL searches from history/localStorage (permanently!)
		function clearAllSearches(){
			ytSearchHistory.clearAll()
			.then(function(searches){
				vm.pastSearches = searches;
			});
		}

		//Removes selected video item from history/localStorage (permanently)
		function clearItem(item){
			var itemIndex = vm.items.indexOf(item);
			vm.items.splice(itemIndex, 1);
			ytVideoItems.services.clearItem(item.codeName);
		}

		//TODO: improve logic
		function clearAllVideos(){
			ytVideoItems.services.clearAllItems()
			.then(function(items){
				vm.items = items;
			});
			
		}

		function setVideoId(videoId){
			ytVideoItems.services.setVideoId(videoId);
		}

		function sortVideos(predicate){
			var sortObj = ytPlaylistSort.order(vm.videosPredicate, predicate, ytPlaylistSort.videos);
			vm.videosReverse = sortObj.reverse;
			vm.videosPredicate = sortObj.predicate;
		}

		function sortSearches(predicate){
			var sortObj = ytPlaylistSort.order(vm.searchesPredicate, predicate, ytPlaylistSort.searches);
			vm.searchesReverse = sortObj.reverse;
			vm.searchesPredicate = sortObj.predicate;
		}

		function closeAll(group){
			group.forEach(function(e){
				e.state = false;
			});
		}

		function openAll(group){
			group.forEach(function(e){
				e.state = true;
			});
		}

		function addedAfterVideos(video){
			return ytFilters().addedAfterVideos(video, vm.videoFilter);
		}

		function addedBeforeVideos(video){
			return ytFilters().addedBeforeVideos(video, vm.videoFilter);
		}

		function addedAfterSearches(search){
			return ytFilters().addedAfterSearches(search, vm.searchesFilter);
		}

		function addedBeforeSearches(search){
			return ytFilters().addedBeforeSearches(search, vm.searchesFilter);
		}
	};
})();



