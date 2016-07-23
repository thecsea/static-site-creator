angular.module('MyApp')
  .controller('WebsiteCtrl', function($scope, $routeParams, $auth, WebsiteSections) {
        var id = $routeParams.id;
        $scope.website = {name:'', sections:[]};
        if($auth.isAuthenticated()) {
            WebsiteSections.getWebsiteSections(id).then(function (response) {
                $scope.website = response.data.website;
            }).catch(function (response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        }
        $scope.updateWebsite = function () {

        }
  });