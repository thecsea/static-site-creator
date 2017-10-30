angular.module('MyApp')
  .controller('WebsitesCtrl', function($scope, $rootScope, $auth, Websites, Editors) {
        $scope.websites = [];
        $scope.editors = [];
        $scope.currentWebsite = {id:0, name:'', url: '', git_url:'', branch:'', webhook:'', editors: []};
        if($auth.isAuthenticated()) {
            getWebsites();
            getEditors();
        }

      $scope.newWebsite = function () {
          if(!$rootScope.isAdmin())
              return;
          $scope.currentWebsite = {id:0, name:'', url: '', git_url:'', branch:'', webhook:'', editors: []};
      }

      $scope.updateWebsite = function (index) {
          if(!$rootScope.isAdmin())
              return;
          $scope.currentWebsite = $scope.websites[index];
      }

      $scope.deleteWebsite = function (index) {
          if(!$rootScope.isAdmin())
              return;
          $scope.currentWebsite = $scope.websites[index];
      }

      $scope.deleteCurrentWebsite = function () {
          if(!$rootScope.isAdmin())
              return;
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
          if(!$rootScope.isAdmin())
              return;
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
              // we have editors only if we are admin
              if($rootScope.isAdmin())
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
          if(!$rootScope.isAdmin())
              return;
          Editors.getEditors().then(function (response) {
              $scope.editors = response.data.editors;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }
  });