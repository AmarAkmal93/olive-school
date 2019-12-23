function check_format(file, src) {
    if (file.type.indexOf("image") !== -1) {
        return '../static/assets/img/images.png'
    } else if (file.type.indexOf("video") !== -1) {
        return '../static/assets/img/video.jpg'
    } else if (file.type.indexOf("sheet") !== -1) {
        return '../static/assets/img/excel.gif'
    } else if (file.type.indexOf("msword") !== -1) {
        return '../static/assets/img/doc.png'
    } else if (file.type.indexOf("vnd.openxmlformats-officedocument.wordprocessingml.document") !== -1) {
        return '../static/assets/img/doc.png'
    } else if (file.type.indexOf("plain") !== -1) {
        return '../static/assets/img/txt.png'
    } else if (file.type.indexOf("pdf") !== -1) {
        return '../static/assets/img/pdf.png'
    } else {
        return 'not support'
    }

}

(function () {
    'use strict';

    angular.module('BlurAdmin.pages.report')
        .directive('ngFileModel', ['$parse', function ($parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var model = $parse(attrs.ngFileModel);
                    var modelSetter = model.assign;
                    element.bind('change', function () {
                        var values = [];
                        angular.forEach(element[0].files, function (item) {

                            var format = check_format(item, '');
                            if (format != 'not support') {
                                values.push(item);
                            } else {
                                alert(item.name + " is not supported");
                            }
                        });
                        scope.$apply(function () {
                            modelSetter(scope, values);
                        });
                    });
                }
            }
        }]);
    angular.module('BlurAdmin.pages.report')
        .controller('ReportViewCtrl', ['$http', '$scope', 'toastr', '$uibModalInstance', '$uibModal', 'items', 'status', '$rootScope', '$sce', '$uibModalStack', ReportViewCtrl]);

    function ReportViewCtrl($http, $scope, toastr, $uibModalInstance, $uibModal, items, status, $rootScope, $sce, $uibModalStack) {
        $scope.formData = {};
        $scope.report_id = items;


        $scope.ip_server_file = ip_report + 'get_load_file/' + items + '/';
        $scope.ip_server_file_download = ip_report + 'download_file/' + items + '/';


        $scope.format_file = ".xls" + "," + ".xlsx " + "," + ".doc " + "," + ".docx " + "," + ".pdf " + "," + ".m4v" + "," + ".mp4" + "," + ".mov" + "," + ".mp4" + "," + ".txt" + "," + "image/*";
        loadData();

        function loadData() {

            $scope.status_button_loading = false;
            $scope.showtab_work_report = true;
            $scope.show_button_submit = false;
            $scope.showtab_work_report = false;
            $http({
                method: 'GET',
                url: ip_report + 'list_status_selection'
            }).success(function (result) {
                // for (var i = 0; i < result.length; i++) {
                $scope.list_status = result
            });

            $http.get(ip_report + 'get_laporan/' + JSON.stringify(items)).then(function (response) {
                if (response.data.status == 'Read' || response.data.status == 'New' || response.data.status == 'On-Hold') {
                    $scope.show_blinking = true;
                    $scope.show_button_submit = false;
                    $scope.show_status_button = true;
                    $scope.showtab_work_report = false;
                } else if (response.data.status == 'Failed') {   /*# FOR BLINKING WE split condition with return and new */
                    $scope.show_blinking = true;
                    $('#summernote').summernote('disable');
                    $scope.show_button_submit = false;
                    $scope.show_status_button = false;
                    $scope.showtab_work_report = true;
                } else if (response.data.status == 'Return' || response.data.status == 'Unresolved') {  /*# FOR BLINKING WE split condition*/
                    $scope.show_blinking = false;
                    $scope.status_loading = false;
                    $('#summernote').summernote('disable');
                    $scope.show_button_submit = false;
                    $scope.show_status_button = false;
                    $scope.showtab_work_report = false;
                } else if (response.data.status == 'Completed') {  /*# FOR BLINKING WE split condition*/
                    $scope.show_blinking = false;
                    $scope.status_loading = false;
                    $('#summernote').summernote('disable');
                    $scope.show_button_submit = false;
                    $scope.show_status_button = false;
                    $scope.showtab_work_report = true;
                } else {  /*FOR INPROGRESS*/
                    $('#summernote').summernote('enable');
                    $scope.show_blinking = true;
                    $scope.show_button_submit = true;
                    $scope.show_status_button = false;
                    $scope.showtab_work_report = true;
                }
                if ($scope.show_status_button == true && $scope.status_button_loading == false) {   /*# Control status button only*/
                    $scope.status_loading = false
                }
                $scope.id = response.data.id;
                $scope.no_rujukan = response.data.no_rujukan;
                $scope.tarikh = response.data.tarikh;
                $scope.lokasi = response.data.lokasi;
                $scope.latlong = response.data.latlong;
                $scope.status = response.data.status;
                $scope.category = response.data.category;
                $scope.flag = response.data.flag;
                $scope.desc = response.data.desc;
                $scope.agensi = response.data.agensi;
                $scope.report_attachment = response.data.report_attachment;
                $scope.work_attachment = response.data.work_attachment;
                $scope.formData.desc = response.data.work_report;


            }).catch(function (error) {
                console.log(error, "ERROR")
                // if (error.status === 401)
                //     denied()
            });
        }

        $scope.open_map_view = function () {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '../static/app' + gversion + '/pages/report/widgets/OpenMap.html',

                size: 'lg',
                resolve: {
                    items: function () {
                        if ($scope.latlong.length > 0) {
                            return $scope.latlong;
                        } else {
                            return "null"
                        }

                        // if(!$scope.latlong){
                        //     return "null";
                        // }else{
                        //     return $scope.latlong;
                        //     // console.log($scope.latlong);
                        // }
                    }, refrense_no: function () {
                        return $scope.no_rujukan;
                    }, category: function () {
                        return $scope.category;
                    }

                },
                controller: function ($scope, $uibModalInstance, items, refrense_no, category, $timeout) {
                    $scope.no_rujukan = refrense_no;
                    $scope.category = category;
                    var marker;
                    var flag = false;
                    var LatLng;
                    var map;
                    var basemaps = {};
                    var overlays = {};
                    $scope.dicForm = {};

                    function splitData(data) {
                        data = data.toString();
                        var result;
                        var v1 = data.split(".");
                        result = v1[0] + "." + v1[1].substring(0, 5);
                        return result;
                    }

                    function initialize() {

                        delete L.Icon.Default.prototype._getIconUrl;
                        L.Icon.Default.mergeOptions({
                            iconRetinaUrl: "../static/assets/img/theme/vendor/leaflet/dist/images/marker-icon-2x.png",
                            iconUrl: "../static/assets/img/theme/vendor/leaflet/dist/images/marker-icon.png",
                            shadowUrl: "../static/assets/img/theme/vendor/leaflet/dist/images/marker-shadow.png"
                        });


                        if (items != "null") {
                            LatLng = items.split(",");
                            map = L.map(document.getElementById('leaflet-map')).setView([LatLng[0], LatLng[1]], 15);
                            marker = L.marker([LatLng[0], LatLng[1]]).addTo(map)
                                .bindPopup("<p>" + "<b>" + "Ref No. :" + "</b>" + $scope.no_rujukan + "<br>" + "<b>" + "Category :" + "</b>" + $scope.category + "</p>")
                                .openPopup();
                            flag = true;
                            $scope.dicForm.lat = LatLng[0];
                            $scope.dicForm.long = LatLng[1];
                        } else {
                            map = L.map(document.getElementById('leaflet-map')).setView([2.977, 101.791], 8);
                        }
                        /*                        map.on('click', function (e) {
                                                    // $scope.dicForm.lat = "";
                                                    // $scope.dicForm.long = "";
                                                    if (flag) {
                                                        map.removeLayer(marker);
                                                    }
                                                    marker = L.marker([e.latlng['lat'], e.latlng['lng']]).addTo(map);
                                                    marker.bindPopup('Lat : ' + splitData(e.latlng['lat']) + ' Long : ' + splitData(e.latlng['lng']));
                                                    marker.openPopup();
                                                    flag = true;
                                                    $scope.dicForm.lat = splitData(e.latlng['lat']);
                                                    $scope.dicForm.long = splitData(e.latlng['lng']);
                                                });*/

                        $scope.load_map = function () {
                            // $scope.dicForm.lat = "";
                            // $scope.dicForm.long = "";
                            if (flag) {
                                map.removeLayer(marker);
                            }
                            marker = L.marker([$scope.dicForm.lat, $scope.dicForm.long]).addTo(map);
                            // marker.bindPopup('Lat : ' + $scope.dicForm.lat + ' Long : ' + $scope.dicForm.long);
                            marker.bindPopup("Ref No. :" + $scope.no_rujukan + "\n" + 'Lat : ' + $scope.dicForm.lat + ' Long : ' + $scope.dicForm.long);
                            marker.openPopup();
                            flag = true;

                        };

                        // $scope.send_loc = function () {
                        //     $rootScope.$broadcast('location', $scope.dicForm.lat.toString() + "," + $scope.dicForm.long.toString());
                        // };

                        basemaps = {};
                        overlays = {};

                        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        }).addTo(map);
//            L.tileLayer.wms(ip_server_gis + ':8081/services/wms?', {
//                layers: 'klokantech-basic',
//            }).addTo(map);

                    }

                    $timeout(function () {
                        initialize();
                    }, 100);

                }
            });
        };

        $scope.convertHTML = function (html) {
            return $sce.trustAsHtml(html)
        };

        $scope.reload_history = function () {
            $http.get(ip_report + 'get_history_status/' + $scope.report_id).then(function (response) {
                // $scope.trustAsHtml =
                $scope.history = response.data;
            }).catch(function (error) {
                console.log(error, "ERROR")
            });

        };

        $scope.close_tab = function () {
            $uibModalInstance.close();
        };

        function get_status_update_status(fd) {
            $rootScope.$broadcast('status_celery', $scope.report_id, "start_update_status_process_celery");
            var config = {transformRequest: angular.identity, headers: {'Content-Type': undefined}};
            $http.post(ip_report + 'status_update', fd, config).then(function (response) {

                if (response.data['status'] == "OK") {
                    toastr.success('Update data in process.', 'Process!');
                    var timer = setInterval(function () {
                        $.getJSON(ip_report + "status_status_update_long/" + response.data['task_id'], function (data) {
                            $rootScope.$broadcast('status_celery', $scope.report_id, "start_update_status_process_celery");
                            // toastr.success('Status successfully updated.', 'Process!');

                            if (data["status"] == "SUCCESS") {
                                $scope.reload_history();
                                loadData();
                                $rootScope.$broadcast('load_list_report');
                                $rootScope.$broadcast('status_celery', $scope.report_id, "finish_update_status_process_celery");
                                clearInterval(timer);
                            }
                            if (data["status"] == "FAILURE") {
                                console.log("FAILURE");
                                $scope.reload_history();
                                loadData();
                                $rootScope.$broadcast('load_list_report');
                                $rootScope.$broadcast('status_celery', $scope.report_id, "start_update_status_process_celery");
                                clearInterval(timer);

                            }
                            // loadData();
                        })
                    }, 2000);


                } else {
                    $scope.activeTab = 3;
                    $scope.show_button_submit = false;
                    $rootScope.$broadcast('load_list_report');

                    // toastr.error("Data hasn't forward.", 'Error!');
                }

            }).catch(function (error) {
                console.log(error);
                $scope.activeTab = 3;
                $scope.show_button_submit = false;
            });

        }

        $scope.status_selection = function (status_selection) {
            $scope.status_loading = true;
            var fd = new FormData();
            if (status_selection["name"] == "In Progress") {
                $scope.status_loading = true;
                $scope.formData.status = status_selection;
                $scope.formData.report_id = $scope.id;
                fd.append('data', JSON.stringify($scope.formData));

                get_status_update_status(fd)

            } else {
                var update_modal = $uibModal.open({
                    animation: true,
                    templateUrl: '../static/app' + gversion + '/pages/report/widgets/status_update.html',
                    backdrop: 'static',
                    size: 'md',
                    resolve: {
                        status: function () {
                            return status_selection                      //id data
                        },
                        report_id: function () {
                            return $scope.id                      //id data
                        }
                    },
                    controller: function ($scope, $uibModalInstance, status, report_id) {
                        $scope.formData = {};
                        $scope.snotestatusconfig = {
                            height: 200,
                            focus: false,
                            placeholder: 'write here...',
                            toolbar: [
                                // ['style', ['bold', 'italic', 'underline', 'clear']],
                                // ['view', ['fullscreen']]
                            ],
                            disableDragAndDrop: true,
                        };


                        $scope.formData.status = status;
                        $scope.formData.report_id = report_id;
                        $scope.confirm = function () {

                            if (!$scope.formData.desc) {
                                toastr.warning("Please insert remark before proceed!.", 'Warning!');
                            } else {
                                fd.append('data', JSON.stringify($scope.formData));
                                get_status_update_status(fd);
                                // update_modal.close();
                                $uibModalInstance.close()
                                // $uibModalStack.dismissAll();

                            }

                        }; //function end
                    }, //controller end

                });

                update_modal.result.then(function () {
                    $uibModalStack.dismissAll();
                    $rootScope.$broadcast('load_list_report')
                }, function () {
                });
            }
        };

        $(document).ready(function () {

            function previewFile(file) {
                var reader = new FileReader();
                var obj = new FormData().append('file', file);
                reader.onload = function (data) {
                    var src = data.target.result;
                    var size = ((file.size / (1024 * 1024)).toFixed(3) > 1) ? (file.size / (1024 * 1024)).toFixed(3) + ' MB' : (file.size / 1024) + ' kB';
                    $scope.$apply(function () {
                            $scope.src_type = check_format(file, src);

                            $scope.previewData.push({
                                'name': file.name, 'size': size, 'type': file.type,
                                'src': $scope.src_type, 'data': obj, 'tab': $scope.type, "file": src
                            });
                        }
                    );
                };

                reader.readAsDataURL(file);
            }

            function uploadFile(e, type) {
                e.preventDefault();
                var files = "";
                if (type == "formControl") {
                    files = e.target.files;
                } else if (type === "drop") {
                    files = e.originalEvent.dataTransfer.files;
                }
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    var format = check_format(file, '')
                    // parts = ;

                    if (format != 'not support') {
                        previewFile(file);
                    } else {
                        alert(file.name + " is not supported");
                    }
                }
            }

            $('.fileUpload').bind('change', function (e) {
                $scope.previewData = [];   /*CLEAR*/
                uploadFile(e, 'formControl');
            });

            $('.dropzone').bind("click", function (e) {
                $compile($('.fileUpload'))($scope).trigger('click');
            });

            $('.dropzone').bind("dragover", function (e) {
                e.preventDefault();
            });

            $('.dropzone').bind("drop", function (e) {
                uploadFile(e, 'drop');
            });
            $scope.upload = function (obj) {

            };

            $scope.remove = function (data) {
                var index = $scope.previewData.indexOf(data);
                $scope.previewData.splice(index, 1);
                $scope.formData.attachment.splice(index, 1)
            };
            $('#desc_report').summernote('disable');

        });
        //#######################################

        $scope.setting1 = {
            height: 200,
            focus: true,
            placeholder: 'write here...',
            toolbar: [
                // ['style', ['bold', 'italic', 'underline', 'clear']],
                // ['view', ['fullscreen']]
            ],
            disableResizeEditor: true,
            disableDragAndDrop: true,
        };


        $scope.setting2 = {
            height: 200,
            focus: false,
            placeholder: 'write here...',
            toolbar: [
                ['style', ['bold', 'italic', 'underline', 'clear']],
                // ['view', ['fullscreen']]
            ],

            disableDragAndDrop: true,

        };


        $scope.submit = function () {
            $rootScope.$broadcast('status_celery', $scope.report_id, "start_update_status_process_celery");
            var fd = new FormData();
            var config = {transformRequest: angular.identity, headers: {'Content-Type': undefined}};
            if ($scope.formData.attachment) {
                for (var i = 0; i < $scope.formData.attachment.length; i++) {
                    // fd.append({'attachment': $scope.formData.attachment[i]});
                    fd.append('attachment', $scope.formData.attachment[i]);
                }
            }
            var data = {
                "id": items,
                "desc": $scope.formData.desc,
            };
            fd.append('data', JSON.stringify(data));

            $http.patch(ip_report + 'work_report', fd, config).then(function (response) {
                if (response.data['status'] == "OK") {
                    // modalInstance.close();
                    toastr.success('Submit data in process.', 'Process!');
                    var timer = setInterval(function () {
                        $.getJSON(ip_report + "status_work_report_long/" + response.data['task_id'], function (data) {
                             $rootScope.$broadcast('status_celery', $scope.report_id, "start_update_status_process_celery");
                            if (data["status"] == "SUCCESS") {
                                $rootScope.$broadcast('load_list_report');
                                $rootScope.$broadcast('status_celery', items, "finish_update_status_process_celery");
                                clearInterval(timer);
                            }
                            if (data["status"] == "FAILURE") {
                                // loadData();
                                $rootScope.$broadcast('load_list_report');
                                $rootScope.$broadcast('status_celery', items, "finish_update_status_process_celery");
                                clearInterval(timer);
                            }
                        })
                    }, 3000);

                }
                $uibModalStack.dismissAll();
            }).catch(function (error) {
                console.log(error, "ERROR")
                // if (error.status === 401) {
                //     denied()
                // }
            });
        };


        function delete_file_html(id_file) {

            var check;
            for (check = 0; check < $scope.work_attachment.length; check++) {
                if ($scope.work_attachment[check]["id"] == id_file) {
                    $scope.work_attachment.splice(check, 1);
                }

            }

        }

        $scope.deleteFile = function (delete_file) {
            $uibModal.open({
                animation: true,
                templateUrl: '../static/app' + gversion + '/pages/asset/widgets/delete.html',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    id_file: function () {
                        return delete_file                      //id data
                    }
                },
                controller: function ($scope, $uibModalInstance, id_file) {
                    $scope.confirmDel = function () {
                        delete_file_html(id_file)

                        var modalInstance = $uibModal.open({
                            animation: true,
                            templateUrl: '../static/app' + gversion + '/pages/asset/widgets/loader.html',
                            size: 'sm',
                            backdrop: 'static',
                            keyboard: false,
                        });

                        $http.delete(ip_report + "delete_file_single/" + items + "/" + delete_file, {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
                            }
                        }).then(function (response) {
                            if (response.data["status"] == "OK") {
                                modalInstance.close();
                                toastr.success('Delete data in process.', 'Process!');
                                var timer = setInterval(function () {
                                    $.getJSON(ip_report + "status_delete_file_single_long/" + response.data['task_id'], function (data) {
                                        if (data["status"] == "SUCCESS") {
                                            clearInterval(timer);
                                            loadData();
                                        }
                                        if (data["status"] == "FAILURE") {
                                            clearInterval(timer);
                                            loadData();
                                        }
                                    })
                                }, 2000);

                            } else {
                                toastr.error('Error!');
                            }

                        }, function (response) {
                            toastr.error('Error!');
                        });

                    }; //function end
                }, //controller end
            });
        };

    }
})();
