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

    router.get('/', function (req, res) {
        res.render('dashboard');
    });
    router.get('/favorites', function (req, res) {
        res.render('dashboard');
    });
    
    /*
    router.get('/admin/dashboard/:countryCode', function (req, res) {
        res.render('admin/dashboard', { countryCode: req.params.countryCode });
    });

    router.get('/admin/dashboard', function (req, res) {
        res.render('admin/dashboard');
    });
	router.get('/admin/sources', function(req, res){
		res.render('admin/dashboard', {sources: req.params.source});
	});
	router.get('/admin/sources/:source', function(req, res){
		res.render('admin/dashboard', {sources: req.params.source});
	}); 
	router.get('/admin/js/sw/index.js', function(req, res){
		res.render('admin/js/sw/index.js');
	}); */
	app.use(function(req, res, next){
		res.status(404);

		res.render('404');
		return;
	});
	
};
