angular.module('MyApp')
  .factory('Websites', function($http) {
    return {
        getWebsites: function() {
          return $http.get('/websites/all');
        },
        postWebsite: function(data) {
            return $http.post('/websites', data);
        },
        putWebsite: function(data) {
            return $http.put('/websites', data);
        },
        deleteWebsite: function(data) {
            return $http.delete('/websites', data);
        },
    };
  });