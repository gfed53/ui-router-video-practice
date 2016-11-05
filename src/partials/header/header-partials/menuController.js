angular
.module('myApp')

.controller('MenuCtrl', ['$scope', '$rootScope', '$timeout', 'ytVideoItems', 'ytFixedHeader', 'ytDropdown', MenuCtrl])

function MenuCtrl($scope, $rootScope, $timeout, ytVideoItems, ytFixedHeader, ytDropdown){
	var vm = this;
	vm.videoId = ytVideoItems.services.getVideoId();
	vm.videoActive = false;
	vm.showFixed = false;

	ytFixedHeader().init(show,hide);

	function show(){
		$scope.$apply(function(){
			vm.showFixed = true;
		});
	}

	function hide(){
		$scope.$apply(function(){
			vm.showFixed = false;
		});
	}

	//Once we switch to the video state (by clicking on a video to watch), the video tab will now be visible from now on, so we have access to it for the duration of the session
	$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
		if(toState.name === 'video'){
			vm.videoActive = true;
			vm.videoId = ytVideoItems.services.getVideoId();
		}
	});
}