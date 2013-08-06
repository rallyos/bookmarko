
var PageRouter = Backbone.Router.extend({

	routes: {
		'': 'mhm',
		'collections/:id': 'showCollection',
		'tags/:tag': 'filterByTag'
	},

	// These functions trigger the 'filter' event
	// Each sends different information based on what the user wants to hide
	mhm: function() {
		var id = null;
		var fn = 'collection';
		bookmarks.trigger('filter', id, fn);
	},
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
