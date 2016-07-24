angular.module('MyApp')
  .factory('Websites', function($http) {
    return {
        getWebsites: function() {
          return $http.get('/websites/all');
        },
        postWebsite: function(data) {
            return $http.post('/websites', data);
        },
        putWebsite: function(id , data) {
            return $http.put('/websites/'+id, data);
        },
        deleteWebsite: function(id, data) {
            return $http.delete('/websites/'+id, data);
        },
    };
  });