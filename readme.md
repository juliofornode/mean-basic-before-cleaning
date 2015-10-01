
Basic MEAN Stack Project: Simple Twitter
===

0. Goals
---
* Single-page app that displays tweets
* Basic usage of the four components of the MEAN stack
* This is the version before cleaning Node and Angular (that version is in repo called mean-basic)
* Usage of Mongoose to integrate Mongo and Node
* Testing JavaScript without final semicolons (bad practice)


1. Start With an Html & Bootstrap Mock Up
---
* HTML skeleton
* Bootstrap CSS from CDN


2. Add Angular to Prototype the App
---
* Initially, we'll add Angular scripts in HTML page, then we will move them to the server
* Add Angular script from CDN
* Declare ng app  
* Set ng controller and scope
```
<script>
	var app = angular.module('app', [])
	app.controller('CtrlName', function($scope) {
		$scope.posts = [{username: 'ben', body: 'tana'}, {...}]
		if($scope.postBody) {
			$scope.addPost = function () {
				$scope.posts.unshift({
					username: 'guan',
					// see the change here:
					body: $scope.postBody
				})
	
				$scope.postBody = null
			}
		}
	})
</script>
```

* Add ng directives
```
ng-app
ng-controller
ng-repeat
ng-model
ng-click
```

3. Set the Server With Node and Express
---
* the page /api/posts will return a JSON array with all posts via GET
* the page /api/posts will send new tweets to Mongo via POST
* npm init
```
Very important: maintain versions in packckage.json in order to avoid  
possible issues with newer versions.
```


* Install express and body-parser
* Create basic server
```
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.listen(3000, function() {
  console.log('Server running on localhost:3000');
});
```

* Create basic get/post api
```
app.get('/api/posts', function(req, res) {
  res.json([{
  	username: "Dick",
  	body: "My taylor is rich"
  }])

});

app.post('/api/posts', function(req, res) {
  console.log('post received!');
  console.log(req.body.username);
  console.log(req.body.body);
  res.send(201);
});

```

* Check post with curl (alternative: use the Postman app for Chrome)
```
curl -v -H "Content Type: application/json" -XPOST --data  
"{\"username\":\"guan\", \"body\": \"asin bonanga\"}"   
localhost:3000/api/posts

Alternative:

curl -H "Content Type: application/json" -X POST -d '{ "post":   
{"username":"guan", "body": "asin bonanga"} }' localhost:3000/api/posts
```


4. Run Mongo Deamon, Create db, use Mongoose to Connect and Create Model
---
* mongod
* install mongoose
* set db connection in db.js
```
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/social', function() {
	console.log('mongodb connected');
});

module.exports = mongoose;
```

* define model in models/modelName.js
```
var db = require('../db');

var Post = db.model('Post', {
	username: { type: String, required: true },
	body: { type: String, required: true },
	date: { type: Date, required: true, default: Date.now }
});

module.exports = Post;

```

* update get/post api with Mongo find/save
```
// require the Post model
var Post = require('./models/post');


app.post('/api/posts', function(req, res, next) {
  //when a request comes in, build a new instance of the model Post
	var post = new Post({
		username: req.body.username,
		body: req.body.body
	});
	
	//save the new Post model and return 201 & a JSON representation of it
	post.save(function(err, post) {
		if(err) { return next(err) }
		res.json(201, post);
	});
	
});


app.get('/api/posts', function(req, res, next) {
	Post.find(function(err, posts) {
		if (err) { return next(err) }
		res.json(posts)
	})
})


// If we wanted to find just one document in the db:
app.get('/user', function(req, res, next) {
  User.findOne({username: auth.username}, function(err, user) {
		if (err) { return next(err) }
		res.status(201).json(user)  	
  })
})


```


5. Move ng to Server and use $http to Connect ng to Node
---
* Move posts.html to /layouts/posts.html to avoid a CORS error
* Update server.js
```
app.get('/', function(req, res) {
	res.sendfile('./layouts/posts.html')
})
```

* Update Angular: add $http as dependency of the controller
```
	<script type="text/javascript">
		var app = angular.module('app', [])
		app.controller('PostsCtrl', function($scope, $http) {

			$http.get('/api/posts')
			.success(function(posts) {
				// $scope.posts = posts from mongo
				$scope.posts = posts
			})

			$scope.addPost = function() {
				if ($scope.bodyPost) {
					$http.post('/api/posts', {
						username: 'Lourdes',
						body: $scope.bodyPost
					})
					.success(function(post) {
						$scope.posts.unshift(post)
						$scope.bodyPost = null
					})
				}
			}

		})
	</script>
```

* Notice that the success function has "posts" as parameter
* Little bug: when refreshing, the sort order changes. See next fixes (we can use one or the other)
* Via angular: 
```
ng-repeat="post in posts | orderBy:'-date'"
```

* Via Node:
```  
app.get('/api/posts', function(req, res, next) {
	Post.find()
	.sort('-date')
	.exec(function(err, posts) {
		if (err) { return next(err) }
		res.json(posts)
	})
})
```
