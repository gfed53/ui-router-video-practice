angular
.module('myApp')

.controller('HeaderCtrl', [HeaderCtrl])

function HeaderCtrl(){
	var vm = this;
	$(document).ready(function() {
		$('#mast-header').velocity({ translateX: [0, '-20em'] }, { duration: 500 });
		$('#credit').velocity({ translateX: [0, '20em'] }, {duration: 600 });
	});
};