(function () {
    'use strict';

    angular.module('BlurAdmin.pages.student', ['ui.select', 'summernote', 'ngMask', 'angularjs-datetime-picker'])
        .config(routeConfig);

    function routeConfig($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('student-list', {
                url: '/student-list',
                templateUrl: '../static/app' + gversion + '/pages/student/student.html',
                controller: 'student_listCtrl',
                title: 'Student List',
                sidebarMeta: {
                     icon: 'ion-compose',
                    order: 10
                }
            });
        // $urlRouterProvider.when('/report', '/report');
    }

})();
