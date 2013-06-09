// Content View
// Responsible for showing all bookmarks 
var ContentView = Backbone.View.extend({
	el: '.content',

	initialize: function() {
		
		// Listens for 'filter' event and then runs a function that triggers event for every bookmark - triggerCheck
		this.listenTo(bookmarks, 'filter', this.triggerCheck);

		// On 'add' event in 'bookmarks' collection run addBookmark() function.
		this.listenTo(bookmarks, 'add', this.addBookmark);

		// Sync all models with the server and put them in collection
		bookmarks.fetch();
	},

	triggerCheck: function(id) {

		// Trigger event for every model
		bookmarks.forEach(function(bookmarks) {
			bookmarks.trigger('passed', bookmarks,id);
		});
	},

	// Makes new single bookmark view.
	// 'bookmark' variable carries the model from this function to the 'render' function
	addBookmark: function(bookmark) {
		var newBookmarkView = new BookmarkView({ model: bookmark });
		$('.bookmarks-list').append(newBookmarkView.render().el);
	}
});

// Initialize the view
var bookmarksList = new ContentView();


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
		// this.$el.attr('draggable', 'true');
		// Don't use - If there is a contenteditable element nested in draggable, the contenteditable doesn't focus.

		// Listen for 'passed' event - runs function that will check model id's and hide/show them.
		this.listenTo(this.model, 'passed', this.hideBookmarks);

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
	// Check every keypress, and if 'enter' is pressed the field is blurred and .text() is sent to the saveBookmark() function
	updateBookmark: function(e) {
		if (e.which === ENTER_KEY) {
			this.$('.bookmarks-item-title').blur();
			var newval = this.$('.bookmarks-item-title').text();
			this.saveBookmark(newval);
			return false;
		}
	},

	// Checks the id of every passed model, and hide them
	// if they are not the same as the id of the collection that is passed from the router
	hideBookmarks: function(bookmark, id) {

		if ( bookmark.get('collection_id') != id ) {
			this.$el.addClass('hidden');
		} else {
			this.$el.removeClass('hidden');
		}
	},

	// Get newval and update the bookmark name
	// save() makes GET request to check if the value is different, and then sends PUT request to update it
	saveBookmark: function(newval) {
		this.model.save({ 'bookmark_title': newval}, { headers: { 'Authorization': 'Token 026e0c58864a7e58eff66f2b88e9094583d74ae4' } });
	},

	// Deletes the model
	clear: function () {
		this.model.destroy({ headers: { 'Authorization': 'Token 026e0c58864a7e58eff66f2b88e9094583d74ae4' } });
	}
});