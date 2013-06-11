// Sidebar View
var SidebarView = Backbone.View.extend({
	el: '.sidebar',

	initialize: function () {
		
		// On 'add' event in 'bookmarks' collection run addBookmark() function.
		this.listenTo(globalBookmarkCollections, 'add', this.loadBookmarkCollection);

		// Load all bookmark collections from the server
		globalBookmarkCollections.fetch();
	},

	events: {
		'click .group-add': 'createCollection'
	},

	createCollection: function() {
		// :) to be continued... 
	},

	// Makes new single bookmark view with 'bookmark' for model
	loadBookmarkCollection: function(bookmarks_collection) {
		var newBookmarkCollectionView = new BookmarkCollectionView({model: bookmarks_collection});
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
		
		// When the collection is loaded from the server run function to serialize the data
		this.listenTo(this.model.bookmarkCollections, 'sync', this.serializeCollection);

		// When the collection is loaded from the server run render()
		this.model.bookmarkCollections.bind('sync', _.bind(this.render, this));

		// Load the subollection from the server
		this.model.bookmarkCollections.fetch();
	},

	events: {
		'click': 'navigateRouter'
	},


	navigateRouter: function() {

		// Navigate the router based on id. In the future the url should show collection name
		pageRouter.navigate('#/collections/' + this.model.id );
	},

	// When fetched convert them to json
	serializeCollection: function() {
		this.model.bookmarkCollections.toJSON();
	},

	// The render function for the single collection.
	// It appends the template html and serialized model to the $el.
	render: function(bookmarks_collection) {
		this.$el.html(this.template(this.model.toJSON()));
		var background_color = this.model.get('collection_background');
		this.$el.css('background', background_color);
		return this;
	}

});