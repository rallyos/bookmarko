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
		'click #report': 'showReportBlock',
		'click #settings': 'openSettings',
		'click .report-send': 'sendReport',
		'click .recover-submit': 'forcePassChangeSubmit'
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
		var newUserTemplate = $('<img class="help-arrows" src="http://bookmarkoapp.com/static/images/user/newtest.png">')
			newUserTemplate.appendTo($('.bookmarks-section') );

		if (new_user == 'true') {
    		var newUserTemplate = $('<h1 class="new-user-text thank-you">Thank you for signing up!</h1><p class="new-user-text beta-warning"><span class="new-user-bookmarko">Bookmarko</span> is still in early beta so everything can brake, and <br> your user experience may not be so good.</p>')
    			newUserTemplate.insertAfter('.help-arrows');
	
			var getExtensionTemplate = $('<div class="browser-extensions-box"><h1 class="new-user-text get-extension-header">Get the extension and start saving bookmarks</h1><a class="browser-extensions-link" href="https://chrome.google.com/webstore/detail/bookmarko/cjiadbbjgehkojjabcbegjmmlcfhgped" target="_blank"><img class="browser-extensions-icon" src="http://bookmarkoapp.com/static/images/user/webstorex124.png"></a></div>')
				getExtensionTemplate.insertAfter('.beta-warning')
		} else {
			var getExtensionTemplate = $('<div class="browser-extensions-box"><h1 class="new-user-text get-extension-header">Get the extension and start saving bookmarks</h1><a class="browser-extensions-link" href="https://chrome.google.com/webstore/detail/bookmarko/cjiadbbjgehkojjabcbegjmmlcfhgped" target="_blank"><img class="browser-extensions-icon" src="http://bookmarkoapp.com/static/images/user/webstorex124.png"></a></div>')
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
	},

	showReportBlock: function() {
		this.$('.report-block').toggleClass('hidden')

		window.setTimeout(function(){
			if ( window.innerWidth > 560 ) {
				this.$('.report-block').toggleClass('an-block')
			} else {
				this.$('.report-block').toggleClass('an-block-mobile')
			}
		}, 100);
	},

	sendReport: function() {

		message = this.$('.report-message').val()

		if ( message.length > 0 ) {
			$.ajax({
				type: 'POST',
				url: 'report_bug',
				headers: {'Authorization': 'Token ' + token, 'X-CSRFToken': csrftoken},
				data: {message: message}
			}).done(function() {
					$('.say-thanks').addClass('say-thanks-translate')
				
				window.setTimeout(function() {
					$('.report-message').val('')
					$('.say-thanks').removeClass('say-thanks-translate')
				}, 2000)
			})
		}

	},

	forcePassChangeSubmit: function() {

		newpass = this.$('.recover-input').val()

		if ( newpass.length > 0 ) {
			$.ajax({
				type: 'POST',
				url: 'password_change',
				headers: {'Authorization': 'Token ' + token, 'X-CSRFToken': csrftoken},
				data: {data: newpass}
			}).done(function() {
				$('.recover-message').addClass('recover-message-show')

				window.setTimeout(function() {
					$('.recover-box').remove();
				}, 3000)
			}).fail(function() {
				this.$('.recover-input').css('border', 'solid 2px red')
			})
		}
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
		'keypress .bookmark-title': 'onEnter',

		'click .bookmark-menu-wrap': 'showMenu',
		'click .copy-link': 'copyToClipboard',
		'click .add-tag': 'addTag',

		'focus .bookmark-tags': 'tagFocus',
		'keyup .bookmark-tags': 'onEnterTag',
		'blur .bookmark-tags': 'updateTag',
		'click .bookmark-tags': 'tagClicked',
		'click .tag-delete': 'removeTag',

		'click .bookmark-delete': 'clear',
		//tests
		'click .star-mobile': 'starBookmark',
		'click .delete-mobile': 'clear',
		'blur .bookmark-title': 'updateBookmark',
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
		this.$el.removeAttr('draggable')
		tagField.attr('contenteditable', 'true')
		tagField.focus();
	},

	tagFocus: function() {
		tagField = this.$('.bookmark-tags');
	},

	onEnterTag: function(e) {
		if (e.which === ENTER_KEY) {
			tagField.blur();
			return false;
		}
	},

	updateTag: function() {
			var tag = tagField.text();
			tagField.removeAttr('contenteditable');
			this.$el.attr('draggable', 'true')
			this.tagSave(tag)
	},

	tagSave: function(tag) {
			this.model.save({tag: tag}, tokenHeader);
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

	editBookmark: function(e) {
		this.$el.removeAttr('draggable')
		titleField = this.$('.bookmark-title');
		titleField.attr('contenteditable', 'true').focus()
	},

	onEnter: function(e) {
		if (e.which === ENTER_KEY) {
			titleField.blur()
			return false;
		}
	},

	updateBookmark: function() {
		this.$el.attr('draggable', 'true')
		titleField.removeAttr('contenteditable');

		newval = titleField.text()
		this.model.set({title: newval})

		if (newval.length == 0) {
			titleField.text(window.savedTitle);
		} else if ( this.model.hasChanged('title') ) {		
			this.saveBookmark();
		}
	},

	saveBookmark: function() {
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

		if ( recover == 'true' ) {
			this.forcePassChange();
		}


		passinput = this.$('.new-pass-input');
		confirmButton = this.$('.confirm-pass-change');
	},

	events: {
		'click .change-tmpl': 'changeTemplate',
		'change .settings-form-select': 'changeBookmarkTemplate',
		'change .settings-import-button': 'sendBookmarks',
		'focus .new-pass-input': 'showConfirmButton',
		'keyup .new-pass-input': 'onEnterPass',
		'click .confirm-pass-change': 'changePassword'
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
	    xhr.open('POST', 'http://bookmarkoapp.com/da', true);
	    xhr.send(formData);

	    console.log(xhr.status)

	    if (xhr.status == 201) {
	        location.reload()
	    }
	},

	showConfirmButton: function() {
		confirmButton.removeClass('hidden');
	},

	onEnterPass: function(e) {
		if (e.which === ENTER_KEY) {
			confirmButton.click()
			return false;
		}
	},

	changePassword: function() {
		msgEl = this.$('.change-pass-message')
		newpass = passinput.val()

		if ( newpass.length > 0 ) {
			$.ajax({
				type: 'POST',
				url: 'password_change',
				headers: {'Authorization': 'Token ' + token, 'X-CSRFToken': csrftoken},
				data: {data: newpass}
			}).done(function() {
				msgEl.removeClass('hidden')

				window.setTimeout(function(){
					msgEl.text('Password change successful!')
					msgEl.css('opacity', '1')
				}, 100)
				window.setTimeout(function() {
					msgEl.css('opacity', '0')
					confirmButton.addClass('hidden')
					msgEl.addClass('hidden')
					passinput.val('')
				}, 2000)
			}).fail(function() {
				msgEl.removeClass('hidden')

				window.setTimeout(function(){
					msgEl.text('Invalid Password')
					msgEl.css('opacity', '1')
				}, 100)
				window.setTimeout(function() {
					msgEl.css('opacity', '0')
					passinput.val('')
				}, 2000)
			})

		}
	},

	forcePassChange: function() {
		$('<div><div class="recover-message"><h1 class="recover-message-h">Ok, we\'ve got it. Thank you!</h1></div><h1 class="recover-heading">Please fill your new password</h1><input class="recover-input" type="password"><input class="recover-submit" type="submit"></div>').appendTo('.content').addClass('recover-box')
		window.setTimeout(function() {
			$('.recover-box').css('top', '150px')
		}, 100)
		// on success remove the cookie
	}

});

var settingsView = new SettingsView();
