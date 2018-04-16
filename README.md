*********** Project Title **************
HEadlines
 ********** PROJECT FEATURES  **********
	* Headline makes use of NewsAPI to get Latest News around the globe

	* The Node API connects to NEWS API to get JSON data from NEWSAPI 

	* The service worker, if installed intercepts all requests

	* If page requested is on Cache, it is served from Cache, otherwise it is served from the node server and then cahed.

	* If request url is an API call, and NEwsAPI is online, the Index Controller saves the data to the Index DB before displaying to the page

	* Favourites list are saved and served from the Index DB

	* If APP is offiline, request that are source-based that are in Index DB are served from the DB

	* Because NewsAPI does not return "country" in its JSON, if the offline request is country based, all data from Index DB are served.


	* The favourite button saves particular news to the favourite store in the NewsAPI Index DB 

	* Also if the App is online but server cannot reach NEWSAPI, request that are source-based that are in Index DB are served from the DB

	********** FRONT END FEATURES ************
		Users can view top headlines based on country (filters)
		Users can search through a list of sources from the drop menu.
		Users can select sources and view headlines based on sources (filters).
		Users can click links to the original articles and be redirected to them on a new tab.
		Users can create lists (e.g. favourites) and group articles in these lists.

************** INSTALLING	*****************************
 npm install
 npm run start
 go to https://localhost:3000/
