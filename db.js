var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/meanbasic', function() {
	console.log('mongodb connected')
})

module.exports = mongoose