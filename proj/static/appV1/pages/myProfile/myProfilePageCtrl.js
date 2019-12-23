(function () {
    'use strict';

    angular.module('BlurAdmin.pages.myProfile')
        .controller('myProfilePageCtrl', ['$scope', '$http', 'fileReader', 'toastr', '$rootScope', myProfilePageCtrl]);

    angular.module('BlurAdmin.pages.myProfile').directive('editStaffIdNotUse', function ($http) {
        return {

            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var count = 0;
                var VirtData = "";
                ngModel.$asyncValidators.editStaffIdNotUse = function (modelValue, viewValue) {

                    if (count === 0) {
                        VirtData = viewValue;
                    }
                    count = count + 1;
                    return $http.get('/user/search_user_id?staff_id=' + viewValue + '&id=' + user_id).then(function (response) {

                        if (viewValue != VirtData) {


                            if (response.data.staff_id == "Ok") {

                                scope.useridexist = true;
                                scope.useridexist = "Staff Id Already Exist";
                            } else {

                                scope.useridexist = false;
                                scope.useridexist = "";
                            }
                        } else {


                            scope.useridexist = false;
                            scope.useridexist = "";

                        }

                    }).catch(function (error) {
                        if (error.status === 401)
                            denied()
                    });
                };
            }
        };
    });

    angular.module('BlurAdmin.pages.myProfile').directive('editPhoneNotUse', function ($http) {
        //aideed
        return {

            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var count = 0;
                var VirtData = "";
                ngModel.$asyncValidators.editPhoneNotUse = function (modelValue, viewValue) {

                    if (count === 0) {
                        VirtData = viewValue;
                    }
                    count = count + 1;
                    return $http.get('/user/search_phone?phone=' + viewValue + '&id=' + user_id).then(function (response) {

                        if (viewValue != VirtData) {


                            if (response.data.phone == "Ok") {

                                scope.edituserphonexist = true
                                scope.edituserphonexist = "Phone Already Exist"
                            } else {

                                scope.edituserphonexist = false;
                                scope.edituserphonexist = "";
                            }
                        } else {


                            scope.edituserphonexist = false;
                            scope.edituserphonexist = "";

                        }

                    })
                };
            }
        };
    });

    angular.module('BlurAdmin.pages.myProfile').directive('editEmailNotUse', function ($http) {
        //aideed
        return {

            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                var count = 0;
                var VirtData = "";
                ngModel.$asyncValidators.editEmailNotUse = function (modelValue, viewValue) {

                    if (count === 0) {
                        VirtData = viewValue;
                    }
                    count = count + 1;
                    return $http.get('/user/search_email?email=' + viewValue + '&id=' + user_id).then(function (response) {

                        if (viewValue != VirtData) {


                            if (response.data.email == "Ok") {

                                scope.edituseremailexist = true
                                scope.edituseremailexist = "Email Already Exist"
                            } else {

                                scope.edituseremailexist = false;
                                scope.edituseremailexist = ""
                            }
                        } else {


                            scope.edituseremailexist = false;
                            scope.edituseremailexist = ""

                        }

                    }).catch(function (error) {
                        if (error.status === 401)
                            denied()
                    });
                };
            }
        };
    });

    /** @ngInject */
    function myProfilePageCtrl($scope, $http, fileReader, toastr, $rootScope) {

        $scope.uploadPicture = function () {
            var fileInput = document.getElementById('uploadFile');
            fileInput.click();

        };
        $scope.getFile = function (file) {
            $scope.file = file;
            fileReader.readAsDataUrl(file, $scope)
                .then(function (result) {
                    $scope.picture = result;
                });
        };


        $http({
            method: 'GET',
            url: '/user/view?id=' + user_id

        }).success(function (result) {
            $scope.id = result.id;
            $scope.staff_id = result.staff_id;
            $scope.name = result.name;
            $scope.phone = result.phone;
            $scope.email = result.email;
            $scope.address = result.address;
            $scope.picture = '../static/uploads' + '/' + result.id + '/' + result.picture;


        });
        $scope.picture = '../static/assets/img/theme/no-photo.png'
        $scope.updateProfile = function () {
            var fd = new FormData();
            fd.append('file', $scope.file);
            var data = JSON.stringify({
                "password": $scope.password,
                "phone": $scope.phone
            });
            fd.append('data', data);

            $http.post("/user/update_profile?id=" + user_id, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
                .then(function (response) {

                    if (response.data['status'] == "OK") {
                        toastr.success('Update data in process!', 'Process!');
                        $rootScope.$broadcast("updateProfilePic");
                    } else {
                        toastr.error("Data hasn't been updated.", 'Error!');
                    }
                })
        }

    }
})();

