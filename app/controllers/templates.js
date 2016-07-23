angular.module('MyApp')
  .controller('TemplatesCtrl', function($scope, $auth, Templates) {
        $scope.templates = [];
        if($auth.isAuthenticated()) {
            Templates.getTemplates().then(function (response) {
                $scope.templates = response.data.templates;
            }).catch(function (response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        }
        $scope.updateTemplates = function () {

        }
  });