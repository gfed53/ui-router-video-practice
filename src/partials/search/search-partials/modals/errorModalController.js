(function(){
	angular
	.module('myApp')
	.controller('ErrorModalController', ['$uibModalInstance', ErrorModalController])

	function ErrorModalController($uibModalInstance){
		var vm = this;
		vm.ok = ok;
		vm.cancel = cancel;

		function ok(){
			$uibModalInstance.close();
		}

		function cancel(){
			$uibModalInstance.dismiss('cancel');
		}
	}
})();