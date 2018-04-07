var CACHE_NAME = "newsAPI_cache_v2";
var urlsToCache=[
	'/admin/css/main.css',
    '/admin/templates/allPosts.html',
    '/admin/templates/nav.html',
	'/admin/js/searchbox.js',
    '/common/modules/posts.js',
    '/admin/js/app.js',
    '/admin/dashboard',
    '/admin/js/controllers.js',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
    'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.15/angular.js',
    'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.15/angular-ui-router.js',
    'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.4.2/angular-sanitize.js',
    'https://cdn.rawgit.com/showdownjs/showdown/1.0.2/dist/showdown.min.js'
];
self.addEventListener('install', function (event){
	event.waitUntil(
		caches.open(CACHE_NAME).then(function(cache){
			console.log('cache opened');
			return cache.addAll(urlsToCache);
		})
	);
});
self.addEventListener('fetch', function (event) {
    //console.log(event.request);
    
    event.respondWith(
        //new Response("Hello world")
        
        caches.match(event.request).then(function (response) {
            if (response) {
                console.log('fetching from cache: ', response.url);
                return response;
            }
            var fetchRequest = event.request.clone();

            return fetch(fetchRequest).then(function (response) {
                if (response.status == 404) {
                    console.log('handle this');
                    return response;
                }
                var responseToCache = response.clone();

                caches.open(CACHE_NAME).then(function (cache) {
                    //cache.put(event.request, responseToCache);
                })
                console.log(response);
                return response;
            });
        }) 
    ) 
})
