(function () {
    'use strict';

    angular.module('BlurAdmin.pages.report', ['ui.select', 'summernote', 'ngMask', 'angularjs-datetime-picker'])
        .config(routeConfig);

    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('report', {
                url: '/report',
                template: '<ui-view autoscroll="true" autoscroll-body-top></ui-view>',
                abstract: true,
                title: 'Report',
                header: 'Report',
                sidebarMeta: {
                    icon: 'ion-compose',
                    order: 1
                }
            }).state('report.list', {
            url: '/list',
            templateUrl: '../static/app' + gversion + '/pages/report/report.html',
            controller: 'reportCtrl',
            controllerAs: 'rCtrl',
            title: 'List',
            sidebarMeta: {
                order: 100
            }
        });
        $urlRouterProvider.when('/report', '/report');
    }

})();
