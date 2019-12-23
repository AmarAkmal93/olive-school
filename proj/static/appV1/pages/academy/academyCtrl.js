(function () {
    'use strict';


    angular.module('BlurAdmin.pages.academy').controller('academy_listCtrl', ['$scope', '$uibModal', 'baProgressModal', '$http', 'toastr', '$window', '$rootScope', academy_listCtrl]);


    function academy_listCtrl($scope, $uibModal, baProgressModal, $http, toastr, $window, $rootScope) {

        $scope.select_intake = {'selected': 'All', 'options': ['1','2','3']};


    }


})();
