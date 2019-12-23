(function () {
    'use strict';

    angular.module('BlurAdmin.pages.myProfile', [])
        .config(routeConfig);

    function routeConfig($stateProvider) {
        $stateProvider
            .state('myProfile', {
                url: '/myProfile/edit-profile',
                header: 'Profile',
                templateUrl: '../static/app' + gversion + '/pages/myProfile/myProfile.html',


            });
    }

})();