
// Main View
var BookmarksView = Backbone.View.extend({
	el: '.content',

	initialize: function () {

		this.listenTo(bookmarks, 'add', this.addBookmark);
		this.listenTo(bookmarks, 'reset', this.addAll);
		bookmarks.fetch();
	},
	events: {
	},

	addBookmark: function( bookmark ) {
		var newBookmarkView = new BookmarkView({model: bookmark});
		$('.bookmarks-list').append(newBookmarkView.render().el);
	},

	addAll: function () {
		this.$('#bookmark-template').html('');
		bookmarks.each(this.getBookmark, this);
	},
});
var bookmarksList = new BookmarksView();
