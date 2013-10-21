var SidebarView = Backbone.View.extend({
	el: '.sidebar',

	initialize: function () {

		this.listenTo(globalBookmarkCollections, 'add', this.addNew);
		this.listenTo(globalBookmarkCollections, 'reset', this.addAll);

		this.$groupsWrap = this.$('.groups-wrap');

		colors = ['#EB4040', '#79D55B', '#343534', '#33A3C0', '#863825', '#838AFF', '#FFAC79', '#A3A3A3']
	},

	events: {
		'click .group-add': 'createGroup'
	},
	
	// Create new group.
	createGroup: function() {
		var group = new BookmarkCollection({
			title: ' ',
			background: colors[Math.floor(Math.random() * 7)]
		});
		globalBookmarkCollections.add(group)
		group.trigger('scale');
		this.$('.bookmarks-group-name').focus();
	},

	addNew: function(bookmarks_collection) {
		var newBookmarkCollectionView = new BookmarkCollectionView({model: bookmarks_collection});
		this.$groupsWrap.append(newBookmarkCollectionView.render().el);
	},

	addAll: function() {
		this.$('.groups-wrap').html('');
		globalBookmarkCollections.each(this.addNew, this);
	}
});

var sidebar = new SidebarView();


var BookmarkCollectionView = Backbone.View.extend({
	tagName: 'div',
	className: 'group-box',
	model: BookmarkCollection,

	template: _.template($('#group-template').html()),

	initialize: function() {				
		this.listenTo(this.model, 'destroy', this.remove);
		this.listenTo(this.model, 'scale', this.animateGroup);

		this.listenTo(this.model.bookmarkCollections, 'all', this.render);

	},

	events: {
		'click .bookmarks-group-count': 'navigateToGroup',
		'focus .bookmarks-group-name': 'nameFocus',
		'keypress .bookmarks-group-name': 'onEnter',
		'blur .bookmarks-group-name': 'updateTitle',

		'dragenter': 'dragEnterEvent',
		'dragover': 'dragOverEvent',
		'dragleave': 'dragLeaveEvent',
		'drop': 'dragDropEvent',

		'click .bookmarks-group-delete': 'clear',
		'click .toggle-palette': 'togglePalette',
		'click .bookmarks-group-color': 'changeGroupColor'
	},

	animateGroup: function() {
		groupEl = $(this.el)
		$(groupEl).toggleClass('scale')

		// For now timeout is needed to kick the animation (toggling the transform class)
		setTimeout(function() {
			groupEl.toggleClass('scale')
		}, 10);
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
		var n = click.target.getAttribute('data-n');
		// Since the colors in DOM are rgb we have to use alternative way of getting and setting the new color.
		newBgColor = colors[n]

		this.$('.bookmarks-group-count').css('background-color', newBgColor);
		this.model.save('background', newBgColor, tokenHeader);
	},

	nameFocus: function() {
		titleField = this.$('.bookmarks-group-name');
	},

	onEnter: function(e) {
		if (e.which === ENTER_KEY) {
			titleField.blur()
			return false;
		}
	},

	updateTitle: function() {
		newval = titleField.text()
		this.model.set({title: newval})

		if ( this.model.hasChanged('title') ) {
			this.saveGroup(newval)
		}
	},

	saveGroup: function(newval) {
		this.model.save({ 'title': newval}, tokenHeader);
	},

	clear: function () {
		model = this.model;
		this.$el.css({ right: '100%' })
		
		this.$el.one('transitionend', function() {
			model.destroy(tokenHeader);
		})
	},

	render: function(bookmarks_collection) {
		this.$el.html(this.template(this.model.toJSON()));
		var background_color = this.model.get('background');
		this.$('.bookmarks-group-count').css('background-color', background_color);
		return this;
	}

});