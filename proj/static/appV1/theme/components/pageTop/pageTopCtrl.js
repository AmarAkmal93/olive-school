(function () {
    'use strict';

    angular.module('BlurAdmin.theme.components')
        .controller('pageTopCtrl', pageTopCtrl);

    angular.module('BlurAdmin.theme.components')
        .factory('userProfile', function ($http) {
            var get = {
                async: function () {
                    // $http returns a promise, which has a then function, which also returns a promise

                    //     var promise = $http.get("/user/view?id=" + user_id).then(function (response) {
                    //     // The return value gets picked up by the then in the controller.
                    //         return response.data
                    //     })
                    // // Return the promise to the controller
                    // return promise;
                }
            };
            return get;
        });

    function pageTopCtrl($scope, userProfile) {

        function loadData() {
            userProfile.async().then(function (response) {
                if (response.picture) {
                    $scope.profileImg = '../static/uploads' + '/' + response.id + '/' + response.picture;
                } else {
                    $scope.profileImg = '../static/assets/img/theme/no-photo.png';
                }

            });
        }

        $scope.getGlobalId = "user_id";
        // loadData();
        $scope.profileImg = '../static/assets/img/theme/no-photo.png';
        $scope.$on('updateProfilePic', function () {
            loadData()
        })

    }

})();