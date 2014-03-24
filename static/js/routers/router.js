
var PageRouter = Backbone.Router.extend({

	routes: {
		'': 'mhm',
		'collections/:title': 'showCollection',
	},

	// These functions trigger the 'filter' event
	// Each sends different information based on what the user wants to hide
	mhm: function() {
		var id = null;
		var fn = 'collection';
		bookmarks.trigger('filter', id, fn);
	},
	showCollection: function(title) {
		// Just test
		for (var i = 0; i <= globalBookmarkCollections.models.length - 1; i++) {
			if (globalBookmarkCollections.models[i].attributes.title.toLowerCase() == title) {
				var id = globalBookmarkCollections.models[i].id
			}
		};

		var fn = 'collection';
		bookmarks.trigger('filter', id, fn);
	},
});

var pageRouter = new PageRouter();

Backbone.history.start({pushState: true});
