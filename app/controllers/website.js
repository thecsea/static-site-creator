angular.module('MyApp')
  .controller('WebsiteCtrl', function($scope, $routeParams, $rootScope, $auth, Websites, WebsiteSections, Templates) {
      var id = $routeParams.id;
      $scope.currentSection = {id: 0, name:'', path:'', template_id: 0};
      $scope.website = {name:'', sections:[]};
      $scope.templates = [];
      $scope.copyWebsites = [];
      $scope.copyWebsite = {id: 0, name: ''};
      $scope.copyWebsiteSections = [];
      $scope.copySection = {id: 0, name: ''};
      if($auth.isAuthenticated()) {
          getWebsiteSections();
          getTemplates();
          getCopyWebsites();
      }

      $scope.newSection = function () {
          if(!$rootScope.isAdmin())
              return;
          $scope.currentSection = {id: 0, name:'', path:'', template_id: 0};
          $scope.copyWebsite = {id: 0, name: ''};
          $scope.copyWebsiteSections = [];
          $scope.copySection = {id: 0, name: ''};
      };

      $scope.cloneSection = function (index) {
          if(!$rootScope.isAdmin())
              return;
          var tmp = JSON.parse(JSON.stringify($scope.website.sections[index]))
          tmp.id = 0;
          $scope.currentSection = tmp;
      };

      $scope.updateSection = function (index) {
          if(!$rootScope.isAdmin())
              return;
          $scope.currentSection = $scope.website.sections[index];
      };

      $scope.deleteSection = function (index) {
          if(!$rootScope.isAdmin())
              return;
          $scope.currentSection = $scope.website.sections[index];
      };

      $scope.deleteCurrentSection = function () {
          if(!$rootScope.isAdmin())
              return;
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
      };

      $scope.saveCurrentSection = function () {
          if(!$rootScope.isAdmin())
              return;
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
      };

      $scope.getCopyWebsiteSections = function () {
          if(!$rootScope.isAdmin())
              return;
          WebsiteSections.getWebsiteSections(id).then(function (response) {
              $scope.copyWebsiteSections = response.data.website.sections;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      };

      $scope.cloneCopyWebsiteSection = function () {
          if(!$rootScope.isAdmin())
              return;
          var tmp = JSON.parse(JSON.stringify($scope.copySection))
          tmp.id = 0;
          $scope.currentSection = tmp;
      };

      function getCopyWebsites(){
          Websites.getWebsites().then(function (response) {
              $scope.copyWebsites = response.data.websites;
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
          if(!$rootScope.isAdmin())
              return;
          Templates.getTemplates().then(function (response) {
              $scope.templates = response.data.templates;
          }).catch(function (response) {
              $scope.messages = {
                  error: Array.isArray(response.data) ? response.data : [response.data]
              };
          });
      }
      function hookCollapse(){
          var elements = $('a[data-toggle="collapse"]');
          elements.on('show.bs.collapse',function(){
              var _this = $(this);
              var icon = _this.children[0];
              icon.innerHTML = 'expand_more'
          });
          elements.on('hide.bs.collapse',function(){
              var _this = $(this);
              var icon = _this.children[0];
              icon.innerHTML = 'chevron_right'
          })
      }
      hookCollapse();
  });