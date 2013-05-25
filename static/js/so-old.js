var BookmarksView = Backbone.View.extend({
	el: '.content',
	model: bookmark,

	events: {
		'submit #form' : 'addBookmark'
	},
	template: _.template('<li class="bookmarks-item"><span class="bookmarks-item-title"><%= name %></span><span class="bookmarks-item-url"><%= url %></span><span class="bookmarks-item-delete">X</span></li>'),

	addBookmark: function() {
		var test = $('.add-bookmark').val();
		bookmarks.add({name: test});
		console.log(bookmarks.length);
		$(this.template( this.model.toJSON() )).appendTo('.bookmarks-list');
		return false;
	}
});
var bookmarksList = new BookmarksView();
