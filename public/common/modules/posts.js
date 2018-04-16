
var postsModule = angular.module('mean-blog.posts', []);

postsModule.service('Posts', function($http){
	return {
		all: function(){
			return $http.get('/api/posts').then(function(postList){
				return postList.data;
			});
		},
		country: function(countryCode){
			var link= 'api/posts/' + countryCode;
            return $http.get(link).then(function (postList) {
                //console.log(postList.data);
				return postList.data;
			});
		},
		sources: function(source){
			var link= 'api/sources/' + source;
			return $http.get(link).then(function(postList){
				return postList.data;
			});
		},
		favourite: function(){
			//var link= '/api/favourite' + source;
			return $http.get('api/favourite/').then(function(postList){
				return postList.data;
			});
		},
		
	};
});