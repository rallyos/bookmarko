// Content View
// Responsible for showing all bookmarks 
'use strict'

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
	},

	events: {
		'click .home-button': 'navHome',
		'click .sidebar-show-button': 'toggleSidebar',
		'keyup .input-search': 'searchBookmarks',
		'click .starred': 'showStarred',
		'click #report': 'showReportBlock',
		'click #settings': 'openSettings',
		'click #add-url': 'openAddUrl',
		'keyup .add-url-input': 'addOnEnter',
		'click .add-url-submit': 'addFromPage',
		'click .report-send': 'sendReport',
		'click .recover-submit': 'forcePassChangeSubmit'
	},

	afterLoginSetup: function() {

		// If the address contains 'collections' do the work and show him the desired collection
		if ( location.pathname.match('collections') ) {
			var title = location.pathname.match(/\w{0,}$/)
			pageRouter.collection(title)
		} else {
			bookmarks.trigger('login');
		}
		
		// Show welcome page if there are no bookmarks
		if ( bookmarks.length == 0 ) {
			bookmarks.trigger('empty')
		}		
	},

	showHelp: function() {
		var newUserTemplate = $('<img class="help-arrows" src="https://bookmarko.herokuapp.com/static/images/user/newtest.png">')
			newUserTemplate.appendTo($('.bookmarks-section') );

		if (NEW_USER == 'true') {
    		var newUserTemplate = $('<h1 class="new-user-text thank-you">Thank you for signing up!</h1><p class="new-user-text beta-warning"><span class="new-user-bookmarko">Bookmarko</span> is still in early beta so everything can brake, and <br> your user experience may not be so good.</p>')
    			newUserTemplate.insertAfter('.help-arrows');
	
			var getExtensionTemplate = $('<div class="browser-extensions-box"><h1 class="new-user-text get-extension-header">Get the extension and start saving bookmarks</h1></br><h1 class="new-user-text get-extension-header">2020 Update: Rely on the Add button for testing. The extensions are long gone.</h1><a class="browser-extensions-link" href="https://chrome.google.com/webstore/detail/bookmarko/cjiadbbjgehkojjabcbegjmmlcfhgped" target="_blank"><img class="browser-extensions-icon" src="https://www.bookmarkoapp.com/static/images/user/webstorex124.png"></a></div>')
				getExtensionTemplate.insertAfter('.beta-warning')
		} else {
			var getExtensionTemplate = $('<div class="browser-extensions-box"><h1 class="new-user-text get-extension-header">Get the extension and start saving bookmarks</h1></br><h1 class="new-user-text get-extension-header">2020 Update: Rely on the Add button for testing. The extensions are long gone.</h1><a class="browser-extensions-link" href="https://chrome.google.com/webstore/detail/bookmarko/cjiadbbjgehkojjabcbegjmmlcfhgped" target="_blank"><img class="browser-extensions-icon" src="https://www.bookmarkoapp.com/static/images/user/webstorex124.png"></a></div>')
				getExtensionTemplate.insertAfter('.help-arrows')
		}
	},

	// Back to home
	navHome: function() {
		pageRouter.navigate('', true);
	},

	// Show/Hide blocks on mobile
	toggleSidebar: function() {
		$('.sidebar').toggleClass('sidebar-show');
		$('.bookmarks-section').toggleClass('bookmarks-section-translate');
	},

	// Show bookmarks based on their collection
	userEntered: function() {
		var param = null;
		var fn = 'collection';
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

			if (bookmarks.length == 0) {
				this.$('.help-arrows').show()
				this.$('.browser-extensions-box').show()
			}

			this.$('.no-starred-block').hide()					

			// Use the universal filter function to show the previous view
			var fn = 'collection';
			var param = null;
			this.filterBy(param, fn);
		} else {
			this.$starButton.data('pressed', 'yes');
			this.$starButton.toggleClass('yellow-star')

			// Trigger the check for starred bookmarks
			bookmarks.forEach(function(bookmarks) {
				bookmarks.trigger('isStarred', bookmarks);
			});	


			// just test code
			// refactor it
			// foreach function or other
			var starred = []
			for (var i = 0; i < bookmarks.length; i++) {
				if (bookmarks.models[i].attributes.starred == true) {
					starred.push(i)	
				}
			};

			if (starred.length < 1) {
				if (bookmarks.length == 0) {
					this.$('.help-arrows').hide()
					this.$('.browser-extensions-box').hide()
				}
				this.$('.no-starred-block').show()
			} else {
				this.$('.no-starred-block').hide()					
			}
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

	openAddUrl: function() {
		$('.add-url-block').toggleClass('add-url-show')
	},

	addOnEnter: function(key) {
		if (key.which === ENTER_KEY) {
			this.addFromPage()
		}
	},

	addFromPage: function() {
		$('.add-url-submit').text('').append('<img class="add-url-loading" width="25" height="25" src="/static/images/user/add_url_loading.png">')
		$.ajax({
			type: 'POST',
			url: ROOT_URL + '/add_from_page',
			headers: {'Authorization': 'Token ' + TOKEN, 'X-CSRFToken': CSRFTOKEN},
			data: {url: $('.add-url-input ').val()}
		}).done(function(data) {
			var p = JSON.parse(data)
			$('.add-url-submit').remove('.add-url-loading').text('\u2713')
			if (bookmarks.length == 0) {
				$('.help-arrows').remove()
				$('.browser-extensions-box').remove()
			}
			bookmarks.add({id: p.id, title: p.title, url: p.url,
			image: null, starred: false, collection_id: null, description: null, tag: null})
			setTimeout(function() {
				$('.add-url-block').removeClass('add-url-show')
				$('.add-url-submit').text('+')
			}, 1000)
		})
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

		var message = this.$('.report-message').val()

		if ( message.length > 0 ) {
			$.ajax({
				type: 'POST',
				url: ROOT_URL + '/report_bug',
				headers: {'Authorization': 'Token ' + TOKEN, 'X-CSRFToken': CSRFTOKEN},
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

		var newpass = this.$('.recover-input').val()

		if ( newpass.length > 0 ) {
			$.ajax({
				type: 'POST',
				url: ROOT_URL + '/password_change',
				headers: {'Authorization': 'Token ' + TOKEN, 'X-CSRFToken': CSRFTOKEN},
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
		'click .select-bookmark': 'selectBookmark',
		'dragstart': 'dragStartEvent',
		'dragend': 'dragEndEvent',

		'click .bookmark-menu-wrap': 'showMenu',
		'click .copy-link': 'copyToClipboard',

		'click .bookmark-delete': 'clear',

		'click .star-mobile': 'starBookmark',
		'click .delete-mobile': 'clear',
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

		$(this.el).attr('draggable', 'true')

		this.template = _.template($($TEMPLATE).html())
	},

	render: function(bookmark) {
		this.$el.html(this.template(this.model.toJSON()));
		// Needy because of the view class change
		this.$el.attr('class', BM_CLASS)
		return this;
	},

	showMenu: function(e) {
		var bookmarkMenu = this.$('.bookmark-menu');
		bookmarkMenu.toggle();
		$('html').one('click', function() {
			bookmarkMenu.hide();
		});

		e.stopPropagation();
	},

	copyToClipboard: function() {
		var bookmark_url = this.model.get('url')
		window.prompt ("Copy to clipboard:", bookmark_url);
	},

	selectBookmark: function() {
		console.log('not implemented')
		// $(this.el).toggleClass('bookmark-selected')
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
			this.model.save({ 'starred': true}, TOKEN_HEADER);
		} else if ( this.model.get('starred') == true ) {
			this.$('.bookmark-star').removeClass("bookmark-starred");
			this.model.save({ 'starred': false}, TOKEN_HEADER);
		}
	},

	hideShowStarred: function(bookmark) {
			if ( bookmark.get('starred') == false ) {
				this.$el.addClass('hidden');
			} else {
				this.$el.removeClass('hidden');
			}
	},

	showResults: function(bookmark, searchWord) {
		var title = bookmark.get('title').toLowerCase();
		var url = bookmark.get('url').toLowerCase();
		var searchWord = searchWord.toLowerCase();

		if (title.match(searchWord) || url.match(searchWord)) {
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
		} else {
				this.$el.removeClass('hidden');
		}
	},

	clear: function() {
		var model = this.model;

		if ( APPEARANCE == 'LI' ) {
			this.$el.css({ right: '100%' })
		} else {
			this.$el.css({
				'-webkit-transform': 'scale(0)',
				'-ms-transform': 'scale(0)',
				'transform': 'scale(0)'
			});
		}	
		this.$el.one('transitionend', function() {
			model.destroy(TOKEN_HEADER);
		})
	},

});

var SettingsView = Backbone.View.extend({
	el: '.settings-block',

	initialize: function() {

		this.listenTo(globalBookmarkCollections, 'add', this.addNew);
		this.listenTo(globalBookmarkCollections, 'reset', this.addAll);

		if ( RECOVER == 'true' ) {
			this.forcePassChange();
		}

		this.$passinput = this.$('.new-pass-input');
		this.$confirmButton = this.$('.confirm-pass-change');
	},

	events: {
		'click .show-hide-setting': 'hideSetting',
		'click .change-tmpl': 'changeTemplate',
		'change .settings-form-select': 'changeBookmarkTemplate',
		'change .settings-import-button': 'sendBookmarks',
		'focus .new-pass-input': 'showConfirmButton',
		'keyup .new-pass-input': 'onEnterPass',
		'click .confirm-pass-change': 'changePassword'
	},

	hideSetting: function(click) {
		if (click.target.textContent == '+') {
			click.target.textContent = '-'
		} else {
			click.target.textContent = '+'
		}
		$(click.target).parent().next().slideToggle()
	},

	changeTemplate: function(click) {

		if ( click.target.id == 'list' ) {
			window.APPEARANCE = 'LI'
	        window.$TEMPLATE = '#list-template';
	        window.BM_CLASS = 'bookmark list-tmpl'
		} else if ( click.target.id == 'grid' ) {
			window.APPEARANCE = 'GR'
	        window.$TEMPLATE = '#grid-template';
	        window.BM_CLASS = 'bookmark grid-tmpl'
		}

		this.syncSettings()
		bookmarks.fetch({reset: true})
	},

	syncSettings: function() {
		$.ajax({
			type: 'POST',
			url: ROOT_URL + '/change_settings',
			headers: {'Authorization': 'Token ' + TOKEN, 'X-CSRFToken': CSRFTOKEN},
			data: {'appearance': APPEARANCE, 'order_collections': order_collections}
		})
	},

	// Why this function has wrong name?
	changeBookmarkTemplate: function() {
	    if ( $('.settings-form-option:selected').val() == 'title' ) {
	    		window.order_collections = 'NA'
	            globalBookmarkCollections.order_by_title();
	    } else if ( $('.settings-form-option:selected').val() == 'date' ) {
	    		window.order_collections = 'DA'
	            globalBookmarkCollections.order_by_date();
	    } else if ( $('.settings-form-option:selected').val() == 'size' ) {
	    		window.order_collections = 'SI'
	            globalBookmarkCollections.order_by_size();
	    }

	    globalBookmarkCollections.trigger('reset');
	    this.syncSettings()
	},

	sendBookmarks: function() {
		var mda = document.getElementsByClassName('settings-import-button')[0]
	    var formData = new FormData();
	    formData.append("thefile", mda.files[0]);
	    var xhr = new XMLHttpRequest();
	    xhr.open('POST', 'da');
	    xhr.setRequestHeader('X-CSRFToken', CSRFTOKEN)
	    xhr.send(formData);

	    console.log(xhr.status)

	    xhr.onreadystatechange = function() {
	    	console.log(xhr.readyState)
			if (xhr.readyState == 4) {
				location.reload()
			}
	    }
	},

	showConfirmButton: function() {
		this.$confirmButton.removeClass('hidden');
	},

	onEnterPass: function(e) {
		if (e.which === ENTER_KEY) {
			this.$confirmButton.click()
			return false;
		}
	},

	changePassword: function() {
		var msgEl = this.$('.change-pass-message')
		var newpass = this.$passinput.val()

		if ( newpass.length > 0 ) {
			$.ajax({
				type: 'POST',
				url: ROOT_URL + '/password_change',
				headers: {'Authorization': 'Token ' + TOKEN, 'X-CSRFToken': CSRFTOKEN},
				data: {data: newpass}
			}).done(function() {
				msgEl.removeClass('hidden')

				window.setTimeout(function(){
					msgEl.text('Password change successful!')
					msgEl.css('opacity', '1')
				}, 100)
				window.setTimeout(function() {
					msgEl.css('opacity', '0')
					settingsView.$confirmButton.addClass('hidden')
					msgEl.addClass('hidden')
					settingsView.$passinput.val('')
				}, 2000)
			}).fail(function() {
				msgEl.removeClass('hidden')

				window.setTimeout(function(){
					msgEl.text('Invalid Password')
					msgEl.css('opacity', '1')
				}, 100)
				window.setTimeout(function() {
					msgEl.css('opacity', '0')
					settingsView.$passinput.val('')
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
	},

	addNew: function(bookmarks_collection) {
		var newCollectionEditView = new CollectionEditView({model: bookmarks_collection});
		this.$('.collections-list-edit').append(newCollectionEditView.render().el);
	},

	addAll: function() {
		this.$('.collections-list-edit').html('');
		globalBookmarkCollections.each(this.addNew, this);
	}

});

var settingsView = new SettingsView();


var CollectionEditView = Backbone.View.extend({
	tagName: 'li',
	className: 'collection-edit',

	template: _.template($('#collection-edit-template').html()),	

	initialize: function() {
		this.listenTo(this.model, 'update', this.updateTitle);
		this.listenTo(this.model, 'destroy', this.remove);
	},

	events: {
		'keypress .collection-edit-name': 'createOnEnter',
		'click .collection-edit-delete': 'clear',		
		'click .bookmarks-group-color': 'changeGroupColor',
		'click .collection-edit-color': 'togglePalette',
	},

	createOnEnter: function(e) {
		if (e.which === ENTER_KEY) {
			var newval = this.$('.collection-edit-name').text();
			this.model.set({title: newval})

			if ( this.model.hasChanged('title') ) {
				this.model.trigger('update')
				this.saveGroup(newval)
			}

			this.$('.collection-edit-name').blur()

			return false;
		}
	},

	updateTitle: function() {
		this.$('.collection-edit-name').text(this.model.attributes.title)
	},

	togglePalette: function() {
		this.$('.bookmarks-group-color-palette').toggleClass('drawer-open');
	},

	changeGroupColor: function(click) {
		var n = click.target.getAttribute('data-n');
		// Since the colors in DOM are rgb we have to use alternative way of getting and setting the new color.
		var newBgColor = COLORS[n]

		this.$('.collection-edit-color').css('background-color', newBgColor);
		this.model.trigger('colorChanged', newBgColor)

		this.model.save('background', newBgColor, TOKEN_HEADER);
	},

	clear: function () {
		if (window.confirm("Delete collection " + this.model.attributes.title + '?')) {
			var model = this.model;
			this.$el.css({ opacity: '0' })

			this.$el.one('transitionend', function() {
				model.destroy(TOKEN_HEADER);
			});
		}
	},

	saveGroup: function(newval) {
		this.model.save({ 'title': newval}, TOKEN_HEADER);
	},

	render: function(bookmarks_collection) {
		this.$el.html(this.template(this.model.toJSON()));
		this.$('.collection-edit-color').css('background-color', this.model.get('background'));
		return this;
	}

})