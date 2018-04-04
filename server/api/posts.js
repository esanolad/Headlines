const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('bcbafab6ed8346c38c2f73af951065dc');
//var Post = require('../models/post');

// Posts API
module.exports = function(apiRouter){
	
	// get all posts
	apiRouter.get('/posts', function(req, res){
		newsapi.v2.topHeadlines({
				country:'us'
			}).then(response => {
			  	//console.log(response);
			  	res.json(response);
		}); 
	});

	apiRouter.get('/posts/:countryCode', function(req, res){
		newsapi.v2.topHeadlines({
				country:req.params.countryCode,
				//language: 'en'
			}).then(response => {
			  	//console.log(response);
			  	res.json(response);
		}); 
	});
	apiRouter.get('/sources/:source', function(req, res){
		//console.log('API sources');
		newsapi.v2.topHeadlines({
				//language: 'en',
				sources:req.params.source
			}).then(response => {
			  	//console.log(response);
			  	res.json(response);
		}); 
	});
};