(function(){
	angular
	.module('myApp')

	.controller('PlaylistCtrl', ['$state', '$timeout', 'ytVideoItems', 'ytSearchHistory', 'ytSearchParams', 'ytPlaylistSort', 'ytFilters', PlaylistCtrl])

	function PlaylistCtrl($state, $timeout, ytVideoItems, ytSearchHistory, ytSearchParams, ytPlaylistSort, ytFilters){
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
		vm.videosCollapse = true;
		vm.searchesCollapse = true;
		vm.sortVideos = sortVideos;
		vm.sortSearches = sortSearches;
		vm.videoTabStatus = false;
		vm.closeAll = closeAll;
		vm.openAll = openAll;
		vm.addedAfterVideos = addedAfterVideos;
		vm.addedBeforeVideos = addedBeforeVideos;
		vm.addedAfterSearches = addedAfterSearches;
		vm.addedBeforeSearches = addedBeforeSearches;

		//Grabs one of our saved searches, then automatically switches to the search state in its advanced search mode.
		function grab(search){
			//type: an object maintained in a service which keeps track of what search mode is visible ('true' would mean it's collapsed - not visible).
			var type = {
				basic: true,
				advanced: false
			};
			ytSearchParams.set(search);
			ytSearchParams.setSearchType(type);
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
			ytVideoItems.services.clearItem(item.name);
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



