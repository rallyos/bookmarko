// Sidebar View
var SidebarView = Backbone.View.extend({
	el: '.sidebar',

	initialize: function () {
		
		// On 'add' event in 'bookmarks' collection run addBookmark() function.
		this.listenTo(globalBookmarkCollections, 'add', this.loadBookmarkCollection);


		this.listenTo(globalBookmarkCollections, 'new', this.addButton);

		// Load all bookmark collections from the server
		globalBookmarkCollections.fetch({ success: function() {

			if ( $('.group-wrap').length == 0 ) {
				$('<div class="group-add"><span>New Group</span></div>').appendTo('.sidebar');
			}

			lastGroup = $('.group-wrap').last();
			$('<div class="group-add"><span>New Group</span></div>').insertAfter(lastGroup);
		}});



	},

	events: {

		//
		'click .home-button': 'navHome',

		//
		'click .group-add': 'createCollection'
	},
	
	//
	addButton: function() {
		lastGroup = $('.group-wrap').last();
		$('<div class="group-add"><span>New Group</span></div>').insertAfter(lastGroup);
		groupInput = $('.bookmarks-group-name').last();   //??? groupInput because it's being edited :) , maybe it could be changed
		groupInput.empty().focus();   //??? groupInput because it's being edited :) , maybe it could be changed
	},

	// 
	navHome: function() {
		pageRouter.navigate('', true);
	},

	// 
	newCollection: function() {
		$('.sidebar').append(BookmarkCollectionView.template);	
	},

	// 
	createCollection: function() {
		var newGroup = new BookmarkCollection();
		data = {title: 'Group', background: '#343534'};
		newGroup.url = 'api/collections/';

		newGroup.set(data);

		globalBookmarkCollections.add(newGroup);

		newGroup.save(data, { headers: { 'Authorization': 'Token ' + token }, wait: true, success: function(){
			globalBookmarkCollections.trigger('new');
			newGroup = globalBookmarkCollections.get(newGroup.id);
			newGroup.url = 'api/collections/' + newGroup.id;
		}});

		$('.group-add').remove();

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
	className: 'group-wrap',
	model: BookmarkCollection,

	template: _.template($('#group-template').html()),

	initialize: function() {		
		
		// When the collection is loaded from the server run function to serialize the data
		this.listenTo(this.model.bookmarkCollections, 'sync', this.serializeCollection);
		this.listenTo(this.model.bookmarkCollections, 'all', this.render);

		// When the collection is loaded from the server run render()
		this.model.bookmarkCollections.bind('sync', _.bind(this.render, this));

		this.listenTo(this.model, 'destroy', this.remove);


		// Load the subollection from the server
		this.model.bookmarkCollections.fetch();

	},

	events: {
		'click .bookmarks-group-nav': 'navigateRouter',
		'keypress .bookmarks-group-name': 'updateGroup',

		'dragenter': 'dragEnterEvent',
		'dragover': 'dragOverEvent',
		'dragleave': 'dragLeaveEvent',
		'drop': 'dragDropEvent',

		'click .bookmarks-group-delete': 'clear',

		'click .toggle-palette': 'togglePalette',
		'click .bookmarks-group-color': 'changeGroupColor'
	},

	navigateRouter: function() {

		// Navigate the router based on id. In the future the url should show collection name
		pageRouter.navigate('#/collections/' + this.model.id, true);
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

	togglePalette: function() {

		var cPaletteHeight = this.$('.bookmarks-group-color-palette').css('height');
		
		if (cPaletteHeight == '50px') {
			this.$('.bookmarks-group-color-palette').css('height', '0');
		} else if (cPaletteHeight == '0px') {
			this.$('.bookmarks-group-color-palette').css('height', '50px');
		}

	},

	changeGroupColor: function(click) {

		var clickedElClass = click.target.classList[1];

		if (clickedElClass == 'palette-color-red') {
			newBgColor = '#EB4040';
		}

		if (clickedElClass == 'palette-color-green') {
			newBgColor = '#4ABB3E';
		}

		if (clickedElClass == 'palette-color-black') {
			newBgColor = '#343534';
		}

		if (clickedElClass == 'palette-color-lightblue') {
			newBgColor = '#33A3C0';
		}

		if (clickedElClass == 'palette-color-brown') {
			newBgColor = '#863825';
		}

		if (clickedElClass == 'palette-color-blue') {
			newBgColor = '#3E45BB';
		}

		if (clickedElClass == 'palette-color-orange') {
			newBgColor = '#eb6d20';
		}

		if (clickedElClass == 'palette-color-grey') {
			newBgColor = '#A3A3A3';
		}

		this.$el.css('background-color', newBgColor);
		this.model.save('background', newBgColor, { headers: { 'Authorization': 'Token ' + token } });
	},

	dragEnterEvent: function(e) {
		if (e.preventDefault) {
	    	e.preventDefault(); // Necessary. Allows us to drop.
		}
		this.$el.css('opacity','0.6');
	},

	dragOverEvent: function(e) {
		if (e.preventDefault) {
	    	e.preventDefault(); // Necessary. Allows us to drop.
		}
		return false;
	},

	dragDropEvent: function(e) {
		if (e.preventDefault) {
	    	e.preventDefault(); // Necessary. Allows us to drop.
		}
		data = JSON.parse(e.originalEvent.dataTransfer.getData('model'));

		var draggedModelCollectionID = data.collection_id;
		var draggedModel = bookmarks.get(data.id);

		var dropTarget = this.model.bookmarkCollections;
		var dropTargetID = this.model.id;

		if ( draggedModelCollectionID != null ) {

			var draggedModelCollection = globalBookmarkCollections.get(draggedModelCollectionID).bookmarkCollections;

			draggedModelCollection.remove(draggedModel);

			draggedModel.set({collection_id: dropTargetID})

			dropTarget.add(draggedModel);

			draggedModel.save({collection_id: dropTargetID}, { headers: { 'Authorization': 'Token ' + token } });
		} else {

			draggedModel.set({collection_id: dropTargetID})
		
			dropTarget.add(draggedModel);
		
			draggedModel.save({collection_id: dropTargetID}, { headers: { 'Authorization': 'Token ' + token } });
		}
		
		this.hideDragged(draggedModel);
		this.$el.css('opacity','1');
		return false;
	},

	dragLeaveEvent: function() {

		this.$el.css('opacity','1');
	},

	hideDragged: function(draggedModel) {

		draggedModel.trigger('dragHide');
	},

	saveGroup: function(newval) {
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
		this.model.destroy({ headers: { 'Authorization': 'Token ' + token } });
	},

	// The render function for the single collection.
	// It appends the template html and serialized model to the $el.
	render: function(bookmarks_collection) {
		this.$el.html(this.template(this.model.toJSON()));
		var background_color = this.model.get('background');
		this.$el.css('background-color', background_color);
		return this;
	}

});