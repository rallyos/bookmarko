/* Sidebar view
version 0.0.3, May 30

# To be checked before beta
>> Do I need to listen for 'reset' event?
>> Do I need to set 'model: bookmark' in the addBookmark()
>> 'Strict mode?'
*/

// Sidebar View
var SidebarView = Backbone.View.extend({
	el: '.sidebar',

	initialize: function () {
		
		// On 'add' event in 'bookmarks' collection run addBookmark() function.
		this.listenTo(globalBookmarkCollections, 'add', this.addBookmarkCollection);

		// Sync all models with the server
		globalBookmarkCollections.fetch();
	},

	events: {
		'click .group-add': 'addBookmarkCollection'
	},

	// Makes new single bookmark view with 'bookmark' for model
	addBookmarkCollection: function(collectn) {
		var newBookmarkCollectionView = new BookmarkCollectionView({model: collectn});
		$('.sidebar').append(newBookmarkCollectionView.el);
	}

});

// Initialize the view
var sidebar = new SidebarView();


// Single collection view
var BookmarkCollectionView = Backbone.View.extend({
	tagName: 'div',
	className: 'group',
	model: BookmarkCollection,
	template: _.template($('#collection-template').html()),

	initialize: function() {		
		this.listenTo(this.model.bookmarkCollections, 'sync', this.testin)
		this.model.bookmarkCollections.bind("sync", _.bind(this.render, this));
		this.model.bookmarkCollections.fetch();
	},

	events: {
		'click': 'checkin'
	},
	checkin: function() {
		console.log('mhm');
		pageRouter.navigate('#/collections/' + this.model.id ); // just testing navigate. don't use it that way
	},

	testin: function() {
		console.log(this.model.bookmarkCollections.toJSON());

		this.model.bookmarkCollections.toJSON();

	},

	// The render function for the single collection.
	// It appends the template html and serialized model to the $el.
	render: function(collectn) {
		this.$el.html(this.template(this.model.toJSON()));
		var background_color = this.model.get('collection_background');
		this.$el.css('background', background_color);
		return this;
	}

});