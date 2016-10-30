'use strict';

/**
 * @ngdoc function
 * @name cbtNgCssApp.controller:NearbyCtrl
 * @description
 * # NearbyCtrl
 * Controller of the cbtNgCssApp
 */
angular.module('cbtNgCssApp')
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
