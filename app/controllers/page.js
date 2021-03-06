angular.module('MyApp')
  .controller('PageCtrl', function($scope, $routeParams, $auth, $sce, $window, WebsiteSections, WebsiteSectionGit) {
      var websiteId = $routeParams.websiteId;
      var id = $routeParams.id;
      $scope.section = {id: 0, name:'', path:'', template_id: 0, template:{}};
      $scope.status = {id: 0, status:'', data:'', total_status:0, status_description:''};
      $scope.statusPush = {id: 0, status:'', data:'', total_status:0, status_description:''};
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
              //var text = JSON.stringify($scope.status.data.toJSON(), null, 4);
              var text = angular.toJson($scope.status.data, true);
          }catch(e)
          {
              console.error(e);
              $scope.messages = {
                  error: [{msg:'Error during parsing JSON'}]
              };
              return ;
          }
          if($scope.messages != null && $scope.messages != undefined) {
              delete $scope.messages.success;
              delete $scope.messages.error;
          }
          var resolvePromise = function(){};
          var rejectPromise = function(){};
          var sectionPromise = new Promise(function(resolve, reject){resolvePromise = resolve; rejectPromise = reject;});
          var inside = false;
          return WebsiteSectionGit.push(websiteId, id, {data:text}).then(function (response) {
              $scope.statusPush = response.data.status;
              var interval = null;
              inside = true;
              interval = $window.setInterval(function(){
                  return WebsiteSectionGit.status(websiteId, id, $scope.statusPush.id, "", "no-data").then(function (response) {
                      $scope.statusPush = response.data.status;
                      //err
                      if ($scope.statusPush.error) {
                          $scope.messages = {
                              error: [{msg: $scope.statusPush.status_description}]
                          };
                          $scope.uploading = false;
                          rejectPromise();
                          $window.clearInterval(interval);
                      }
                      else if ($scope.statusPush.completed) {
                          $scope.uploading = false;
                          $scope.messages = {
                              success: [{msg:'Contents saved'}]
                          };
                          resolvePromise();
                          $window.clearInterval(interval);
                      }
                  }).catch(function (response) {
                      //TODO stop after 2/3 failures
                      $scope.uploading = false;
                      $scope.messages = {
                          error: Array.isArray(response.data) ? response.data : [response.data]
                      };
                      rejectPromise();
                      $window.clearInterval(interval);
                  });
              },500);
              return sectionPromise;
          }).catch(function (response) {
              if(inside)
                  return;
              $scope.uploading = false;
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      };

      function getSection(){
          return WebsiteSections.getWebsiteSection(websiteId, id).then(function (response) {
              $scope.section = response.data.websiteSection;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }

      function getDataCallback(response){
          return new Promise(function(resolve, reject){
              //err
              if ($scope.status.error) {
                  return reject({data:[{msg: $scope.status.status_description}]});
              }
              else if ($scope.status.completed) {
                  return resolve(response);
              }
              return resolve('break');
          });
      }

      function getData(){
          var resolvePromise = function(){};
          var rejectPromise = function(){};
          var sectionPromise = new Promise(function(resolve, reject){resolvePromise = resolve; rejectPromise = reject;});
          var inside = false;
          return WebsiteSectionGit.clone(websiteId, id).then(function (response) {
              $scope.status = response.data.status;
              var interval = null;
              inside = true;
              var statusId = $scope.status.id;
              interval = $window.setInterval(function(){
                  return WebsiteSectionGit.status(websiteId, id, statusId, "", "no-data")
                      .then(function (response) {
                          $scope.status = response.data.status;
                          return getDataCallback(response, interval);
                      }).then(function(status){
                          if(status == 'break') return status;
                          $window.clearInterval(interval);
                          return WebsiteSectionGit.status(websiteId, id, statusId, "", "data");
                      }).then(function (response) {
                          if(response == 'break') return response;
                          $scope.status = response.data.status;
                          return getDataCallback(response).then(function (response) {
                              if(response == 'break')
                                  return Promise.reject({data:[{msg: 'Error during retrieve of data'}]});
                              return response;
                          });
                      }).then(function (response) {
                          if(response == 'break') return response;
                          try {
                              $scope.status.data = JSON.parse($scope.status.data);
                              $scope.loaded = true;
                              return resolvePromise();
                          } catch (e) {
                              console.error(e);
                              return Promise.reject({data:[{msg: 'Error during parsing JSON'}]});
                          }
                      }).catch(function (response) {
                          //TODO stop after 2/3 failures
                          $scope.loaded = true;
                          $scope.messages = {
                              error: Array.isArray(response.data) ? response.data : [response.data]
                          };
                          $window.clearInterval(interval);
                          return rejectPromise();
                    });
              },500);
              return sectionPromise;
          }).catch(function (response) {
              if(inside)
                  return;
              $scope.loaded = true;
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