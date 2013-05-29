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
		this.listenTo(collections, 'add', this.addBookmarkCollection);

		// Sync all models with the server
		collections.fetch();
	},

	// Makes new single bookmark view with 'bookmark' for model
	addBookmarkCollection: function(collection) {
		var newBookmarkCollectionView = new BookmarkCollectionView({model: collection});
		$('.sidebar').append(newBookmarkCollectionView.render().el);
	}

});

// Initialize the view
var sidebar = new SidebarView();


// Single collection view
var BookmarkCollectionView = Backbone.View.extend({
	tagName: 'div',
	className: 'group',

	template: _.template($('#collection-template').html()),

	// The render function for the single collection.
	// It appends the template html and serialized model to the $el.
	render: function(collection) {
		this.$el.html(this.template(this.model.toJSON()));
		background_color = this.model.get('collection_background');
		this.$el.css('background', background_color);
		return this;
	}

});