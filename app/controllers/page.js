angular.module('MyApp')
  .controller('PageCtrl', function($scope, $routeParams, $auth, WebsiteSections, WebsiteSectionGit) {
      var websiteId = $routeParams.websiteId;
      var id = $routeParams.id;
      $scope.section = {id: 0, name:'', path:'', template_id: 0};
      $scope.text = '';

      if($auth.isAuthenticated()) {
          getSection();
          getText();
      }

      function getSection(){
          WebsiteSections.getWebsiteSection(websiteId, id).then(function (response) {
              $scope.section = response.data.websiteSection;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      function getText(){
          WebsiteSectionGit.clone(websiteId, id).then(function (response) {
              $scope.text = response.data.text;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }
  });