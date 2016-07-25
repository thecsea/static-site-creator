angular.module('MyApp')
  .factory('Templates', function($http) {
    return {
        getTemplates: function() {
          return $http.get('/templates/all');
        },
        postTemplate: function(data) {
            return $http.post('/templates', data);
        },
        putTemplate: function(id, data) {
            return $http.put('/templates/'+id, data);
        },
        deleteTemplate: function(id, data) {
            return $http.delete('/templates/'+id, data);
        },
    };
  });