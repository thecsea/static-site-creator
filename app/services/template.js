angular.module('MyApp')
  .factory('Templates', function($http) {
    return {
        getTemplates: function() {
          return $http.get('/Templates/all');
        },
        postTemplate: function(data) {
            return $http.post('/Templates', data);
        },
        putTemplate: function(data) {
            return $http.put('/Templates', data);
        },
        deleteTemplate: function(data) {
            return $http.delete('/Templates', data);
        },
    };
  });