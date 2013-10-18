// Bookmarks collections 
var BookmarkCollections = Backbone.Collection.extend({
	model: BookmarkCollection,
	url: 'http://www.bookmarkoapp.com/api/collections/',
	
	initialize: function() {
        this._order_by_title = this.comparator;
	},

	comparator: function( group ) {
		return group.get('title')
	},

    order_by_title: function() {
        this.comparator = this._order_by_title;
        this.sort();
    },

    order_by_date: function() {
        this.comparator = this._order_by_date;
        this.sort();
    },

    order_by_size: function() {
        this.comparator = this._order_by_size;
        this.sort();
    },

    _order_by_date: function(group) {
        return group.id;
    },

    _order_by_size: function(group) {
        return -group.bookmarkCollections.length;
    }
});

// Bookmarks Collections instance 
var globalBookmarkCollections = new BookmarkCollections();


// The collection of bookmarks for easy loading on login. (At least for now)
var Bookmarks = Backbone.Collection.extend({
	model: BookmarkModel,
	url: 'http://www.bookmarkoapp.com/api/'
});

// Bookmarks instance
var bookmarks = new Bookmarks();
