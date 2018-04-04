var express = require('express'),
	path = require('path'),
	//User = require('./models/user'),
	rootPath = path.normalize(__dirname + '/../'),
	apiRouter = express.Router(),
	router = express.Router();

module.exports = function(app, passport){	
	app.use('/api', apiRouter);
	app.use('/', router);

	// API routes
	require('./api/posts')(apiRouter);
	
	router.get('/admin/dashboard/:countryCode', function(req, res){
		res.render('admin/dashboard', {countryCode: req.params.countryCode});
	});
	
	router.get('/admin/dashboard', function(req, res){
		res.render('admin/dashboard'); //, {user: req.user}
	});

	router.get('/admin/sources', function(req, res){
		res.render('admin/dashboard', {sources: req.params.source});
	});
	router.get('/admin/sources/:source', function(req, res){
		res.render('admin/dashboard', {sources: req.params.source});
	}); 

	app.use(function(req, res, next){
		res.status(404);

		res.render('404');
		return;
	});
	
};
/*
function isAdmin(req, res, next){
	if(req.isAuthenticated() && req.user.email === 'lado'){
		console.log('cool you are an admin, carry on your way');
		next();
	} else {
		console.log('You are not an admin');
		res.redirect('/admin');
	}
} */