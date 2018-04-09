
var adminApp = angular.module('mean-blog.admin', [
	'ui.router',
	'btford.markdown',
	'mean-blog.posts'
]);

adminApp.config(function($stateProvider, $urlRouterProvider){

	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('post', {
			url: '/dashboard/:countryCode',
			templateUrl: '/admin/templates/allPosts.html',
			resolve: {
				postList: function(Posts, $stateParams){
					return Posts.country($stateParams.countryCode).then(function(data){
						return data;
					});
				}
			},
			controller: 'AllPostsCtrl'
		})
		.state('sources', {
			url: '/sources/:source',
			templateUrl: '/admin/templates/allPosts.html',
			resolve: {
				postList: function(Posts, $stateParams){
					return Posts.sources($stateParams.source).then(function(data){
						return data;
					});
				}
			},
			controller: 'AllPostsCtrl'
		})
		
		.state('addPost', {
			url: '/addPost',
			templateUrl: '/admin/templates/addPost.html',
			controller: 'AddPostCtrl'
		});
});

