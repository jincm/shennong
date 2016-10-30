'use strict';

describe('Controller: YouniCtrl', function () {

  // load the controller's module
  beforeEach(module('cbtNgCssApp'));

  var YouniCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    YouniCtrl = $controller('YouniCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(YouniCtrl.awesomeThings.length).toBe(3);
  });
});
