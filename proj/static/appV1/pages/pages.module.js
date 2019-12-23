(function () {
    'use strict';

    angular.module('BlurAdmin.pages', [
        'ui.router',
        'BlurAdmin.pages.myProfile',
        'BlurAdmin.pages.report',
        // 'BlurAdmin.pages.profile',
    ]).config(routeConfig);


    /** @ngInject */
    function routeConfig($urlRouterProvider) {
        $urlRouterProvider.otherwise('/report/list');
    }
})();
