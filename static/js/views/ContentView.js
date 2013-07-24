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


		// Sync all models with the server and put them in collection |||| Put this in function? and then call it ot init
		bookmarks.fetch({success: function() {
			bookmarks.trigger('entered');
		}});



		this.$searchInput = this.$('.input-search');

	},

	events: {
		'keyup .input-search': 'searchBookmarks'
	},

	// The render function for the single bookmark.
	// It appends the template html and serialized model to the $el. -> li.bookmarks-item


	filterTags: function(tag) {
		bookmarks.forEach(function(bookmarks) {
			bookmarks.trigger('filterbyt', bookmarks, tag);
		});	

	},

	searchBookmarks: function() {
		var searchWord = this.$searchInput.val();

		bookmarks.forEach(function(bookmarks) {
			bookmarks.trigger('search', bookmarks, searchWord);
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
	className: 'bookmark',

	template: _.template($('#bookmark-template').html()),

	events: {

		// When the X is clicked the clear() function is initialized
		'click .bookmark-delete': 'clear',

		'dragstart .select-bookmark': 'dragStartEvent',

		// On keypress run updateBookmark()
		'keypress .bookmark-title': 'updateBookmark',

		'click .bookmark-tags': 'tagClicked'

	},

	initialize: function() {

		// Listen for 'passed' event - runs function that will check model id's and hide/show them.
		this.listenTo(this.model, 'passed', this.hideBookmarks);

		this.listenTo(this.model, 'hide', this.hideit)
		// When the model is destroyed, it's also removed from the view.
		//this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'search', this.showResults);

		this.listenTo(this.model, 'filterbyt', this.filterThis);

	},

	render: function(bookmark) {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

    tagClicked: function() {
            tagN = this.model.get('tag');
            pageRouter.navigate('/tags/'+ tagN, true);
    },

	filterThis: function(bookmark, tag) {

		if ( bookmark.get('tag') != tag ) {
			this.$el.addClass('hidden');
		} else {
			this.$el.removeClass('hidden');
		}
	},

	showResults: function(bookmark, searchWord) {
		test = bookmark.get('title');
		testa = bookmark.get('url');
		testaa = bookmark.get('tag');

		if ( test.match(searchWord) || testa.match(searchWord) || testaa.match(searchWord)) {
			this.$el.removeClass('hidden');
		} else {
			this.$el.addClass('hidden');
		}
	},

	dragStartEvent: function (e) {
		var data = {
			'id': this.model.id,
			'collection_id': this.model.get('collection_id'),
		};

		var data = JSON.stringify(data)

		var dragIcon = document.createElement('img');
		dragIcon.src = 'http://markedbyme.appspot.com/static/images/dragimg.png';
		dragIcon.width = 50;

		
		e.originalEvent.dataTransfer.setDragImage(dragIcon, 10, 17);


		e.originalEvent.dataTransfer.effectAllowed = 'move';
		e.originalEvent.dataTransfer.setData('model', data);

	},

	hideit: function(draggedModel) {
		this.$el.addClass('hidden');
	},

	// When editing the bookmark name
	// Check every keypress, and if 'enter' is pressed the field is blurred and .text() is sent to the saveBookmark() function
	updateBookmark: function(e) {
		if (e.which === ENTER_KEY) {
			this.$('.bookmark-title').blur();
			var newval = this.$('.bookmark-title').text();
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
		this.model.save({ 'title': newval}, { headers: { 'Authorization': 'Token ' + token } });
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


