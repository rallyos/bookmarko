// Content View
// Responsible for showing all bookmarks 

var ContentView = Backbone.View.extend({
	el: '.content',

	initialize: function() {
		
		this.listenTo(bookmarks, 'add', this.addBookmark);

		// This event is fired when the bookmarks are loaded
		this.listenTo(bookmarks, 'login', this.userEntered);

		// This event is fired when the user filters the bookmarks by collection, tag, etc.
		this.listenTo(bookmarks, 'filter', this.filterBy);

		// This event is fired when the bookmarks collection is empty
		this.listenTo(bookmarks, 'empty', this.showHelp)

		// Load bookmarks, and trigger the filtering function
		bookmarks.fetch({success: function() {
			bookmarks.trigger('login');
	
			if ( bookmarks.length == 0 ) {
				bookmarks.trigger('empty')
			}

		}});

		this.$searchInput = this.$('.input-search');
		this.$starButton = this.$('.starred');
	},

	events: {
		'keyup .input-search': 'searchBookmarks',
		'click .starred': 'showStarred',
		'click #settings': 'openSettings'
	},

	// Show bookmarks based on their collection
	userEntered: function() {
		param = null;
		fn = 'collection';
		this.filterBy(param, fn);
	},

	// Filter bookmarks based on fn type(tag, collection) and param
	filterBy: function(param, fn) {
		bookmarks.forEach(function(bookmark) {
			bookmark.trigger('hide', bookmark, param, fn);
		});
	},

	// Uses the data attribute of the star button to know if the starred bookmarks are hidden or shown
	showStarred: function() {
		if (this.$starButton.data('pressed') == 'yes' ) {
			
			this.$starButton.toggleClass('yellow-star')
			this.$starButton.data('pressed', 'no');

			// Use the universal filter function to show the previous view
			fn = 'collection';
			param = null;
			this.filterBy(param, fn);
		} else {
			this.$starButton.data('pressed', 'yes');
			this.$starButton.toggleClass('yellow-star')

			// Trigger the check for starred bookmarks
			bookmarks.forEach(function(bookmarks) {
				bookmarks.trigger('isStarred', bookmarks);
			});	
		}
	},

	searchBookmarks: function() {
		var searchWord = this.$searchInput.val();

		bookmarks.forEach(function(bookmark) {
			bookmark.trigger('search', bookmark, searchWord);
		});	
	},

	openSettings: function() {
	    $('.settings-block').toggleClass("settings-hidden");
	},

	addBookmark: function(bookmark) {
		var newBookmarkView = new BookmarkView({ model: bookmark });
		$('.bookmarks-list').append(newBookmarkView.render().el);
	},

	showHelp: function() {
		var newUserTemplate = $('<img class="help-arrows" src="http://markedbyme.appspot.com/static/images/newtest.png">')
			newUserTemplate.appendTo($('.bookmarks-section') );

		if (new_user == 'true') {
    		var newUserTemplate = $('<h1 class="new-user-text thank-you">Thank you for signing up!</h1><p class="new-user-text beta-warning"><span class="new-user-bookmarko">Bookmarko</span> is still in early beta so everything can brake, and <br> your user experience may not be so good.</p>')
    			newUserTemplate.insertAfter('.help-arrows');
	
			var getExtensionTemplate = $('<div class="browser-extensions-box"><h1 class="new-user-text get-extension-header">Get the extension and start saving bookmarks</h1><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/webstorex124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/firefoxx124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/operax124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/safarix124.png"></img></div>')
				getExtensionTemplate.insertAfter('.beta-warning')
		} else {
			var getExtensionTemplate = $('<div class="browser-extensions-box"><h1 class="new-user-text get-extension-header">Get the extension and start saving bookmarks</h1><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/webstorex124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/firefoxx124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/operax124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/safarix124.png"></img></div>')
				getExtensionTemplate.insertAfter('.help-arrows')
		}


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
		'click .bookmark-star': 'starBookmark',
		'dragstart .select-bookmark': 'dragStartEvent',
		'dragend': 'dragEndEvent',
		'click .bookmark-title': 'saveTitle',
		'keypress .bookmark-title': 'updateBookmark',
		'click .add-tag': 'addTag',
		'keyup .bookmark-tags': 'nameTag',
		'click .bookmark-tags': 'tagClicked',
		'click .tag-delete': 'removeTag',
		'click .bookmark-delete': 'clear',
	},

	initialize: function() {
		this.listenTo(this.model, 'search', this.showResults);
		this.listenTo(this.model, 'isStarred', this.hideShowStarred)
		this.listenTo(this.model, 'dragHide', this.dragHide)
		this.listenTo(this.model, 'hide', this.hideBookmarks);
		this.listenTo(this.model, 'destroy', this.remove);

		this.listenTo(this.model, 'change', this.render);
	},

	render: function(bookmark) {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	dragStartEvent: function (e) {

		// Get the bookmark id and it's collection id
		var data = {
			'id': this.model.id,
			'collection_id': this.model.get('collection_id'),
		};
		var data = JSON.stringify(data)
		
		// Set the drag icon when moving bookmarks.
		// The image is 'preloaded' in main.js		
		e.originalEvent.dataTransfer.setDragImage(dragIcon, 10, 17);

		e.originalEvent.dataTransfer.effectAllowed = 'move';
		e.originalEvent.dataTransfer.setData('model', data);

		this.$el.addClass('being-moved');
	},

	dragEndEvent: function() {
			this.$el.removeClass('being-moved');
	},

	dragHide: function(draggedModel) {
		this.$el.addClass('hidden');
	},

	starBookmark: function(bookmark) {
		if ( this.model.get('starred') == false ) {
			this.$('.bookmark-star').addClass("bookmark-starred");
			this.model.save({ 'starred': true}, tokenHeader);
		} else if ( this.model.get('starred') == true ) {
			this.$('.bookmark-star').removeClass("bookmark-starred");
			this.model.save({ 'starred': false}, tokenHeader);
		}
	},

	hideShowStarred: function(bookmark) {
			if ( bookmark.get('starred') == false ) {
				this.$el.addClass('hidden');
			} else {
				this.$el.removeClass('hidden');
			}
	},

	// Start tag creating flow
	// ! These functions will be here untill the tags functionality is ready
	addTag: function() {
		this.model.set({tag: ' '})
		this.$('.bookmark-tags').attr('contenteditable', 'true')
		this.$('.bookmark-tags').focus();
	},

	nameTag: function(e) {
		if (e.which === ENTER_KEY) {
			this.$('.bookmark-tags').blur();
			var tag = this.$('.bookmark-tags').text();
			this.$('.bookmark-tags').removeAttr('contenteditable');
			this.model.save({tag: tag}, tokenHeader);
			return false;
		}
	},

    tagClicked: function() {
            tagTitle = this.model.get('tag');
            pageRouter.navigate('/tags/'+ tagTitle, true);
    },

    removeTag: function() {
    	this.model.save({tag: ''}, tokenHeader)
    },

	showResults: function(bookmark, searchWord) {
		title = bookmark.get('title').toLowerCase();
		url = bookmark.get('url').toLowerCase();
		searchWord = searchWord.toLowerCase();

		//tag = bookmark.get('tag').toLowerCase();

		if ( title.match(searchWord) || url.match(searchWord)/* || tag.match(searchWord)*/ ) {
			this.$el.removeClass('hidden');
		} else {
			this.$el.addClass('hidden');
		}
	},

	// Instead of multiple functions, with multiple if's and triggers
	// this is universal function. It checks the fn type and var value
	// Depending on them hides or shows bookmarks
	hideBookmarks: function(bookmark, param, fn) {
		if ( fn == 'collection' & bookmark.get('collection_id') != param) {
				this.$el.addClass('hidden');
		} else if ( fn == 'tag' & bookmark.get('tag') != param ) {
				this.$el.addClass('hidden');
		} else {
				this.$el.removeClass('hidden');
		}
	},

	saveTitle: function() {
		window.savedTitle = this.$('.bookmark-title').text();
	},

	updateBookmark: function(e) {
		if (e.which === ENTER_KEY) {
			this.$('.bookmark-title').blur();
			var newval = this.$('.bookmark-title').text();
			if (newval.length == 0) {
				console.log(newval.length)
				this.$('.bookmark-title').text(window.savedTitle);
			} else {
				this.saveBookmark(newval);
			}
			return false;
		}
	},

	saveBookmark: function(newval) {
		this.model.save({ 'title': newval}, tokenHeader);
	},

	clear: function () {
		model = this.model;
		this.$el.css({ right: '100%' })
		
		this.$el.one('transitionend', function() {
			model.destroy(tokenHeader);
		})
	},

});