// Please rename

var BookmarksCollection = Backbone.Collection.extend({
	model: BookmarksModel,
	url: 'api/'
});

var bookmarks = new BookmarksCollection();