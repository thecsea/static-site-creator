angular.module('MyApp')
  .controller('WebsitesCtrl', function($scope, $rootScope, $auth, Websites, Editors) {
        $scope.websites = [];
        $scope.editors = [];
        $scope.currentWebsite = {id:0, name:'', url: '', git_url:'', editors: []};
        if($auth.isAuthenticated()) {
            getWebsites();
            getEditors();
        }

      $scope.newWebsite = function () {
          $scope.currentWebsite = {id:0, name:'', url: '', git_url:'', editors: []};
      }

      $scope.updateWebsite = function (index) {
          $scope.currentWebsite = $scope.websites[index];
      }

      $scope.deleteWebsite = function (index) {
          $scope.currentWebsite = $scope.websites[index];
      }

      $scope.deleteCurrentWebsite = function () {
          Websites.deleteWebsite($scope.currentWebsite.id).then(function (response) {
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
              var i;
              for(i = 0; i<response.data.websites.length; i++)
                  response.data.websites[i].editors = $rootScope.libs.utils.pluck(response.data.websites[i].editors, 'id');
              $scope.websites = response.data.websites;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      function getEditors(){
          Editors.getEditors().then(function (response) {
              $scope.editors = response.data.editors;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }
  });