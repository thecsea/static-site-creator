angular.module('MyApp')
  .controller('TemplatesCtrl', function($scope, $auth, Templates) {
      $scope.templates = [];
      $scope.currentTemplate = {id:0, name:'', structure: '{}'};
      if($auth.isAuthenticated()) {
          getTemplates();
      }
      $scope.newTemplate = function () {
          $scope.currentTemplate = {id:0, name:'', structure: '{}'};
      }

      $scope.updateTemplate = function (index) {
          $scope.currentTemplate = $scope.templates[index];
          try{
              $scope.currentTemplate.structure = JSON.stringify($scope.currentTemplate.parsedStructure, null, 4);
          }catch(e){
              $scope.messages = {
                  error: [{msg:'Error during parsing JSON'}]
              };
              $('#popup').modal('hide');
          }
      }

      $scope.cloneTemplate = function (index) {
          var tmp = JSON.parse(JSON.stringify($scope.templates[index]))
          tmp.id = 0;
          $scope.currentTemplate = tmp;
          try{
              $scope.currentTemplate.structure = JSON.stringify($scope.currentTemplate.parsedStructure, null, 4);
          }catch(e){
              $scope.messages = {
                  error: [{msg:'Error during parsing JSON'}]
              };
              $('#popup').modal('hide');
          }
      }

      $scope.deleteTemplate = function (index) {
          $scope.currentTemplate = $scope.templates[index];
      }

      $scope.deleteCurrentTemplate = function () {
          Templates.deleteTemplate($scope.currentTemplate.id).then(function (response) {
              $scope.messages = {
                  success: [{msg:'Template deleted'}]
              };
              getTemplates();
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      $scope.saveCurrentTemplate = function () {
          var func = null;
          try{
              $scope.currentTemplate.parsedStructure = JSON.parse($scope.currentTemplate.structure);
          }catch(e){
              $scope.messages = {
                  error: [{msg:'Error during parsing JSON'}]
              };
              return ;
          }
          if($scope.currentTemplate.id == 0)
              func = Templates.postTemplate($scope.currentTemplate);
          else
              func = Templates.putTemplate($scope.currentTemplate.id, $scope.currentTemplate);
          func.then(function (response) {
              $scope.messages = {
                  success: [{msg:$scope.currentTemplate.id == 0?'Template created':'Template updated'}]
              };
              $('#popup').modal('hide');
              getTemplates();
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