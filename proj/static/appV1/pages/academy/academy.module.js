(function () {
    'use strict';

    angular.module('BlurAdmin.pages.academy', ['ui.select', 'summernote', 'ngMask', 'angularjs-datetime-picker'])
        .config(routeConfig);

    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('academy-list', {
                url: '/academy-list',
                templateUrl: '../static/app' + gversion + '/pages/academy/academy.html',
                controller: 'academy_listCtrl',
                title: 'Academy List',
                sidebarMeta: {
                    icon: 'ion-compose',
                    order: 20
                }
            });
        // $urlRouterProvider.when('/report', '/report');
    }

})();
