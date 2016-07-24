angular.module('MyApp')
  .factory('WebsiteSections', function($http) {
    return {
        getWebsiteSections: function(WebsiteId) {
          return $http.get('/websites/'+WebsiteId+'/sections/all');
        },
        postWebsiteSection: function(WebsiteId, data) {
            return $http.post('/websites/'+WebsiteId+'/sections', data);
        },
        putWebsiteSection: function(WebsiteId, data) {
            return $http.put('/websites/'+WebsiteId+'/sections', data);
        },
        deleteWebsiteSection: function(WebsiteId, data) {
            return $http.delete('/websites/'+WebsiteId+'/sections', data);
        },
    };
  });