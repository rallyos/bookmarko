
var PageRouter = Backbone.Router.extend({

	routes: {
		'': 'mhm',
		'collections/:id': 'showCollection',
		'tags/:tag': 'filterByTag'
	},

	mhm: function() {
		var id = null;
		var fn = 'collection';
		bookmarks.trigger('filter', id, fn);
	},

	// Trigger 'filter' event and send the model id
	showCollection: function(id) {
		var fn = 'collection';
		bookmarks.trigger('filter', id, fn);
	},

	filterByTag: function(tag) {
		var fn = 'tag';
		bookmarks.trigger('filter', tag, fn);
	},
});

var pageRouter = new PageRouter();

Backbone.history.start();
