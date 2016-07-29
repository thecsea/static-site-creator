angular.module('MyApp')
  .controller('EditorsCtrl', function($scope, $auth, Editors) {
        $scope.editors = [];
        $scope.currentEditor = {id:0, name:'', email: '', password:''};
        if($auth.isAuthenticated()) {
            getEditors();
        }

      $scope.newEditor = function () {
          $scope.currentEditor = {id:0, name:'', email: '', password:''};
      }

      $scope.updateEditor = function (index) {
          $scope.currentEditor = $scope.editors[index];
      }

      $scope.deleteEditor = function (index) {
          $scope.currentEditor = $scope.editors[index];
      }

      $scope.deleteCurrentEditor = function () {
          Editors.deleteEditor($scope.currentEditor.id).then(function (response) {
              $scope.messages = {
                  success: [{msg:'Editor deleted'}]
              };
              getEditors();
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      $scope.saveCurrentEditor = function () {
          var func = null;
          if($scope.currentEditor.id == 0)
              func = Editors.postEditor($scope.currentEditor);
          else {
              if($scope.currentEditor.password == '')
                  delete $scope.currentEditor.password;
              func = Editors.putEditor($scope.currentEditor.id, $scope.currentEditor);
          }
          func.then(function (response) {
              $scope.messages = {
                  success: [{msg:$scope.currentEditor.id == 0?'Editor created':'Editor updated'}]
              };
              $('#popup').modal('hide');
              getEditors();
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