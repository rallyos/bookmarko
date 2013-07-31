// Content View
// Responsible for showing all bookmarks 

var ContentView = Backbone.View.extend({
	el: '.content',

	initialize: function() {
		
		this.listenTo(bookmarks,'add', this.addBookmark);

		this.listenTo(bookmarks,'login', this.userEntered);

		this.listenTo(bookmarks,'filter', this.filterBy);


		bookmarks.fetch({success: function() {
			bookmarks.trigger('login');
		}});

		this.$searchInput = this.$('.input-search');
		this.$starButton = this.$('.starred');
	},

	events: {
		'keyup .input-search': 'searchBookmarks',
		'click .starred': 'showStarred'
	},

	userEntered: function() {
		param = null;
		fn = 'collection';
		this.filterBy(param, fn);
	},

	filterBy: function(param, fn) {
		bookmarks.forEach(function(bookmark) {
			bookmark.trigger('hide', bookmark, param, fn);
		});
	},

	showStarred: function() {
		if (this.$starButton.data('pressed') == 'yes' ) {
			
			this.$starButton.data('pressed', 'no');
			this.$starButton.toggleClass('yellow-star')
			fn = 'collection';
			param = null;
			this.filterBy(param, fn);
		} else {
			
			this.$starButton.data('pressed', 'yes');
			this.$starButton.toggleClass('yellow-star')
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

		'click .bookmark-star': 'starBookmark',

		'dragstart .select-bookmark': 'dragStartEvent',

		'keypress .bookmark-title': 'updateBookmark',

		'click .bookmark-tags': 'tagClicked',

		'click .bookmark-delete': 'clear',

	},

	initialize: function() {

		this.listenTo(this.model, 'search', this.showResults);

		this.listenTo(this.model, 'isStarred', this.hideShowStarred)

		this.listenTo(this.model, 'dragHide', this.dragHide)

		this.listenTo(this.model, 'hide', this.hideBookmarks);

		this.listenTo(this.model, 'destroy', this.remove);

	},

	render: function(bookmark) {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	dragStartEvent: function (e) {

		var data = {
			'id': this.model.id,
			'collection_id': this.model.get('collection_id'),
		};

		var data = JSON.stringify(data)
		
		e.originalEvent.dataTransfer.setDragImage(img1, 10, 17);


		e.originalEvent.dataTransfer.effectAllowed = 'move';
		e.originalEvent.dataTransfer.setData('model', data);

	},

	starBookmark: function(bookmark) {
		if ( this.model.get('starred') == false ) {
			this.$('.bookmark-star').addClass("bookmark-starred");
			this.model.save({ 'starred': true}, { headers: { 'Authorization': 'Token ' + token } });
		} else if ( this.model.get('starred') == true ) {
			this.$('.bookmark-star').removeClass("bookmark-starred");
			this.model.save({ 'starred': false}, { headers: { 'Authorization': 'Token ' + token } });
		}
	},

    tagClicked: function() {
            tagN = this.model.get('tag');
            pageRouter.navigate('/tags/'+ tagN, true);
    },

	hideShowStarred: function(bookmark) {
			if ( bookmark.get('starred') == false ) {
				this.$el.addClass('hidden');
			} else {
				this.$el.removeClass('hidden');
			}
	},

	showResults: function(bookmark, searchWord) {
		title = bookmark.get('title');
		url = bookmark.get('url');
		tag = bookmark.get('tag');

		if ( title.match(searchWord) || url.match(searchWord) || tag.match(searchWord)) {
			this.$el.removeClass('hidden');
		} else {
			this.$el.addClass('hidden');
		}
	},

	updateBookmark: function(e) {
		if (e.which === ENTER_KEY) {
			this.$('.bookmark-title').blur();
			var newval = this.$('.bookmark-title').text();
			this.saveBookmark(newval);
			return false;
		}
	},

	hideBookmarks: function(bookmark, param, fn) {
		if ( fn == 'collection' & bookmark.get('collection_id') != param) {
				this.$el.addClass('hidden');
		} else if ( fn == 'tag' & bookmark.get('tag') != param ) {
				this.$el.addClass('hidden');
		} else {
				this.$el.removeClass('hidden');
		}
	},

	saveBookmark: function(newval) {
		this.model.save({ 'title': newval}, { headers: { 'Authorization': 'Token ' + token } });
	},

	dragHide: function(draggedModel) {
		this.$el.addClass('hidden');
	},

	clear: function () {
		this.$el.css({
			right: '100%',
		}, this.$el.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', this.destrooy())
		)
	},

	destrooy: function() {
		this.model.destroy({ headers: { 'Authorization': 'Token ' + token } });
	}
});