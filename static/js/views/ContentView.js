/* Content view. Here are the bookmarks
version 0.0.3, May 30

# To be checked before beta

*/

// Content View
var BookmarksView = Backbone.View.extend({
	el: '.content',

	initialize: function() {
		
		this.listenTo(bookmarks, 'reset', this.addAll);

		this.listenTo(bookmarks, 'filter', this.filtra);
		// On 'add' event in 'bookmarks' collection run addBookmark() function.
		this.listenTo(bookmarks, 'add', this.addBookmark);

		// Sync all models with the server and put them in collection
		bookmarks.fetch();
	},
/*
	filtra: function(id) {
		console.log(id);
		bookmarks.each(this.filterOne, this);
	},
*/
	filtra: function(id) {

		bookmarks.forEach(function(bookmarks) {
			bookmarks.trigger('testi', bookmarks,id);
		});
	},

	addAll: function (epic) {
		this.$('.bookmarks-list').html('');
		epic.each(this.addBookmark, this);
	},

	// Makes new single bookmark view.
	// 'bookmark' variable carries the model from this function to the 'render' function
	addBookmark: function(bookmark) {
		var newBookmarkView = new BookmarkView({ model: bookmark });
		$('.bookmarks-list').append(newBookmarkView.render().el);
	}
});

// Initialize the view
var bookmarksList = new BookmarksView();

/* Single bookmark view
version 0.0.3, May 30

# To be checked before beta
>> Store auth token in variable?
>> Rename all function names

*/

// Single bookmark view
var BookmarkView = Backbone.View.extend({
	tagName: 'li',
	className: 'bookmarks-item',

	template: _.template($('#bookmark-template').html()),

	events: {

		// When the X is clicked the clear() function is initialized
		'click .bookmarks-item-delete': 'clear',

		// On keypress run updateBookmark()
		'keypress .bookmarks-item-title': 'updateBookmark'
	},

	initialize: function() {
		//this.$el.attr('draggable', 'true');

		this.listenTo(this.model, 'testi', this.visible);

		// When the model is destroyed, it's also removed from the view.
		this.listenTo(this.model, 'destroy', this.remove);
	},

	// The render function for the single bookmark.
	// It appends the template html and serialized model to the $el. -> li.bookmarks-item
	render: function(bookmark) {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	// When editing the bookmark name
	// Check every keypress, and if 'enter' is pressed the field is blurred and .text() is sent to the close() function
	updateBookmark: function(e) {
		if (e.which === ENTER_KEY) {
			this.$('.bookmarks-item-title').blur();
			var newval = this.$('.bookmarks-item-title').text();
			this.close(newval);
			return false;
		}
	},

	visible: function(bookmark, id) {
		//this.$el.removeClass('hidden');
		if (bookmark.get('collection_id') != id) {
			this.$el.addClass('hidden');
		} else {
			this.$el.removeClass('hidden');
		}
		//this.$el.hide();
	},

	// Get newval and update the bookmark name
	// save() makes GET request to check if the value is different, and then sends PUT request to update it
	close: function(newval) {
		this.model.save({ 'bookmark_title': newval}, { headers: { 'Authorization': 'Token 026e0c58864a7e58eff66f2b88e9094583d74ae4' } });
	},

	// Deletes the model
	clear: function () {
		this.model.destroy({ headers: { 'Authorization': 'Token 026e0c58864a7e58eff66f2b88e9094583d74ae4' } });
	}
});