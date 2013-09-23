// Bookmark model
var BookmarkModel = Backbone.Model.extend();

// Collection of bookmarks
var BookmarkCollection = Backbone.Model.extend({
	
	// Create subcollection on initialize
    initialize: function() {
		this.bookmarkCollections = new BookmarkCollections();
	}	
});