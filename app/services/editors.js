angular.module('MyApp')
  .factory('Editors', function($http) {
    return {
        getEditors: function() {
          return $http.get('/editors/all');
        },
        postEditor: function(data) {
            return $http.post('/editors', data);
        },
        putEditor: function(id , data) {
            return $http.put('/editors/'+id, data);
        },
        deleteEditor: function(id, data) {
            return $http.delete('/editors/'+id, data);
        },
    };
  });