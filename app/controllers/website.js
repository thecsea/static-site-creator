angular.module('MyApp')
  .controller('WebsiteCtrl', function($scope, $routeParams, $auth, WebsiteSections, Templates) {
      var id = $routeParams.id;
      $scope.currentSection = {id: 0, name:'', path:'', template_id: 0};
      $scope.website = {name:'', sections:[]};
      $scope.templates = [];
      if($auth.isAuthenticated()) {
          getWebsiteSections();
          getTemplates();
      }

      $scope.newSection = function () {
          $scope.currentSection = {id: 0, name:'', path:'', template_id: 0};
      }

      $scope.updateSection = function (index) {
          $scope.currentSection = $scope.website.sections[index];
      }

      $scope.deleteSection = function (index) {
          $scope.currentSection = $scope.website.sections[index];
      }

      $scope.deleteCurrentSection = function () {
          WebsiteSections.deleteWebsiteSection($scope.website.id, $scope.currentSection.id).then(function (response) {
              $scope.messages = {
                  success: [{msg:'Section deleted'}]
              };
              getWebsiteSections();
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      $scope.saveCurrentSection = function () {
          var func = null;
          if($scope.currentSection.id == 0)
              func = WebsiteSections.postWebsiteSection($scope.website.id, $scope.currentSection);
          else
              func = WebsiteSections.putWebsiteSection($scope.website.id, $scope.currentSection.id, $scope.currentSection);
          func.then(function (response) {
              $scope.messages = {
                  success: [{msg:$scope.currentSection.id == 0?'Section created':'Section updated'}]
              };
              $('#popup').modal('hide');
              getWebsiteSections();
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      function getWebsiteSections(){
          WebsiteSections.getWebsiteSections(id).then(function (response) {
              $scope.website = response.data.website;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      function getTemplates(){
          Templates.getTemplates().then(function (response) {
              $scope.templates = response.data.templates;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }
  });