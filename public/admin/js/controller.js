var idb = require('idb');
idb.open('newsAPI', 1, function (UpgradeDB) {
    var keyValStore = UpgradeDB.createObjectStore('keyval');
    keyValStore.put('world', 'hello');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js').then(function(registration){
      console.log('Registration Successful with scope', registration.scope);
 
    }, function(err){
      console.log('Registration Failed', err);
    });
  });
}
adminApp.controller('NavCtrl', function($scope, $state){
	$scope.active = $state;
	$scope.isActive = function(viewLocation){
		var active = (viewLocation === $state.current.name);
		return active;
	};
});

adminApp.controller('AllPostsCtrl', function ($scope, postList) {
    console.log(postList);

	$scope.posts = postList;
	$scope.activePost = false;
	$scope.setActive = function(post){
		$scope.activePost = post;
	}
});

adminApp.controller('AddPostCtrl', function($scope, Posts){
	$scope.post = {};
	$scope.addPost = function(newPost){
		Posts.add(newPost).then(function(res){
			console.log(res);
		});
	};
});