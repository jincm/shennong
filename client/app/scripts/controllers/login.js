'use strict';

/**
 * @ngdoc function
 * @name NgApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the NgApp
 */
angular.module('NgApp')
  .controller('LoginCtrl', [
    '$scope',
    '$http',
    '$window',
    '$location',
    function ($scope, $http, $window, $location) {
      this.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma'
      ];

      console.log('login.js here and get name from localStorage is ' + $window.localStorage.getItem('name') );
      $scope.login = {};


      console.log("login page input is " + JSON.stringify($scope.login));

      $scope.mylogin = function () {
        $http({
          method: 'POST',
          headers:{'content-type': 'application/json'},
          url: '/api/v1/user/login',
          data: {
            'account':$scope.login.phone,
            'passwd':$scope.login.passwd
          }}).success(function(data, header, config, status){
          console.log("login result data is " + JSON.stringify(data));

          if(data.user_id != null){
            alert("登陆成功，用户编号:" + JSON.stringify(data.user_id));
            $scope.is_authed = true;
            console.log('login success and set name ' + data.user_id + ' ' + data.token);
            $window.localStorage.setItem('name', data.user_id);
            $scope.token = data.token;
            $window.localStorage.setItem('token', data.token);
            $location.path('/nearby').replace();
            //$window.location.href = '/#/nearby';
          }
          else {
            alert("登陆失败，密码不对");
          }
        }).error(function(data, header, config, status){
          console.log("login error result data is " + JSON.stringify(data));
        });

        //promise.success(function(data, status, config, headers){
        //  console.log("register result data is " + JSON.stringify(data));
        //  alert("用户编号:" + JSON.stringify(data.user_id))
        //});
      };

      $scope.myregister = function() {
        console.log("register start");
        var promise = $http({
          method: 'POST',
          headers:{'content-type': 'application/json'},
          url: '/api/v1/user/register',
          data: {
            'account':$scope.login.phone,
            'identify_code':$scope.login.identify_code,
            'passwd':$scope.login.passwd
          }});

        promise.success(function(data, status, config, headers){
          console.log("register result data is " + JSON.stringify(data));
          alert("用户编号:" + JSON.stringify(data.user_id))
        });
        promise.error(function(data, status, config, headers){
          console.log("register result is " + JSON.stringify(data));
        });
        console.log("register end");
      };

      $scope.get_identify_code = function() {
        console.log("input is " + JSON.stringify($scope.login));
        var promise = $http({
          method: 'GET',
          url: '/api/v1/user/register',
          params: {
            'account':$scope.login.phone
          }});
        promise.success(function(data, status, config, headers){
          console.log("get_identify_code here;data is " + JSON.stringify(data));
          //console.log("get_identify_code here;identify_code is " + JSON.stringify(data.identify_code));
          alert("验证码是" + JSON.stringify(data.identify_code))

        });
        promise.error(function(data, status, config, headers){
          console.log("get_identify_code error;result is " + JSON.stringify(data));
        });
        console.log("get_identify_code here;result is done");
      };

  }]);
