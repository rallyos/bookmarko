// Sidebar View
var SidebarView = Backbone.View.extend({
	el: '.sidebar',

	initialize: function () {
		$newGroupButton = $('<div class="group-add"><span>New Group</span></div>');

		this.listenTo(globalBookmarkCollections, 'add', this.loadBookmarkCollection);
		this.listenTo(globalBookmarkCollections, 'new', this.addButton);

		globalBookmarkCollections.fetch({ success: function() {
			this.$groupWrap = this.$('.group-wrap');

			// Check if there are any groups. If not, the 'new group' button must be appended.
			if ( this.$groupWrap.length == 0 ) {
				$newGroupButton.appendTo(this.$el); 
			}

			// After loading groups from the server insert the 'new group' button
			lastGroup = this.$groupWrap.last();
			$newGroupButton.insertAfter(lastGroup);
		}});


	},

	events: {
		'click .home-button': 'navHome',
		'click .group-add': 'createGroup'
	},
	
	// Get the last group, and append a 'new group' button after it.
	addButton: function() {
		lastGroup = $('.group-wrap').last();
		$newGroupButton.insertAfter(lastGroup);
	},

	// Create new group.
	// Due to bug when saving new BookmarkCollection object, it's attributes are set manually.
	createGroup: function() {
		var newGroup = new BookmarkCollection();
		data = {title: ' ', background: '#EB4040'};
		newGroup.url = 'api/collections/';
		newGroup.set(data);
		globalBookmarkCollections.add(newGroup);
		newGroup.trigger('scale');
		newGroup.save(data, { headers: { 'Authorization': 'Token ' + token }, success: function(){
			globalBookmarkCollections.trigger('new');
			newGroup.url = 'api/collections/' + newGroup.id;
			this.$('.bookmarks-group-name').focus();
			newGroup.trigger('scale');
		}});

		$('.group-add').remove();
	},

	// Back to home
	navHome: function() {
		pageRouter.navigate('', true);
	},

	loadBookmarkCollection: function(bookmarks_collection) {
		var newBookmarkCollectionView = new BookmarkCollectionView({model: bookmarks_collection});
		$(this.$el).append(newBookmarkCollectionView.el);
	}
});

var sidebar = new SidebarView();


var BookmarkCollectionView = Backbone.View.extend({
	tagName: 'div',
	className: 'group-wrap',
	model: BookmarkCollection,

	template: _.template($('#group-template').html()),

	initialize: function() {		
		
		// if you see bugs check the previous version of the constructor 
		// bitbucket.org/dmralev/bookmarko/commits/72867507d8194528a3fd269ac7eff5bd601122e9#Lstatic/js/views/SidebarView.jsF89
		// Listen for add and remove. Render if bookmark is added or removed from collection
		// If the listener is for 'all' events, the collection renders at least 2 times, which is not good 
		this.listenTo(this.model.bookmarkCollections, 'all', this.render);

		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'scale', this.animateGroup);

		this.model.bookmarkCollections.fetch();
	},

	events: {
		'click .bookmarks-group-nav': 'navigateToGroup',
		'keypress .bookmarks-group-name': 'updateGroup',

		'dragenter': 'dragEnterEvent',
		'dragover': 'dragOverEvent',
		'dragleave': 'dragLeaveEvent',
		'drop': 'dragDropEvent',

		'click .bookmarks-group-delete': 'clear',
		'click .toggle-palette': 'togglePalette',
		'click .bookmarks-group-color': 'changeGroupColor'
	},

	animateGroup: function() {
		$(this.el).toggleClass('scale')
	},

	dragEnterEvent: function(e) {
		this.$el.addClass('dragover');
	},

	dragOverEvent: function(e) {
		return false;
	},

	dragDropEvent: function(e) {
		if (e.preventDefault) { e.preventDefault(); }

		// Convert data back to JSON
		data = JSON.parse(e.originalEvent.dataTransfer.getData('model'));

		// Store the collection id of the model that's being dragged
		var draggedModelCollectionID = data.collection_id;
		// Select the moved bookmark by using the the id from parsed data
		var draggedModel = bookmarks.get(data.id);

		// Store the targeted collection
		var dropTarget = this.model.bookmarkCollections;
		// And the id of the targeted collection
		var dropTargetID = this.model.id;

		// Check if the bookmark already has collection, and if it does we remove it from the old one.
		// And we add it to the collection that's being dragged
		if ( draggedModelCollectionID != null ) {
			// Select the current collection the dragged bookmark
			var draggedModelCollection = globalBookmarkCollections.get(draggedModelCollectionID).bookmarkCollections;
			// Remove the the bookmark from the old collection
			draggedModelCollection.remove(draggedModel);
			// Set the new collection id for the dragged bookmark
			draggedModel.set({collection_id: dropTargetID})
			// And then add the bookmark to it
			dropTarget.add(draggedModel);
			// Save the bookmark's new collection id to the server
			draggedModel.save({collection_id: dropTargetID}, tokenHeader);
		// The easy scenario - The bookmark that's being dragged don't have collection yet	
		} else {
			// Set the new collection id, add the bookmark to it, and then save to server.
			draggedModel.set({collection_id: dropTargetID})
			dropTarget.add(draggedModel);
			draggedModel.save({collection_id: dropTargetID}, tokenHeader);
		}

		// When the drag and drop is over, hide the moved bookmark
		draggedModel.trigger('dragHide');
		this.$el.removeClass('dragover');
		return false;
	},

	dragLeaveEvent: function() {
		this.$el.removeClass('dragover');
	},

	navigateToGroup: function() {
		pageRouter.navigate('/collections/' + this.model.id, true);
	},

	togglePalette: function() {
		this.$('.bookmarks-group-color-palette').toggleClass('drawer-open');
	},

	changeGroupColor: function(click) {

		var clickedElClass = click.target.classList[1];

		// Since the colors in DOM are rgb we have to use alternative way of getting and setting the new color.
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
		this.model.save('background', newBgColor, tokenHeader);
	},

	updateGroup: function(e) {
		if (e.which === ENTER_KEY) {
			this.$('.bookmarks-group-name').blur();
			var newval = this.$('.bookmarks-group-name').text();
			this.saveGroup(newval);
		
			return false;
		}
	},

	saveGroup: function(newval) {
		this.model.save({ 'title': newval}, tokenHeader);
	},

	clear: function () {
		this.$el.css({
			right: '100%',
		}, this.$el.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', this.destrooy())
		)

	},

	destrooy: function() {
		this.model.destroy(tokenHeader);
	},

	render: function(bookmarks_collection) {
		this.$el.html(this.template(this.model.toJSON()));
		var background_color = this.model.get('background');
		this.$el.css('background-color', background_color);
		return this;
	}

});