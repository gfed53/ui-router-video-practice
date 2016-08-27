angular
.module('myApp')
.factory('ytTrustSrc', ['$sce', ytTrustSrc])
.factory('ytSearchYouTube', ['$q', '$http', 'ytTranslate', ytSearchYouTube])
.factory('ytChanSearch', ['$q', '$http', ytChanSearch])
.factory('ytCurrentVideo', ['$q', '$http', ytCurrentVideo])
.factory('ytCurrentChannel', ['$q', '$http', ytCurrentChannel])
.factory('ytComputeCssClass', [ytComputeCssClass])
.factory('ytScrollTo', ['$location', '$anchorScroll', ytScrollTo])
.factory('ytFixedHeader', [ytFixedHeader])
// .service('ytFixedHeader', [ytFixedHeader])
.factory('ytCheckScrollBtnStatus', [ytCheckScrollBtnStatus])
.factory('ytInitMap', [ytInitMap])
.service('ytChanFilter', [ytChanFilter])
.service('ytSearchParams', [ytSearchParams])
.service('ytResults', [ytResults])
.service('ytVideoItems', [ytVideoItems])
.service('ytSearchHistory', ['ytSearchParams', ytSearchHistory])
.service('ytTranslate', ['$http', '$q', ytTranslate])
.service('ytSortOrder', [ytSortOrder])
.service('ytPlaylistSort', [ytPlaylistSort]);


function ytTrustSrc($sce){
	return function(src){
		return $sce.trustAsResourceUrl(src);
	}
}

function ytSearchYouTube($q, $http, ytTranslate) {
	return function(keyword, channelId, order, publishedAfter, publishedBefore, safeSearch, location, locationRadius, pageToken, lang){
		
		var url = 'https://www.googleapis.com/youtube/v3/search';
		var request = {
			key: 'AIzaSyDKNIGyWP6_5Wm9n_qksK6kLSUGY_kSAkA',
			part: 'snippet',
			maxResults: 50,
			order: order,
			publishedAfter: publishedAfter,
			publishedBefore: publishedBefore,
			safeSearch: safeSearch,
			location: location,
			locationRadius: locationRadius,
			pageToken: pageToken,
			q: keyword,
			type: 'video',
			channelId: channelId,
			videoEmbeddable: true,
		};

		var services = {
			checkTrans: checkTrans,
			getResults: getResults,
			transAndResults: transAndResults
		};
		return services;

		function getResults(){
			return $http({
				method: 'GET',
				url: url,
				params: request
			})
			.then(function(response){
				return $q.when(response);
			},
			function(response){
				alert('error');
			});
		}

		function checkTrans(keyword, lang){
			var deferred = $q.defer();
			if(lang){
				ytTranslate.translate(keyword, lang)
				.then(function(response){
					deferred.resolve(response.data.text[0]);
				});
			} else {
				deferred.resolve(keyword)
			}
			return deferred.promise;
		}

		function transAndResults(){
			var deferred = $q.defer();
			checkTrans(keyword, lang).then(function(response){
				request.q = response;
				getResults().then(function(response){
					deferred.resolve(response);
				})
			});

			return deferred.promise;
		}
	}
};

function ytChanSearch($q, $http){
	return function(channel){
		var url = 'https://www.googleapis.com/youtube/v3/search';
		var request = {
			key: 'AIzaSyDKNIGyWP6_5Wm9n_qksK6kLSUGY_kSAkA',
			part: 'snippet',
			maxResults: 50,
			order: 'relevance',
			q: channel,
			type: 'channel'
		};
		var services = {
			getResults: getResults
		};
		return services;

		function getResults(){
			return $http({
				method: 'GET',
				url: url,
				params: request
			})
			.then(function(response){
				var results = response;
				return $q.when(response);
			},
			function(response){
				alert('Sorry, an error occured.');
			});
		}
	}
}

function ytChanFilter(){
	this.id = '';
	this.image = '';
	this.set = set;
	this.clear = clear;

	function set(id, image){
		this.id = id;
		this.image = image;
	}

	function clear(){
		this.id = '';
		this.image = '';
	}

}

function ytCurrentVideo($q, $http){
	return function(id){
		var url = 'https://www.googleapis.com/youtube/v3/videos',
		request = {
			key: 'AIzaSyDKNIGyWP6_5Wm9n_qksK6kLSUGY_kSAkA',
			part: 'snippet',
			id: id
		},
		services = {
			getVideo: getVideo
		};
		return services;

		function getVideo(){
			return $http({
				method: 'GET',
				url: url,
				params: request
			})
			.then(function(response){
				return $q.when(response);
			},
			function(response){
				alert('Sorry, an error occured.');
			});	
		}	
	}
}

function ytCurrentChannel($q, $http){
	return function(id){
		var url = "https://www.googleapis.com/youtube/v3/channels",
		request = {
			key: 'AIzaSyDKNIGyWP6_5Wm9n_qksK6kLSUGY_kSAkA',
			part: 'snippet',
			id: id
		},
		services = {
			getChannel: getChannel
		};
		return services;

		function getChannel(){
			return $http({
				method: 'GET',
				url: url,
				params: request
			})
			.then(function(response){
				return $q.when(response);
			},
			function(response){
				alert('Sorry, an error occured.');
			});	
		}	
	}
}

function ytVideoItems(){
	var currentVideoId;
	var items = [
	];

	this.services = {
		getItems: getItems,
		setItem: setItem,
		clearItem: clearItem,
		clearAllItems: clearAllItems,
		getVideoId: getVideoId,
		setVideoId: setVideoId
	};

	function getItems(){
		var newItems = [];
		if(localStorage.length > 0){
			for(key in localStorage){
				if(key.includes('uytp')){
					var item = {
						name: key,
						content: JSON.parse(localStorage[key])
					}
					if(items.indexOf(item) === -1){
						newItems.push(item);
					}					
				}
			}
			items = newItems;
		}
		return items;
	}

	function setItem(result){
		var itemName = result.snippet.title+'-uytp',
		dateAdded = new Date(),
		//Instead of creating a new object, just use result object passed in?
		content = {
			name: result.snippet.title,
			id: result.snippet.id,
			thumb: result.snippet.thumbnails.default.url,
			dateAdded: dateAdded,
			datePublished: result.snippet.publishedAt
		}
		content
		console.log(result);
		console.log(content);
		content = JSON.stringify(content);

		localStorage.setItem(itemName, content);
		alert('Video Saved!');
	}

	function clearItem(name){
		localStorage.removeItem(name);
	}

	function clearAllItems(){
		items = [];
		for(key in localStorage){
			if(key.includes('uytp')){
				localStorage.removeItem(key);
			}
		}
	}

	function getVideoId(){
		return currentVideoId;
	}

	function setVideoId(videoId){
		currentVideoId = videoId;
	}
};

function ytSearchParams(){
	var params = {
		keyword: undefined,
		advKeyword: undefined,
		searchedKeyword: undefined,
		channel: undefined,
		channelId: undefined,
		image: undefined,
		order: undefined,
		after: undefined,
		before: undefined,
		safeSearch: undefined,
		location: undefined,
		locationRadius: undefined,
		lat: undefined,
		lng: undefined,
		radius: undefined,
		prevPageToken: undefined,
		nextPageToken: undefined,
		name: undefined,
		date: undefined
	},
	//Only used for check()
	advParams = ['advKeyword', 'channel', 'channelId', 'image', 'order', 'after', 'before', 'safeSearch', 'location', 'locationRadius', 'lat', 'lng', 'radius'],
	_type_ = {
		basic: false,
		advanced: true
	};

	this.get = get;
	this.set = set;
	this.getSearchType = getSearchType;
	this.setSearchType = setSearchType;

	function get(){
		return params;
	}

	function set(newParams){
		for(var item in params){
			params[item] = newParams[item];
		}
	}

	function check(callback){
		for(var item in params){
			if(params[item]){
				for(var i=0; i<advParams.length; i++){
					if(item === advParams[i]){
						callback();
						return;
					}
				}
			}
		}
	}

	function getSearchType(){
		return _type_;
	}

	function setSearchType(type){
		_type_ = type;
	}
}

function ytResults(){
	this.results = [];
	this.chanResults = [];
	this.currentVideo;
	this.status = {
		videosCollapsed: true,
		channelsCollapsed: true,
		videoButtonValue: '',
		channelButtonValue: ''
	}
	this.getResults = getResults;
	this.getChanResults = getChanResults;
	this.setResults = setResults;
	this.setChanResults = setChanResults;
	this.getStatus = getStatus;
	this.setStatus = setStatus;
	this.checkStatus = checkStatus;

	function checkStatus(newVal, oldVal, buttonValue, showText, hideText){
		if(newVal === true){
			buttonValue = showText;
		} else {
			buttonValue = hideText;
		}
		return buttonValue;	
	}

	function getStatus(){
		return this.status;
	}

	function setStatus(status){
		this.status = status;
	}

	function getResults(){
		return this.results;
	}

	function getChanResults(){
		return this.chanResults;
	}

	function setResults(results){
		this.results = results;
	}

	function setChanResults(chanResults){
		this.chanResults = chanResults;
	}
}

function ytSearchHistory(ytSearchParams){
	this.pastSearches = [];
	this.get = get;
	this.set = set;
	this.clearItem = clearItem;
	this.clearAll = clearAll;

	function get(){
		if(localStorage.length > 0){
			for(key in localStorage){
				if(key.includes('uyts')){
					var obj = localStorage.getItem(key);
					obj = JSON.parse(obj);
					if(obj.name){
						if(obj.after != null){
							obj.after = new Date(obj.after);
						}
						if(obj.before != null){
							obj.before = new Date(obj.before);
						}
						//This is here to avoid existent objects getting reappended to the array within the session when they shouldn't be
						if(getIndexIfObjWithAttr(this.pastSearches, 'name', obj.name) === -1){
							this.pastSearches.push(obj);
						}
					}
				}
			}
		}
		return this.pastSearches;
	}

	function set(params){
		params.name = prompt('Enter a name for this saved search..');
		params.name = params.name+'-uyts';
		params.date = Date.now();
		this.pastSearches.push(params);
		localStorage.setItem(params.name, JSON.stringify(params));
	}

	function clearItem(search){
		var searchIndex = this.pastSearches.indexOf(search);
		this.pastSearches.splice(searchIndex, 1);
		localStorage.removeItem(search.name);
	}

	function clearAll(){
		//Clears all past searches
		this.pastSearches = [];
		for(key in localStorage){
			if(key.includes('uyts')){
				localStorage.removeItem(key);
			}
		}
	}

	function getIndexIfObjWithAttr(array, attr, value) {
		for(var i = 0; i < array.length; i++) {
			if(array[i][attr] === value) {
				return i;
			}
		}
		return -1;
	}

}

function ytComputeCssClass(){
	return function(first, last){
		var val;
		if(first){
			val = 'first';
		} else if(last){
			val = 'last';
		} else {
			val = null;
		}
		return val;
	}
}

function ytScrollTo($location, $anchorScroll){
	return function(scrollLocation){
		var services = {
			scrollToElement: scrollToElement,
			checkScrollBtnStatus: checkScrollBtnStatus
		}

		return services;

		function scrollToElement(scrollLocation){
			$anchorScroll.yOffset = 45;
			var element = document.getElementById(scrollLocation);
			if(element){
				$location.hash(scrollLocation);
				$anchorScroll();
			} else {
				window.scroll(0, 0);
			}
		}

		function checkScrollBtnStatus(){
			if(window.scrollY > 100){
				return true;
			} else {
				return false;
			}
		}	
	}
}

function ytFixedHeader(){
	return function(){
		var pageHeader,
		main,
		header,
		credit,
		content,
		menu,
		menuUl = document.getElementById('menu'),
		menuUlclass = 'nav nav-tabs ng-scope',
		style,
		creditMargin,
		headerHeight,
		menuHeight,
		height,
		pageSelector;


		var services = {
			fixedAdjustMenu: fixedAdjustMenu,
			init: init
		}

		return services;
		
		function fixedAdjustMenu(){
			pageHeader = document.getElementById('page-header');
			main = document.getElementById('header-wrapper');
			header = document.getElementById('mast-header');
			credit = document.getElementById('credit');
			content = document.getElementById('animate-view-container');
			menu = document.getElementById('header-menu');
			style = window.getComputedStyle(credit);
			creditMargin = style.getPropertyValue('margin-top');
			creditMargin = creditMargin.replace('px', '');
			creditMargin = creditMargin*2;
			//20 is a number acquired from trial and error in finding a smooth transition between static to fixed nav bar.
			headerHeight = header.offsetHeight+20+credit.offsetHeight+creditMargin;
			menuHeight = menuUl.offsetHeight;
			height = main.offsetHeight;
			pageSelector = document.getElementById('page-selector');
		}

		function init(){
			fixedAdjustMenu();
			window.addEventListener('resize', function(){
				fixedAdjustMenu();
				menu.style.height = menuHeight+'px';
			});
			document.onscroll = function(){
				if(window.scrollY > headerHeight){
					menu.style.height = menuHeight+'px';
					menu.className = 'fixed';
					content.style.top = menuHeight+3+'px';
					menuUl.className = menuUlclass+' tabs-adjust';
				} else {
					menu.className = '';
					content.style.top = '0';
					menuUl.className = menuUlclass;
				}
			}
		}
	}
}

function ytCheckScrollBtnStatus(){
	
	return function(){
		function checkVisible(elm) {
			var rect = elm.getBoundingClientRect();
			var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
			return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
		}

		function check(show){
			if(document.getElementById('results-container')){
				var elem = document.getElementById('results-container');
				var scrollTop = document.getElementsByClassName('scroll-top');
				if(checkVisible(elem)){
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}

		var services = {
			check: check
		}

		return services;
	}
}

function ytInitMap(){
	return function(callback){
		var map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: 39, lng: -99},
			zoom: 4
		});

		var circle = new google.maps.Circle({
			center: {lat: 39, lng: -99},
			radius: 100000,
			editable: true,
			draggable: true
		});

		circle.setMap(map);
		circle.addListener('center_changed', function(){
			callback();
		});

		circle.addListener('radius_changed', function(){
			callback();
		});

		var services = {
			map: map,
			circle: circle
		}

		return services;
	}
}

function ytTranslate($http, $q){

	var langs = [{
		label: 'None',
		value: ''
	}, {
		label: 'Arabic',
		value: 'ar'
	}, {
		label: 'Chinese',
		value: 'zh'
	}, {
		label: 'French',
		value: 'fr'
	}, {
		label: 'Hindi',
		value: 'hi'
	}, {
		label: 'Italian',
		value: 'it'
	}, {
		label: 'Japanese',
		value: 'ja'
	}, {
		label: 'Russian',
		value: 'ru'
	}, {
		label: 'Spanish',
		value: 'es'
	}];

	function translate(text, lang){
		var url = 'https://translate.yandex.net/api/v1.5/tr.json/translate',
		request = {
			key: 'trnsl.1.1.20160728T161850Z.60e012cb689f9dfd.6f8cd99e32d858950d047eaffecf930701d73a38',
			text: text,
			lang: 'en-'+lang
		};

		return $http({
			method: 'GET',
			url: url,
			params: request
		})
		.then(function(response){
			return $q.when(response);
		}, function(){
			alert('Error retrieving translation. Did you select a language? Is the search bar empty?');
		})
	}

	function translateAll(tag, list){
		var deferred = $q.defer();
		var tagList = tag;
		var langArray = [];
		for(lang in list){
			if(list[lang] != 'en' && list[lang]){
				langArray.push(list[lang]);
			}
		}
		var counter = langArray.length;

		if(langArray.length === 0){
			deferred.reject('No translations were necessary.');
		}

		for(var i = 0; i<langArray.length; i++){
			translate(tag, langArray[i]).then(function(response){
				tagList += ', '+response.data.text[0]+', ';
				counter--;
				if(counter <= 0){
					deferred.resolve(tagList);
				}
			});
		}

		return deferred.promise;
	}

	this.langs = langs;
	this.translate = translate;
	this.translateAll = translateAll;
}

function ytSortOrder(){
	var sortObj = {
		predicate: undefined,
		reverse: false
	};

	this.videoReverse = false;
	this.order = order;
	this.get = get;

	function order(current, _predicate) {
		sortObj.reverse = (_predicate === current) ? !reverse : false;
		sortObj.predicate = _predicate;
		return sortObj;
	}

	function get(){
		return sortObj;
	}
}

function ytPlaylistSort(){
	this.videos = {
		reverse: false,
		predicate: '$$hashKey'
	};

	this.searches = {
		reverse: false,
		predicate: '$$hashKey'
	};
	//Name
	this.order = order;
	this.get = get;

	function order(current, _predicate, type) {
		type.reverse = (_predicate === current) ? !type.reverse : false;
		type.predicate = _predicate;
		var sortObj = {
			reverse: type.reverse,
			predicate: type.predicate
		}
		return sortObj;
	}

	function get(){
		return sortObj;
	}
}


