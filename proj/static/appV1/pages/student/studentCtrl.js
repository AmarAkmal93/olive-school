(function () {
    'use strict';


    angular.module('BlurAdmin.pages.student').controller('student_listCtrl', ['$scope', '$uibModal', 'baProgressModal', '$http', 'toastr', '$window', '$rootScope', student_listCtrl]);


    function student_listCtrl($scope, $uibModal, baProgressModal, $http, toastr, $window, $rootScope) {

        $scope.select_intake = {'selected': 'All', 'options': ['1','2','3']};


    }


})();
