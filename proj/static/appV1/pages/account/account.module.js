(function () {
    'use strict';

    angular.module('BlurAdmin.pages.account', ['ui.select', 'summernote', 'ngMask', 'angularjs-datetime-picker'])
        .config(routeConfig);

    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('account-list', {
                url: '/account-list',
                templateUrl: '../static/app' + gversion + '/pages/account/account.html',
                controller: 'account_listCtrl',
                title: 'Account List',
                sidebarMeta: {
                     icon: 'ion-compose',
                    order: 1
                }
            });
        // $urlRouterProvider.when('/report', '/report');
    }

})();
