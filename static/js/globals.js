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
var TOKEN = getCookie('Token');
var NEW_USER = getCookie('new-user');
var CSRFTOKEN = getCookie('csrftoken');
var RECOVER = getCookie('recover');

// Used after every request to the server
// Make this a func
var TOKEN_HEADER = { headers: { 'Authorization': 'Token ' + TOKEN } };

var ENTER_KEY = 13;

// Move to view
var COLORS = ['#EB4040', '#79D55B', '#343534', '#33A3C0', '#863825', '#838AFF', '#FFAC79', '#A3A3A3']

if ( APPEARANCE == 'LI' ) {
    var $TEMPLATE = '#list-template';
    var BM_CLASS = 'bookmark list-tmpl'
} else if ( APPEARANCE == 'GR' ) {
    var $TEMPLATE = '#grid-template';
    var BM_CLASS = 'bookmark grid-tmpl'
}

const ROOT_URL = 'https://bookmarko.herokuapp.com'
// Maybe create globals object