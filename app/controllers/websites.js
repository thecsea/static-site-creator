angular.module('MyApp')
  .controller('WebsitesCtrl', function($scope, $auth, Websites) {
        $scope.websites = [];
        if($auth.isAuthenticated()) {
            Websites.getWebsites().then(function (response) {
                $scope.websites = response.data.websites;
            }).catch(function (response) {
                $scope.messages = {
                    error: Array.isArray(response.data) ? response.data : [response.data]
                };
            });
        }
        $scope.updateWebsites = function () {

        }
  });