'use strict';

/**
 * @ngdoc function
 * @name NgApp.controller:NearbyCtrl
 * @description
 * # NearbyCtrl
 * Controller of the NgApp
 */
angular.module('NgApp')
  .controller('NearbyCtrl', function ($scope) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    //toggle with navbar
    $scope.nearby_handle_toggle = function(click_index) {
      $scope.currentIndex = click_index;
      console.log('click nearby ' + click_index + ' end');
    }
  });
