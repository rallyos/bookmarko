// Content View
// Responsible for showing all bookmarks 

var ContentView = Backbone.View.extend({
	el: '.content',

	initialize: function() {

		this.listenTo(bookmarks, 'add', this.addBookmark);
		this.listenTo(bookmarks, 'reset', this.addAll);
		this.listenTo(bookmarks, 'reset', this.afterLoginSetup);

		// This event is fired when the bookmarks are loaded
		this.listenTo(bookmarks, 'login', this.userEntered);

		// This event is fired when the user filters the bookmarks by collection, tag, etc.
		this.listenTo(bookmarks, 'filter', this.filterBy);

		// This event is fired when the bookmarks collection is empty
		this.listenTo(bookmarks, 'empty', this.showHelp);


		this.$searchInput = this.$('.input-search');
		this.$starButton = this.$('.starred');
		settingsBlock = $('.settings-block');
	},

	events: {
		'click .home-button': 'navHome',
		'click .sidebar-show-button': 'toggleSidebar',
		'keyup .input-search': 'searchBookmarks',
		'click .starred': 'showStarred',
		'click #settings': 'openSettings',
		'click .change-tmpl': 'changeTemplate'
	},

	afterLoginSetup: function() {

		// If the address contains 'collections' do the work and show him the desired collection
		if ( location.pathname.match('collections') ) {
			var num = location.pathname.replace( /^\D+/g, '');
			pageRouter.showCollection(num)
		} else {
			bookmarks.trigger('login');
		} // Another else for tags?
		
		// Show welcome page
		if ( bookmarks.length == 0 ) {
			bookmarks.trigger('empty')
		}
		
		$('.bookmark').attr('draggable', 'true')

		this.setBookmarkClass(); 
	},

	showHelp: function() {
		var newUserTemplate = $('<img class="help-arrows" src="http://markedbyme.appspot.com/static/images/user/newtest.png">')
			newUserTemplate.appendTo($('.bookmarks-section') );

		if (new_user == 'true') {
    		var newUserTemplate = $('<h1 class="new-user-text thank-you">Thank you for signing up!</h1><p class="new-user-text beta-warning"><span class="new-user-bookmarko">Bookmarko</span> is still in early beta so everything can brake, and <br> your user experience may not be so good.</p>')
    			newUserTemplate.insertAfter('.help-arrows');
	
			var getExtensionTemplate = $('<div class="browser-extensions-box"><h1 class="new-user-text get-extension-header">Get the extension and start saving bookmarks</h1><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/user/webstorex124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/user/firefoxx124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/user/operax124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/user/safarix124.png"></img></div>')
				getExtensionTemplate.insertAfter('.beta-warning')
		} else {
			var getExtensionTemplate = $('<div class="browser-extensions-box"><h1 class="new-user-text get-extension-header">Get the extension and start saving bookmarks</h1><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/user/webstorex124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/user/firefoxx124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/user/operax124.png"></img><img class="browser-extensions-icon" src="http://markedbyme.appspot.com/static/images/user/safarix124.png"></img></div>')
				getExtensionTemplate.insertAfter('.help-arrows')
		}
	},

	// Back to home
	navHome: function() {
		pageRouter.navigate('', true);
	},

	toggleSidebar: function() {
		$('.sidebar').toggleClass('sidebar-show');
		$('.bookmarks-section').toggleClass('bookmarks-section-translate');
	},

	setBookmarkClass: function() {
		if ( user_template == 'list' ) {
		    $('.bookmark').removeClass('grid-tmpl').addClass('list-tmpl')
		} else if ( user_template == 'grid' ) {
		    $('.bookmark').removeClass('list-tmpl').addClass('grid-tmpl')
		}
	},

	changeTemplate: function(click) {

		if ( click.target.id == 'list' ) {
			user_template = 'list'
	        Template = '#list-template';
		} else if ( click.target.id == 'grid' ) {
			user_template = 'grid'
	        Template = '#grid-template';
		}

		bookmarks.fetch({reset: true})
		this.setTemplateCookie(user_template)
	},

	setTemplateCookie: function(user_template) {
		year = new Date()
		nextYear = year.getFullYear() + 1
		year.setYear(nextYear)
		document.cookie ='template='+ user_template +'; expires='+ year +'; path=/'
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
		settingsBlock.toggleClass("settings-hidden");

		$('html').one('click', function() {
		    settingsBlock.toggleClass("settings-hidden");
		});

		event.stopPropagation();
	},

	addBookmark: function(bookmark) {
		var newBookmarkView = new BookmarkView({ model: bookmark });
		$('.bookmarks-list').append(newBookmarkView.render().el);
	},

	addAll: function () {
		this.$('.bookmarks-list').html('');
		bookmarks.each(this.addBookmark, this);
		this.setBookmarkClass();
	},
});

// Initialize the view
var bookmarksList = new ContentView();


// Single bookmark view
var BookmarkView = Backbone.View.extend({
	tagName: 'li',
	className: 'bookmark',

	events: {
		'click .bookmark-star': 'starBookmark',
		'dragstart': 'dragStartEvent',
		'dragend': 'dragEndEvent',
		'click .edit-title': 'editBookmark',
		'focus .bookmark-title': 'saveTitle',
		'keypress .bookmark-title': 'updateBookmark',
		'click .bookmark-menu-wrap': 'showMenu',
		'click .copy-link': 'copyToClipboard',
		'click .add-tag': 'addTag',
		'keyup .bookmark-tags': 'nameTag',
		'click .bookmark-tags': 'tagClicked',
		'click .tag-delete': 'removeTag',
		'click .bookmark-delete': 'clear',
		//tests
		'click .star-mobile': 'starBookmark',
		'click .delete-mobile': 'clear'
	},

	initialize: function() {
		this.listenTo(this.model, 'search', this.showResults);
		this.listenTo(this.model, 'isStarred', this.hideShowStarred)
		this.listenTo(this.model, 'dragHide', this.dragHide)
		this.listenTo(this.model, 'hide', this.hideBookmarks);
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'change', this.render);

		var bookmarkCollectionID = this.model.get('collection_id')
		if ( bookmarkCollectionID != null ) {
			globalBookmarkCollections.get(bookmarkCollectionID).bookmarkCollections.add(this.model)
		}

		this.template = _.template($(Template).html())
	},

	render: function(bookmark) {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	showMenu: function(e) {
		bookmarkMenu = this.$('.bookmark-menu');
		bookmarkMenu.toggle();
		$('html').one('click', function() {
			bookmarkMenu.hide();
		});

		e.stopPropagation();
	},

	copyToClipboard: function() {
		bookmark_url = this.model.get('url')
		window.prompt ("Copy to clipboard:", bookmark_url);
	},

	dragStartEvent: function (e) {

		// Get the bookmark id and it's collection id
		var data = {
			'id': this.model.id,
			'collection_id': this.model.get('collection_id'),
		};
		var data = JSON.stringify(data)
				
		e.originalEvent.dataTransfer.effectAllowed = 'move';
		e.originalEvent.dataTransfer.setData('model', data);
	
		this.$el.addClass('being-moved');
	},

	dragEndEvent: function() {
			this.$el.removeClass('being-moved');
	},

	dragHide: function(draggedModel) {
		this.$el.addClass('hidden');
		this.$el.css('opacity', '1');
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
		tagField = this.$('.bookmark-tags');
		tagField.attr('contenteditable', 'true')
		tagField.focus();
	},

	nameTag: function(e) {
		if (e.which === ENTER_KEY) {
			$('html').off('click')
			tagField.blur();
			var tag = tagField.text();
			tagField.removeAttr('contenteditable');
			this.model.save({tag: tag}, tokenHeader);
			return false;
		}

		this.tagClickListener()
	},

	tagClickListener: function() {
		$this = this

		$('html').off('click')
		$('html').one('click', function() {
			var tag = tagField.text()
			tagField.removeAttr('contenteditable');
			$this.model.save({tag: tag}, tokenHeader);
		});
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

		tag = bookmark.get('tag').toLowerCase();

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

	editBookmark: function() {
		titleField = this.$('.bookmark-title');
		titleField.attr('contenteditable', 'true').focus()
	},

	updateBookmark: function(e) {
		if (e.which === ENTER_KEY) {
			$('html').off('click')
			titleField.blur();
			var newval = titleField.text();
			if (newval.length == 0) {
				console.log(newval.length)
				titleField.text(window.savedTitle);
			} else {
				this.saveBookmark(newval);
			}

			return false;
		}

		this.clickListener();
	},

	clickListener: function() {
		$this = this
		
		$('html').off('click')
		$('html').one('click', function() {
			var newval = titleField.text();
			$this.saveBookmark(newval);
		});
	},

	saveBookmark: function(newval) {
		titleField.removeAttr('contenteditable');
		this.model.save({ 'title': newval}, tokenHeader);
	},

	clear: function() {
		model = this.model;

		if ( user_template == 'list' ) {
			this.$el.css({ right: '100%' })
		} else {
			this.$el.css({
				'-webkit-transform': 'scale(0)',
				'-ms-transform': 'scale(0)',
				'transform': 'scale(0)'
			});
		}	
		this.$el.one('transitionend', function() {
			model.destroy(tokenHeader);
		})
	},

});

var SettingsView = Backbone.View.extend({
	el: '.settings-block',

	initialize: function() {

	},

	events: {
		'change .settings-form-select': 'changeBookmarkTemplate',
		'change .settings-import-button': 'sendBookmarks'
	},

	changeBookmarkTemplate: function() {
	    if ( $('.settings-form-option:selected').val() == 'title' ) {
	            globalBookmarkCollections.order_by_title();
	    } else if ( $('.settings-form-option:selected').val() == 'date' ) {
	            globalBookmarkCollections.order_by_date();
	    } else if ( $('.settings-form-option:selected').val() == 'size' ) {
	            globalBookmarkCollections.order_by_size();
	    }

	    globalBookmarkCollections.trigger('reset');
	},

	sendBookmarks: function() {
		mda = document.getElementsByClassName('settings-import-button')[0]
	    var formData = new FormData();
	    formData.append("thefile", mda.files[0]);
	    var xhr = new XMLHttpRequest();
	    xhr.open('POST', 'http://markedbyme.appspot.com/da', true);
	    xhr.send(formData);

	    console.log(xhr.status)

	    if (xhr.status == 201) {
	        location.reload()
	    }
	}
});

var settingsView = new SettingsView();
