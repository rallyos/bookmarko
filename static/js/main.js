var ENTER_KEY = 13;

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
var user_template = getCookie('template');

// Used after every request to the server
var tokenHeader = { headers: { 'Authorization': 'Token ' + token } };

if ( user_template == 'list' ) {
    rightTemplate = '#list-template';
} else if ( user_template == 'grid' ) {
    rightTemplate = '#grid-template';
}
