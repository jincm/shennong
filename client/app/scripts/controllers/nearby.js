'use strict';

/**
 * @ngdoc function
 * @name NgApp.controller:NearbyCtrl
 * @description
 * # NearbyCtrl
 * Controller of the NgApp
 */
angular.module('NgApp')
  .controller('NearbyCtrl', function ($scope, $http) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    //toggle with navbar
    $scope.nearby_handle_toggle = function(click_index) {
      $scope.currentIndex = click_index;
      console.log('click nearby ' + click_index + ' end');
    };

    //upload file to server
    $scope.upload_file = function(){
      var url = "/api/v1/activity/lost/10008/upload_imgs";
      console.log("upload file start");
      var fd = new FormData();
      var file = document.querySelector('input[type=file]').files[0] ;//$scope.myFile;
      fd.append('file', file);
      fd.append('token', $scope.token);
      var promise = $http({
        method: 'POST',
        url: url,
        data: fd,
        headers: {'Content-Type':undefined},
        transformRequest: angular.identity
      });

      promise.success(function(data, status, config, headers){
        console.log("upload result data is " + JSON.stringify(data));
      });

      promise.error(function(data, status, config, headers){
        console.log("upload result data error is " + JSON.stringify(data));
      });
    };
  });
