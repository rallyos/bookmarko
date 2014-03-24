var ENTER_KEY = 13;
'use strict'
function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var token = getCookie('Token');
var new_user = getCookie('new-user');
var csrftoken = getCookie('csrftoken');
var recover = getCookie('recover');

// Used after every request to the server
var tokenHeader = { headers: { 'Authorization': 'Token ' + token } };
    
    // Move to view
    var colors = ['#EB4040', '#79D55B', '#343534', '#33A3C0', '#863825', '#838AFF', '#FFAC79', '#A3A3A3']

if ( appearance == 'LI' ) {
    var Template = '#list-template';
    var cls = 'bookmark list-tmpl'
} else if ( appearance == 'GR' ) {
    var Template = '#grid-template';
    var cls = 'bookmark grid-tmpl'
}
