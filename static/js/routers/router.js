
var PageRouter = Backbone.Router.extend({

	routes: {
		'collections/:id': 'showCollection'
	},

	// Trigger 'filter' event and send the model id
	showCollection: function(id) {
		bookmarks.trigger('filter', id);
	}
});

var pageRouter = new PageRouter();

Backbone.history.start();
