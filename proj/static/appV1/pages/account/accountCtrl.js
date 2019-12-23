(function () {
    'use strict';


    angular.module('BlurAdmin.pages.account').controller('account_listCtrl', ['$scope', '$uibModal', 'baProgressModal', '$http', 'toastr', '$window', '$rootScope', account_listCtrl]);


    function account_listCtrl($scope, $uibModal, baProgressModal, $http, toastr, $window, $rootScope) {

        $scope.select_intake = {'selected': 'All', 'options': ['1','2','3']};


    }


})();
