var rootScope;
var get_data1;
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.report').directive('dateselecter', function () {
        return function (scope, element, $rootScope) {

            element.datepicker({
                dateFormat: 'dd MM yy', showOtherMonths: true, selectOtherMonths: true,
                changeYear: true,
                onSelect: function (selectedDate,) {
                    scope.formData.date_report = selectedDate;
                    rootScope.$broadcast('load_list_report')


                }
            });
        };
    });


    angular.module('BlurAdmin.pages.report').controller('reportCtrl', ['$scope', '$uibModal', 'baProgressModal', '$http', 'toastr', '$window', '$rootScope', reportCtrl]);


    function reportCtrl($scope, $uibModal, baProgressModal, $http, toastr, $window, $rootScope) {

        $scope.loading_forward = false;
        // $scope.loading_celery = false;
        rootScope = $rootScope;
        $scope.formData = {};
        $scope.formData.no_rujukan = "";
        $scope.category = "";
        $scope.formData.status = "";
        $scope.formData.date_report = "";

        //#### Page Number #####//
        $scope.goto = {};
        $scope.goto.page = 1;
        $scope.pagenum = 1;

        //#### select box #####//
        $scope.selectedList = {};
        $scope.selection = [];
        $scope.select_status = {'selected': 'All', 'options': ['All']};
        $scope.category = {'selected': 'All', 'options': ['All']};


        $http({
            method: 'GET',
            url: ip_report + 'list_status'
        }).success(function (result) {
            for (var i = 0; i < result.length; i++) {
                $scope.select_status.options.push(result[i].name)
            }
        });


        $http.get(ip_report_category + 'category_list').then(function (response) {
            for (var i = 0; i < response.data.data.length; i++) {
                $scope.category.options.push(response.data.data[i].name)
            }

        }).catch(function (error) {
            console.log(error, "ERROR")
            // if (error.status === 401)
            //     denied()
        });


        $scope.$on('load_list_report', function () {
            loadData()
        });

        loadData();


        $scope.toggleAll = function () {

            var toggleStatus = $scope.formData.isAllSelected;
            angular.forEach($scope.smartTableData, function (itm) {
                $scope.selectedList[itm.id] = toggleStatus;
            })

        };


        function loadData() {
            $scope.loading_forward = false;
            $scope.formData.status = $scope.select_status.selected;
            $scope.formData.isAllSelected = false;

            $http.get(ip_report + 'list_laporan/' + JSON.stringify($scope.formData) + '/' + $scope.pagenum, {
                params: {
                    category: $scope.category.selected
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8;'
                }
            }).then(function (response) {

                response = response.data;

                $scope.smartTableData = response.data;
                $scope.count_result = response.count_result;
                $scope.totalpagenum = response.totalpagenum;

                $scope.paging = [];
                if ($scope.pagenum > $scope.totalpagenum) {   /*Control last page delete */
                    $scope.goto.page = $scope.totalpagenum;
                    $scope.pagenum = $scope.totalpagenum
                }

                if (response.count_result == 0) {
                    $scope.goto.page = 0;

                }
                if ($scope.pagenum > 4) {
                    if ($scope.pagenum + 2 <= response.totalpagenum) {
                        $scope.paging.push($scope.pagenum - 2, $scope.pagenum - 1, $scope.pagenum, $scope.pagenum + 1, $scope.pagenum + 2)
                    } else if ($scope.pagenum + 1 <= response.totalpagenum) {
                        $scope.paging.push($scope.pagenum - 3, $scope.pagenum - 2, $scope.pagenum - 1, $scope.pagenum, $scope.pagenum + 1)
                    } else if ($scope.pagenum == response.totalpagenum) {
                        $scope.paging.push($scope.pagenum - 4, $scope.pagenum - 3, $scope.pagenum - 2, $scope.pagenum - 1, $scope.pagenum)
                    }

                } else {
                    // console.log(response.totalpagenum)
                    for (let i = 1; i <= response.totalpagenum; i++) {
                        $scope.paging.push(i);
                        if (i == 5) {
                            break;
                        }
                    }
                }


            }).catch(function (error) {
                console.log(error, "ERROR")
                // if (error.status === 401)
                //     denied()
            });
        }

        // $(document).ready(function () {
        //     var x;
        //     for (x in $scope.smartTableData) {
        //         $("#loading_return" + $scope.smartTableData[x]["id"]).hide();
        //         $("#loading_celery" + $scope.smartTableData[x]["id"]).hide();
        //         console.log('loading_celery' + $scope.smartTableData[x]["id"])
        //     }
        // })
        // $(document).ready(function () {
        //     var x;
        //     for (x in $scope.smartTableData) {
        //         console.log($scope.smartTableData[x]["id"])
        //         $("#loading_return"  + $scope.smartTableData[x]["id"]).hide();
        //     }
        // })

        // $scope.formData.category = {'selected': 'All', 'options': ['All']};
        // $scope.formData.category = ['All'];
        // $(document).ready(function () {
        //     $(".btn").hide();
        //     $("#btn").hide();
        // })
        // $('.btn').each(function (f) {
        //     console.log(f)
        //     //this function will execute for each element with the class "film"
        //     //refer to the current element during this function using "$(this)"
        // });
        /////////////////////////////////////////////////////////////////
        $scope.prev = function () {
            if ($scope.pagenum > 1) {
                $scope.pagenum -= 1;
            }
            loadData();
        };
        $scope.next = function () {
            $scope.pagenum += 1;
            $scope.goto.page = $scope.pagenum
            loadData();
        };
        $scope.pressnum = function (num) {

            if ($scope.pagenum != num) {
                $scope.pagenum = num;
                $scope.goto.page = num;
                loadData();
            }

        };

        $scope.gopage = function () {

            if ($scope.pagenum != $scope.goto.page && $scope.goto.page >= 1 && $scope.goto.page <= $scope.totalpagenum && Number.isInteger($scope.goto.page) == true) {
                $scope.pagenum = $scope.goto.page;
                loadData();
            }

        };
        $scope.getfilter = function () {

            $scope.filterflag = true;
            $scope.pagenum = 1;
            loadData();
        };
        /////////////////////////////////////////////////////////////////

        $scope.clear = clear;

        function clear() {
            $scope.goto.page = 1;
            $scope.select_status.selected = "All";
            $scope.formData.no_rujukan = "";
            $scope.category.selected = "All";
            $scope.formData.status = "";
            $scope.formData.date_report = "";
            $scope.pagenum = 1;
            $scope.selectedList = {};
            $scope.selection = [];
            $scope.formData.isAllSelected = false;
            loadData();

        }

        // -------------------------------- view ------------------------------------------
        $scope.view = function (id, status) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: '../static/app' + gversion + '/pages/report/widgets/view.html',
                controller: 'ReportViewCtrl',
                keyboard: false,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    items: function () {
                        return id;
                    },
                    status: function () {
                        return status;
                    }
                }
            });

            modalInstance.result.then(function () {
                loadData();
            }, function () {
                // $log.info('Modal dismissed at: ' + new Date());
            });

        };

        // -------------------------------- add modal ------------------------------------------
        $scope.open = function (page, size) {
            var modalInstance = $uibModal.open({
                animation: true,
                templateUrl: page,
                controller: 'reportCreateCtrl',
                controllerAs: 'CcreateCtrl',
                size: size,
                resolve: {
                    items: function () {
                        return $scope.items;
                    }
                }
            });

        };

        $scope.$on('status_celery', function (e, report_id, type_process) {
            process_celery(report_id, type_process)

        });

        /*######################## START PROCESS CELERY   #########################*/
        function process_celery(report_id, type_process) {
            if (type_process == "start_update_status_process_celery") {
                if ($("#processing" + report_id).length) {
                    //object already exists
                } else {

                    $('#tr' + report_id + " #td" + report_id).append('<style>    .blink {\n' +
                        '        animation: blinker 0.6s linear infinite;\n' +
                        '        /*color: #1c87c9;*/\n' +
                        '        /*font-size: 30px;*/\n' +
                        '        font-weight: bold;\n' +
                        '        font-family: sans-serif;\n' +
                        '    }\n' +
                        '\n' +
                        '    .blink-del {\n' +
                        '        animation: blink-del 1.4s linear infinite;\n' +
                        '    }\n' +
                        '\n' +
                        '    @keyframes blink-del {\n' +
                        '        100% {\n' +
                        '            opacity: 0;\n' +
                        '        }\n' +
                        '    }</style>   ' +
                        '<span class="blink blink-del" id="processing' + report_id +
                        '"style="color:  #20ff07;padding-top: inherit;color:  #0eff10;">Processing</span>');

                }
            }
            if (type_process == "finish_update_status_process_celery") {
                $('#processing' + report_id).remove();
            }


            if (type_process == "start_delete_process_celery") {
                var del = [];
                for (var x in report_id) {
                    if ($("#deleting" + report_id[x]).length) {  /*Delete Already In Process*/
                        // $('#deleting' + report_id[x]).remove();

                    } else {
                        del.push(report_id[x])
                        $("#celery_process" + report_id[x]).hide();
                        // $('#tr' + report_id[x] + " #td" + report_id[x]).append('Deleting');
                        $('#tr' + report_id[x] + " #td" + report_id[x]).append('<style>    .blink {\n' +
                            '        animation: blinker 0.6s linear infinite;\n' +
                            '        /*color: #1c87c9;*/\n' +
                            '        /*font-size: 30px;*/\n' +
                            '        font-weight: bold;\n' +
                            '        font-family: sans-serif;\n' +
                            '    }\n' +
                            '\n' +
                            '    .blink-del {\n' +
                            '        animation: blink-del 1.4s linear infinite;\n' +
                            '    }\n' +
                            '\n' +
                            '    @keyframes blink-del {\n' +
                            '        100% {\n' +
                            '            opacity: 0;\n' +
                            '        }\n' +
                            '    }</style>   ' +
                            '<span class="blink blink-del" id="deleting' + report_id[x] +
                            '"style="color:  #ff211c;padding-top: inherit;color:  #ff211c;">Deleting</span>');

                    }

                }
                return del
            }
            if (type_process == "finish_delete_process_celery") {
                for (var x in report_id) {
                    if ($("#deleting" + report_id[x]).length) {  /*Delete Already In Process*/
                        $('#deleting' + report_id[x]).remove();
                        $("#celery_process" + report_id[x]).show();

                    }
                }


            }
        }

        /*######################## END PROCESS CELERY   #########################*/
        // function loading_be_celery(report_id) {
        //
        //
        //
        // }

        $scope.delete = function () {
            var selection = [];
            angular.forEach($scope.selectedList, function (selected, bind) {
                if (selected) {
                    selection.push(bind);
                }
            });

            if (selection.length == 0) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '../static/app' + gversion + '/pages/asset/widgets/alert.html',
                    size: "sm",
                    resolve: {
                        items: function () {
                            return selection;
                        }
                    }
                });
            } else {

                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '../static/app' + gversion + '/pages/asset/widgets/delete.html',
                    // controller: 'dltReportCtrl',
                    // controllerAs: 'dAssetCtrl',
                    size: "sm",
                    resolve: {
                        list_del: function () {
                            return selection;
                        },
                        list_data: function () {
                            return $scope.smartTableData;
                        },

                    },
                    controller: function ($scope, $uibModalInstance, list_del, list_data) {
                        $scope.confirmDel = function () {
                            var check = 0;
                            if ($scope.totalpagenum == $scope.pagenum) { /*Check Kalau ad Last page delete semua */

                                for (var x in list_data) {
                                    if (list_del.includes(list_data[x]["id"]))
                                        check = check + 1;
                                }

                            }


                            list_del = process_celery(list_del, "start_delete_process_celery");

                            $http.delete(ip_report + 'delete_report/' + JSON.stringify(list_del)).then(function (response) {
                                toastr.success('Delete data in process.', 'Process!');
                                var timer = setInterval(function () {
                                    $.getJSON(ip_report + "status_delete_report_long/" + response.data['task_id'], function (data) {
                                        list_del = process_celery(list_del, "start_delete_process_celery");
                                        if (data["status"] == "SUCCESS") {
                                            clearInterval(timer);
                                            if (check == list_data.length) {
                                                // paging_last_page()

                                            }
                                            loadData();
                                            process_celery(list_del, "finish_delete_process_celery");
                                        }
                                        if (data["status"] == "FAILURE") {
                                            clearInterval(timer);
                                            if (check == list_data.length) {
                                                // paging_last_page()

                                            }
                                            loadData();
                                            process_celery(list_del, "finish_delete_process_celery");
                                        }
                                    })
                                }, 2000);


                            }).catch(function (error) {
                                console.log(error, "ERROR")
                                // if (error.status === 401)
                                //     denied()
                            });


                        }; //function end
                    }, //controller end


                });


                modalInstance.result.finally(function () {
                    $scope.selectedList = {};
                    $scope.selection = [];
                    $scope.formData.isAllSelected = false;
                });
            }
        };
        $scope.resend_report = function resend_report(report_id) {

            $("#forward" + report_id).hide();
            $("#loading_return" + report_id).show();

            $http.post(ip_report + 'resend_report/' + report_id).then(function (response) {
                toastr.warning('Resend report in process.', 'Info!');
                if (response.data['status'] == "OK") {
                    // modalInstance.close();
                    var timer = setInterval(function () {
                        $.getJSON(ip_report + "status_work_report_long/" + response.data['task_id'], function (data) {
                            $("#forward" + report_id).hide();
                            $("#loading_return" + report_id).show();
                            if (data["status"] == "SUCCESS") {
                                $scope['loading' + report_id] = false;
                                clearInterval(timer);
                                loadData();
                                $("#forward" + report_id).show();
                                $("#loading_return" + report_id).hide();
                            }
                            if (data["status"] == "FAILURE") {
                                $scope['loading' + report_id] = false;
                                clearInterval(timer);
                                loadData();
                                $("#forward" + report_id).show();
                                $("#loading_return" + report_id).hide();
                            }
                        })
                    }, 2000);

                } else {
                    // toastr.error("Data hasn't forward.", 'Error!');
                }
            }).catch(function (error) {
                console.log(error, "ERROR")
                // if (error.status === 401) {
                //     denied()
                // }
            });

        }


    }


})();
