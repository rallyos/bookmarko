// Sidebar View
var SidebarView = Backbone.View.extend({
	el: '.sidebar',

	initialize: function () {
		
		// On 'add' event in 'bookmarks' collection run addBookmark() function.
		this.listenTo(globalBookmarkCollections, 'add', this.loadBookmarkCollection);
		this.listenTo(globalBookmarkCollections, 'new', this.addButton);

		// Load all bookmark collections from the server
		globalBookmarkCollections.fetch({ success: function() {
			lastGroup = $('.group-wrap').last();
			$('<div class="group-add"><span>New Group</span></div>').insertAfter(lastGroup);
		}});

	},

	events: {
		'click .home-button': 'navHome',
		'click .group-add': 'createCollection'
	},
	
	addButton: function() {
		lastGroup = $('.group-wrap').last();
		$('<div class="group-add"><span>New Group</span></div>').insertAfter(lastGroup);
		console.log('working and shit')
	},

	navHome: function() {
		pageRouter.navigate('', true);
	},

	newCollection: function() {
		$('.sidebar').append(BookmarkCollectionView.template);	
	},

	createCollection: function() {
		var wtf = new BookmarkCollection();
		data = {collection_name: 'izvinisebe', collection_background: '#343534'}
		wtf.url = 'api/collections/';

		wtf.save(data, { headers: { 'Authorization': 'Token ' + token } });
		
		$('.group-add').remove();
		
		globalBookmarkCollections.fetch({reset: true, success: function() {
			globalBookmarkCollections.trigger('new');
		}});
		globalBookmarkCollections.add(wtf);
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

	template: _.template($('#collection-template').html()),

	initialize: function() {		
		
		// When the collection is loaded from the server run function to serialize the data
		this.listenTo(this.model.bookmarkCollections, 'sync', this.serializeCollection);
		this.listenTo(this.model.bookmarkCollections, 'all', this.render);

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

		'click .bookmarks-group-delete': 'clear',

		'click .toggle-palette': 'togglePalette',
		'click .bookmarks-group-color': 'changeGroupColor'
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

	togglePalette: function() {
		var cPaletteHeight = this.$('.bookmarks-group-color-palette').css('height');
		

		//this.$('.bookmarks-group-color-palette').toggle();
		if (cPaletteHeight == '50px') {
			this.$('.bookmarks-group-color-palette').css('height', '0');
		} else if (cPaletteHeight == '0px') {
			this.$('.bookmarks-group-color-palette').css('height', '50px');
		}

		//this.$('.bookmarks-group-color-palette').toggle(function() {
		//	$(this).css('height', '50px');
		//});
	},

	changeGroupColor: function(click) {

		if (click.target.classList[1] == 'palette-color-red') {
			newBgColor = '#EB4040';
		}

		if (click.target.classList[1] == 'palette-color-green') {
			newBgColor = '#4ABB3E';
		}

		if (click.target.classList[1] == 'palette-color-black') {
			newBgColor = '#343534';
		}

		if (click.target.classList[1] == 'palette-color-lightblue') {
			newBgColor = '#33A3C0';
		}

		if (click.target.classList[1] == 'palette-color-brown') {
			newBgColor = '#863825';
		}

		if (click.target.classList[1] == 'palette-color-blue') {
			newBgColor = '#2D5086';
		}

		if (click.target.classList[1] == 'palette-color-orange') {
			newBgColor = '#eb6d20';
		}

		if (click.target.classList[1] == 'palette-color-grey') {
			newBgColor = '#A3A3A3';
		}

		this.$('.group').css('background-color', newBgColor);
		this.model.save('collection_background', newBgColor, { headers: { 'Authorization': 'Token ' + token } });
	},

	dragEnterEvent: function(e) {
		this.$el.css('opacity','0.6');

		console.log(this.model.id);
	},

	dragOverEvent: function(e) {
		if (e.preventDefault) {
	    	e.preventDefault(); // Necessary. Allows us to drop.
		}

		return false;
	},

	dragDropEvent: function(e) {

		data = JSON.parse(e.originalEvent.dataTransfer.getData('model'));
		data.collection_id = this.model.id;

		console.log(data);
		
		this.model.bookmarkCollections.fetch({reset: true})
		this.model.bookmarkCollections.render;

		this.testvame(data);
		return false;
	},

	testvame: function(data) {
		console.log(data)

		var xhr = new XMLHttpRequest();
		xhr.open('PUT', 'http://markedbyme.appspot.com/api/' + data.id, true);
		xhr.setRequestHeader('Content-Type','application/json');
		xhr.setRequestHeader('Authorization','Token ' + token);
		var req = {'bookmark_title': data.bookmark_title, 'bookmark_url': data.bookmark_url, 'collection_id': data.collection_id}; //don't forget to get user_id
		xhr.send(JSON.stringify(req));

		testHide = bookmarks.get(data.id);
		//console.log(testHide)

		testHide.trigger('hidd')
	},

	hideThisShit: function(testHide) {
		console.log(testHide)
		console.log(testHide.$el)
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
		this.$('.group').css('background', background_color);
		return this;
	}

});