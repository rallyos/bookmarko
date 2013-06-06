var PageRouter = Backbone.Router.extend({

	routes: {
		'collections/:id': 'testvame'
	},

	testvame: function(id) {
		console.log('testvame ' + id);
		bookmarks.trigger('filter', id);
	}
});

var pageRouter = new PageRouter();

Backbone.history.start();
