'use strict';

describe('Controller: NearbyCtrl', function () {

  // load the controller's module
  beforeEach(module('cbtNgCssApp'));

  var NearbyCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NearbyCtrl = $controller('NearbyCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(NearbyCtrl.awesomeThings.length).toBe(3);
  });
});
