angular.module('MyApp')
  .controller('PageCtrl', function($scope, $routeParams, $auth, $sce, $window, WebsiteSections, WebsiteSectionGit) {
      var websiteId = $routeParams.websiteId;
      var id = $routeParams.id;
      $scope.section = {id: 0, name:'', path:'', template_id: 0, template:{}};
      $scope.status = {id: 0, status:'', data:''};
      $scope.html = '';
      $scope.loaded = false;
      $scope.uploading = false;

      if($auth.isAuthenticated()) {
          Promise.all([
          getSection(),
          getData()
        ]).then(function(){
              $scope.html = ((new $window.libs.pug($scope.section.template.parsedStructure)).parse().html);
              $scope.$apply(); //needed since we are inside a promise
          });
      }

      $scope.save = function () {
          if($scope.uploading)
              return;
          $scope.uploading = true;
          try {
              var text = JSON.stringify($scope.data, null, 4);
          }catch(e)
          {
              console.error(e);
              $scope.messages = {
                  error: [{msg:'Error during parsing JSON'}]
              };
              return ;
          }
          WebsiteSectionGit.push(websiteId, id, {text:text}).then(function (response) {
              $scope.uploading = false;
              $scope.messages = {
                  success: [{msg:'Contents saved'}]
              };
          }).catch(function (response) {
              $scope.uploading = false;
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      function getSection(){
          return WebsiteSections.getWebsiteSection(websiteId, id).then(function (response) {
              $scope.section = response.data.websiteSection;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      function getData(){
          var resolvePromise = function(){};
          var rejectPromise = function(){};
          var sectionPromise = new Promise(function(resolve, reject){resolvePromise = resolve; rejectPromise = reject;});
          return WebsiteSectionGit.clone(websiteId, id).then(function (response) {
              $scope.status = response.data.status;
              var interval = null;
              interval = $window.setInterval(function(){
                  return WebsiteSectionGit.status(websiteId, id, $scope.status.id).then(function (response) {
                      $scope.status = response.data.status;
                      //err
                      if ($scope.status.status == -1) {
                          $scope.messages = {
                              error: [{msg: 'Error during parsing JSON'}]
                          };
                          rejectPromise();
                          $window.clearInterval(interval);
                      }
                      else if ($scope.status.completed) {
                          try {
                              $scope.status.data = JSON.parse(response.data.status.data);
                              $scope.loaded = true;
                              resolvePromise();
                          } catch (e) {
                              console.error(e);
                              $scope.messages = {
                                  error: [{msg: 'Error during parsing JSON'}]
                              };
                              rejectPromise();
                          }
                          $window.clearInterval(interval);
                      }
                  }).catch(function (response) {
                      //TODO stop after 2/3 failures
                      $scope.messages = {
                          error: Array.isArray(response.data) ? response.data : [response.data]
                      };
                      rejectPromise();
                      $window.clearInterval(interval);
                  });
              },250);
              return sectionPromise;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }
  }).directive("compileHtml", function( $compile) {
    return {
        restrict: "E",
        require: '^ngModel',
        link: function (scope, element, attributes) {
            scope.$watch(attributes.ngModel, function(newVal) {
                //check if undefined
                if(!newVal) return;
                element.append($compile(newVal)(scope))
            });
        }
    }
});