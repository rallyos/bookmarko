//'use strict'
// when creating groups the app sends two requests - check this.
var SidebarView = Backbone.View.extend({
	el: '.sidebar',

	initialize: function () {
		this.listenTo(globalBookmarkCollections, 'add', this.addNew);
		this.listenTo(globalBookmarkCollections, 'reset', this.addAll);

		this.$groupsWrap = this.$('.groups-wrap');

	    	if (order_collections == 'NA') {
	    		$('.settings-form-option:nth-child(1)').attr('selected', 'selected')
	    		globalBookmarkCollections.order_by_title();
	    	} else if (order_collections == 'DA') {
	    		$('.settings-form-option:nth-child(2)').attr('selected', 'selected')
	            globalBookmarkCollections.order_by_date();
	    	} else if (order_collections == 'SI') {
	    		$('.settings-form-option:nth-child(3)').attr('selected', 'selected')
	            globalBookmarkCollections.order_by_size();
	    	}

	    globalBookmarkCollections.trigger('reset');
	},

	events: {
		'click .group-add': 'createGroup'
	},
	
	createGroup: function() {
		var group = new BookmarkCollection({
			title: ' ',
			background: COLORS[Math.floor(Math.random() * 7)]
		});

		globalBookmarkCollections.add(group)
		group.trigger('scale');
		this.$('.bookmarks-group-name').attr('contenteditable', 'true').focus();
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
		this.listenTo(this.model, 'colorChanged', this.changeColor)

		this.listenTo(this.model, 'update', this.updateTitle)

		this.listenTo(this.model.bookmarkCollections, 'all', this.render);

	},

	events: {
		'keypress .bookmarks-group-name': 'createOnEnter',

		'click .bookmarks-group-count': 'navigateToGroup',
		'dragenter': 'dragEnterEvent',
		'dragover': 'dragOverEvent',
		'dragleave': 'dragLeaveEvent',
		'drop': 'dragDropEvent',
	},

	animateGroup: function() {
		var groupEl = $(this.el)
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
		var data = JSON.parse(e.originalEvent.dataTransfer.getData('model'));

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
			draggedModel.save({collection_id: dropTargetID}, TOKEN_HEADER);
		// The easy scenario - The bookmark that's being dragged don't have collection yet	
		} else {
			// Set the new collection id, add the bookmark to it, and then save to server.
			draggedModel.set({collection_id: dropTargetID})
			dropTarget.add(draggedModel);
			draggedModel.save({collection_id: dropTargetID}, TOKEN_HEADER);
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
		pageRouter.navigate('/collections/' + this.model.attributes.title.toLowerCase(), true);
	},

	changeColor: function(newBgColor) {
		this.$('.bookmarks-group-count').css('background-color', newBgColor);
	},

	createOnEnter: function(e) {
		if (e.which === ENTER_KEY) {
			var newval = this.$('.bookmarks-group-name').text();
			this.model.set({title: newval})

			this.$('.bookmarks-group-name').attr('contenteditable', 'false')

			if ( this.model.hasChanged('title') ) {
				this.model.trigger('update')
				this.saveGroup(newval)
			}

			return false;
		}
	},

	updateTitle: function() {
		this.$('.bookmarks-group-name').text(this.model.attributes.title)
	},

	saveGroup: function(newval) {
		this.model.save({ 'title': newval}, TOKEN_HEADER);
	},

	render: function(bookmarks_collection) {
		this.$el.html(this.template(this.model.toJSON()));
		this.$('.bookmarks-group-count').css('background-color', this.model.get('background'));
		return this;
	}

});