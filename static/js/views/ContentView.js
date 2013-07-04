// Content View
// Responsible for showing all bookmarks 
var ContentView = Backbone.View.extend({
	el: '.content',

	initialize: function() {
		
		// Listens for 'filter' event and then runs a function that triggers event for every bookmark - triggerCheck
		this.listenTo(bookmarks, 'filter', this.triggerCheck);

		// On 'add' event in 'bookmarks' collection run addBookmark() function.
		this.listenTo(bookmarks, 'add', this.addBookmark);

		this.listenTo(bookmarks, 'entered', this.userEntered);

		this.listenTo(bookmarks, 'filterTag', this.filterTags);

		// Sync all models with the server and put them in collection
		bookmarks.fetch({success: function() {
			bookmarks.trigger('entered');
		}});
	},

	filterTags: function(tag) {

		bookmarks.forEach(function(bookmarks) {
			bookmarks.trigger('filterbyt', bookmarks, tag);
		});	

	},

	events: {
		'keyup #bookmark-input': 'searchBookmarks'
	},

	searchBookmarks: function(text) {
		var valu = this.$('#bookmark-input').val();

		bookmarks.forEach(function(bookmarks) {
			bookmarks.trigger('search', bookmarks, valu);
		});	
	},

	userEntered: function() {
		id = null;

		bookmarks.trigger('filter', id);
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

		'click .bookmarks-item-tags': 'tagClicked'

	},

	initialize: function() {

		// Listen for 'passed' event - runs function that will check model id's and hide/show them.
		this.listenTo(this.model, 'passed', this.hideBookmarks);

		this.listenTo(this.model, 'hidd', this.hideit)
		// When the model is destroyed, it's also removed from the view.
		//this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'search', this.showResults);

		this.listenTo(this.model, 'filterbyt', this.filterThis)
	},

	tagClicked: function() {
		tagN = this.model.get('tags');
		pageRouter.navigate('/tags/'+ tagN, true);
	},

	filterThis: function(bookmark, tag) {

		console.log(bookmark)
		if ( bookmark.get('tags') != tag ) {
			this.$el.addClass('hidden');
		} else {
			this.$el.removeClass('hidden');
		}
	},

	showResults: function(bookmark, valu) {
		console.log(valu)
		test = bookmark.get('bookmark_title' );
		testa = bookmark.get('bookmark_url');
		
		if ( test.match(valu) || testa.match(valu) ) {
			this.$el.removeClass('hidden');
		} else {
			console.log(test + ' + ' + valu);
			this.$el.addClass('hidden');
		}
	},

	dragStartEvent: function (e) {
		
	//	e = e.originalEvent;

		var data = { 'id': this.model.id };

		var data = JSON.stringify(data)


		collectionID = this.model.get('collection_id');
		console.log(collectionID);

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