/* App models
version 0.0.3, May 30

# To be checked before beta
>>

*/

// Bookmark
var BookmarkModel = Backbone.Model.extend();

// Collection
var BookmarkCollection = Backbone.Model.extend({
    initialize: function(){
		this.bookmarkCollections = new BookmarkCollections();
		this.bookmarkCollections.url = 'api/collections/' + this.id;
		//var neftochimic = new BookmarkCollection({id: 1})
		//neftochimic.bookmarkCollections.fetch()
	}	
});