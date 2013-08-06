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
// Used after every request to the server
var tokenHeader = { headers: { 'Authorization': 'Token ' + token } };

var dragIcon = new Image();
dragIcon.src = '//markedbyme.appspot.com/static/images/dragimg.png';
dragIcon.width = 50;