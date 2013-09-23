proba = '	<span class="select-bookmark grd-select-bookmark"></span>
		<a class="grd-bookmark-link" href="<%= url %>" target="_blank">
		<% if ( image ) {%>
			<img class="grd-bookmark-image" src="<%= image %>">
		<% } else {%>
			<h2 class="grd-bookmark-title-big"><%= title %></h2>
			<p class="grd-bookmark-descr"><%= description %></p>
		<% } %>
		</a>
		<div class="grd-bookmark-content
		 <% if ( image ) {%> 
			grd-bookmark-content-w-title
			<%} else {%>
			grd-bookmark-content-wo-title
			<%}%> "
		>
			<% if ( image ) {%>
			<span class="bookmark-title grd-bookmark-title" title="<%= title %>"><%= title %></span>
			<% } %>
			<div class="grd-bookmark-settings">
				<div class="bookmark-menu-wrap grd-bookmark-menu-wrap">
					<div class="bookmark-menu-line grd-bookmark-menu-line"></div>
					<div class="bookmark-menu-line grd-bookmark-menu-line"></div>
					<div class="bookmark-menu-line grd-bookmark-menu-line"></div>
				</div>
				<div class="bookmark-menu grd-bookmark-menu">
					<ul class="bookmark-menu-list">
						<li class="bookmark-menu-list-item edit-title">Rename Title</li>
						<li class="bookmark-menu-list-item copy-link">Copy Link</li>
					</ul>
				</div>
				<span class="bookmark-star grd-bookmark-star <%= starred ? 'bookmark-starred' : '' %>"></span>
				<span class="bookmark-delete grd-bookmark-delete"></span>
			</div>
		</div>
'