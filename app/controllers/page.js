angular.module('MyApp')
  .controller('PageCtrl', function($scope, $routeParams, $auth, $sce, $window, WebsiteSections, WebsiteSectionGit) {
      var websiteId = $routeParams.websiteId;
      var id = $routeParams.id;
      $scope.section = {id: 0, name:'', path:'', template_id: 0, template:{}};
      $scope.data = '';
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
          return WebsiteSectionGit.clone(websiteId, id).then(function (response) {
              try {
                  $scope.data = JSON.parse(response.data.text);
                  $scope.loaded = true;
              }catch(e){
                  console.error(e);
                  $scope.messages = {
                      error: [{msg:'Error during parsing JSON'}]
                  };
                  return ;
              }

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