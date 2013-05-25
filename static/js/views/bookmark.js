var BookmarkView = Backbone.View.extend({
	tagName: 'li',
	className: 'bookmarks-item',

	template: _.template($('#bookmark-template').html()),
	events: {
		'click .bookmarks-item-delete': 'clear',
		'keypress .bookmarks-item-title': 'updateBookmark'
	},

	initialize: function() {
		this.listenTo(this.model, 'destroy', this.remove);
	},

	render: function(bookmark) {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	},

	updateBookmark: function(e) {
	if (e.which === ENTER_KEY) {
		this.$('.bookmarks-item-title').blur();
		var newval = this.$('.bookmarks-item-title').text();
		this.close(newval);
		return false;
		}
	},

	close: function(newval) {
		this.model.save({ 'bookmark_title': newval });
	},

	clear: function () {
		this.model.destroy();
	}
});