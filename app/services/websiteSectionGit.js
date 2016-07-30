angular.module('MyApp')
  .factory('WebsiteSectionGit', function($http) {
    return {
        clone: function(WebsiteId, id) {
            return $http.get('/websites/'+WebsiteId+'/sections/'+id+'/git/clone');
        },
        push: function(WebsiteId, id, data) {
            return $http.put('/websites/'+WebsiteId+'/sections/'+id+'/git/push', data);
        },
        status: function(WebsiteId, sectionId, id, data) {
            return $http.get('/websites/'+WebsiteId+'/sections/'+sectionId+'/git/status/'+id+'/get', data);
        },
    };
  });