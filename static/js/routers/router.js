
var PageRouter = Backbone.Router.extend({

	routes: {
		'': 'mhm',
		'collections/:id': 'showCollection'
	},

	mhm: function() {
		console.log('After login');
		id = null;
		bookmarks.trigger('filter', id);
	},

	// Trigger 'filter' event and send the model id
	showCollection: function(id) {
		bookmarks.trigger('filter', id);
	}
});

var pageRouter = new PageRouter();

Backbone.history.start();
