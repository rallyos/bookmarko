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

	/*
		Sidebar colors array
		1: #EB4040 (red)
		2: #4ABB3E (green)
		3: #343534 (black)
		4: #33A3C0 (green-blue)
		5: #863825 (brown)
	*/

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
		'click .bookmarks-group-control': 'navigateRouter',
		'keypress .bookmarks-group-name': 'updateGroup',

		'dragenter': 'dragEnterEvent',
		'dragover': 'dragOverEvent',
		'dragleave': 'dragLeaveEvent',
		'drop': 'dragDropEvent',

		'click .bookmarks-group-delete': 'clear'
	},

	navigateRouter: function() {

		// Navigate the router based on id. In the future the url should show collection name
		pageRouter.navigate('#/collections/' + this.model.id );
	},

	// When fetched convert them to json
	serializeCollection: function() {
		this.model.bookmarkCollections.toJSON();
	},

	updateGroup: function(e) {
		if (e.which === ENTER_KEY) {
			this.$('.bookmarks-group-name').blur();
			var newval = this.$('.bookmarks-group-name').text();
			this.saveGroup(newval);
			return false;
		}
	},

	dragEnterEvent: function(e) {
		console.log('IZVINISEBE IZVINISEBE IZVINISEBE');
		this.$el.css('opacity','0.6');
	},

	dragOverEvent: function(e) {		
		if (e.preventDefault) {
	    	e.preventDefault(); // Necessary. Allows us to drop.
		}

		//e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

		return false;
	},

	dragDropEvent: function(e) {

  		if (e.stopPropagation) {
  	  		e.stopPropagation(); // stops the browser from redirecting.
  		} // ???????????

	// Set the source column's HTML to the HTML of the column we dropped on.
		dragSrcEl.innerHTML = this.innerHTML;
		this.innerHTML = e.dataTransfer.getData('text/html');
		
		return false;

		console.log(e)
		console.log(this)
	},

	dragLeaveEvent: function() {
		this.$el.css('opacity','1');
	},

	saveGroup: function(newval) {
		this.model.save({ 'collection_name': newval}, { headers: { 'Authorization': 'Token ' + token } });
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