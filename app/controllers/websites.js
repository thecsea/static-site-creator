angular.module('MyApp')
  .controller('WebsitesCtrl', function($scope, $auth, Websites) {
        $scope.websites = [];
        $scope.currentWebsite = {id:0, name:'', url: '', git_url:''};
        if($auth.isAuthenticated()) {
            getWebsites();
        }

      $scope.newWebsite = function () {
          $scope.currentWebsite = {id:0, name:'', url: '', git_url:''};
      }

      $scope.updateWebsite = function (index) {
          $scope.currentWebsite = $scope.websites[index];
      }

      $scope.deleteWebsite = function (index) {
          $scope.currentWebsite = $scope.websites[index];
      }

      $scope.deleteCurrentWebsite = function () {
          Websites.deleteWebsite($scope.currentWebsite.id).then(function (response) {
              $scope.websites = response.data.websites;
              $scope.messages = {
                  success: [{msg:'Website deleted'}]
              };
              getWebsites();
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      $scope.saveCurrentWebsite = function () {
          var func = null;
          if($scope.currentWebsite.id == 0)
              func = Websites.postWebsite($scope.currentWebsite);
          else
              func = Websites.putWebsite($scope.currentWebsite.id, $scope.currentWebsite);
          func.then(function (response) {
              $scope.websites = response.data.websites;
              $scope.messages = {
                  success: [{msg:$scope.currentWebsite.id == 0?'Website created':'Website updated'}]
              };
              $('#popup').modal('hide');
              getWebsites();
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      function getWebsites(){
          Websites.getWebsites().then(function (response) {
              $scope.websites = response.data.websites;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }
  });