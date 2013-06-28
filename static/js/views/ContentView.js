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

		'dragstart .select-item': 'dragStartEvent',

		// On keypress run updateBookmark()
		'keypress .bookmarks-item-title': 'updateBookmark',

	},

	initialize: function() {

		// Listen for 'passed' event - runs function that will check model id's and hide/show them.
		this.listenTo(this.model, 'passed', this.hideBookmarks);

		this.listenTo(this.model, 'hidd', this.hideit)
		// When the model is destroyed, it's also removed from the view.
		//this.listenTo(this.model, 'destroy', this.remove);

	},

	dragStartEvent: function (e) {
		
	//	e = e.originalEvent;

	//	dragSrcEl = this;
		var data = {
			'id': this.model.id,
			'bookmark_title': this.model.get('bookmark_title'),
			'bookmark_url': this.model.get('bookmark_url'),
			'collection_id': this.model.get('collection_id')
		};

		var data = JSON.stringify(data)

		e.originalEvent.dataTransfer.effectAllowed = 'move';
		e.originalEvent.dataTransfer.setData('model', data);

	},

	// The render function for the single bookmark.
	// It appends the template html and serialized model to the $el. -> li.bookmarks-item
	render: function(bookmark) {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	hideit: function(tohide) {
		console.log(this)
		console.log(this.$el)

		this.$el.addClass('hidden');
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
		this.model.save({ 'bookmark_title': newval}, { headers: { 'Authorization': 'Token ' + token } });
	},

	// Deletes the model
	clear: function () {
		this.$el.css({
			right: '100%',
		}, this.$el.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', this.destrooy())
		)
	},

	destrooy: function() {
		this.model.destroy({ headers: { 'Authorization': 'Token ' + token } }, this.remove);
	}
});