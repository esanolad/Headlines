
var postsModule = angular.module('mean-blog.posts', []);

postsModule.service('Posts', function($http){
	return {
		all: function(){
			return $http.get('/api/posts').then(function(postList){
				return postList.data;
			});
		},
		country: function(countryCode){
			var link= '/api/posts/' + countryCode;
			return $http.get(link).then(function(postList){
				return postList.data;
			});
		},
		sources: function(source){
			var link= '/api/sources/' + source;
			return $http.get(link).then(function(postList){
				return postList.data;
			});
		},
		add: function(newPost){
			return $http({
				method: 'post',
				url: '/api/posts',
				data: newPost
			}).then(function(res){
				// return the new post
				return res.data;
			}).catch(function(err){
				console.error('Something went wrong adding the post!');
				console.error(err);
				return err;
			});
		},
		remove: function(){

		},
		update: function(){

		}
	};
});