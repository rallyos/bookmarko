// Bookmarks collections 
var BookmarkCollections = Backbone.Collection.extend({
	model: BookmarkCollection,
	url: 'api/collections/'
});

// Bookmarks Collections instance 
var globalBookmarkCollections = new BookmarkCollections();


// The collection of bookmarks for easy loading on login. (At least for now)
var Bookmarks = Backbone.Collection.extend({
	model: BookmarkModel,
	url: 'api/'
});

// Bookmarks instance
var bookmarks = new Bookmarks();
