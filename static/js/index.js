'use strict'

// Close windows on IE < 9
var continue_button = document.getElementById('continue-button')
continue_button.addEventListener('click', closeWindow)

if (navigator.appName == 'Microsoft Internet Explorer') {
	var continue_button = document.getElementById('continue-button')

	continue_button.attachEvent('onclick', closeWindow)
}

function closeWindow() {
	document.getElementById('not-supported').style.display = 'none';

}

// Store sign-up-in toggle buttons and add event handlers
var up = document.getElementById('up')
var inn = document.getElementById('in')
up.addEventListener('click', moveBlue)
inn.addEventListener('click', moveGreen)


// ********
// Show/hide forms
// ********
function moveBlue() {
	signup_form.className = 'sign-form'
	signin_form.className = 'sign-form'

}
function moveGreen() {
	signup_form.className = 'sign-form form-move'
	signin_form.className = 'sign-form form-move'
}


// Scroll to features button and event handler
var features_scroll_button = document.getElementById('features-scroll');
features_scroll_button.addEventListener('click', scrollToFeatures)
// Features block
var features_block = document.getElementsByClassName('features-wrap')[0];
// Features block offset from top
var features_blockScrollY = features_block.offsetTop - 45;


var smoothScrollTo = (function() {
	var timer, start, factor;

return function (target, duration) {

		var offset = window.pageYOffset,
		delta  = target - window.pageYOffset; 	// Y-offset difference
		duration = duration || 400;             // default 1 sec animation
		start = Date.now();                     // get start time
		factor = 0;

		if ( timer ) {
			clearInterval(timer); 				// stop any running animation
		}

		// The function that is been executed by the setInterval
		function step() {
			var y;
			factor = (Date.now() - start) / duration; // get interpolation factor

			if ( factor >= 1 ) {
				clearInterval(timer); // stop animation
				factor = 1;           // clip to max 1.0
			} 

			y = factor * delta + offset;
			window.scrollBy(0, y - window.pageYOffset);
		}

		timer = setInterval(step, 5);
		return timer; 					// return the interval timer, so you can clear it elsewhere
	  
	};
}());


// ********
// Smooth scroll to features
// ********
function scrollToFeatures() {
	smoothScrollTo(features_blockScrollY)
}


// Forms container
var form_block = document.getElementsByClassName('forms-block')[0]
// Store sign up form
var signup_form = document.getElementById('sign-up');
// Store submit buttons
var form_submit = document.getElementsByClassName('form-submit');


// ********
// Send form data and animate various elements to please the user
// ********
signup_form.onsubmit = function() {

	var csrfmiddlewaretoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
	var user = document.getElementById('reg-user').value;
	var pass = document.getElementById('reg-pass').value;
	var confirm_pass = document.getElementById('reg-confirm-pass').value;
	var loading_animation = document.getElementsByClassName('progress')[0]

	var xhr = new XMLHttpRequest()
	xhr.open('POST', 'register_user');
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	xhr.send('csrfmiddlewaretoken=' + encodeURIComponent(csrfmiddlewaretoken) +
	'&username=' + encodeURIComponent(user) +
	'&password1=' + encodeURIComponent(pass) +
	'&password2=' + encodeURIComponent(confirm_pass))

	loading_animation.style.display = 'inline-block'

	xhr.onreadystatechange = function() {
		if ( xhr.status == 200) {
			loading_animation.style.display = 'none'
			form_submit[0].value = '\u2713'
			form_submit[0].className = 'form-submit submit-animate'
			location.reload()
		} else if ( xhr.status ==  403) {
			loading_animation.style.display = 'block'
			var message = 'Your email or password is invalid'
			var form = form_submit[0];
			showError(message, signup_form, submit_button)
		}
	}

	return false;
}


// Store Sign in form 
var signin_form = document.getElementById('sign-in');

// ********
// Send form data and animate various elements to please the user
// ********
signin_form.onsubmit = function() {

	var csrfmiddlewaretoken = document.getElementsByName('csrfmiddlewaretoken')[1].value;
	var user = document.getElementById('log-user').value;
	var pass = document.getElementById('log-pass').value;
	var loading_animation = document.getElementsByClassName('progress')[1]


	var xhr = new XMLHttpRequest()
	xhr.open('GET', 'login_user?' + 'csrfmiddlewaretoken=' + encodeURIComponent(csrfmiddlewaretoken) +
	'&username=' + encodeURIComponent(user) +
	'&password=' + encodeURIComponent(pass));
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	xhr.send()
	loading_animation.style.display = 'inline-block'

	xhr.onreadystatechange = function() {
		if ( xhr.status == 200) {
			loading_animation.style.display = 'none'
			form_submit[1].value = '\u2713'
			form_submit[1].className = 'form-submit submit-animate'
			location.reload()
		} else if ( xhr.status == 404) {
			loading_animation.style.display = 'none'
			password_recover_button.style.display = 'block';
			message = 'Wrong username or password'
			var form = form_submit[1];
			showError(message, signin_form, submit_button)
		};
	}

	return false;
}


// Forgotten password form elements
var forg_pass_block = document.getElementsByClassName('forg-pass-block')[0]
var forg_pass_email = document.getElementsByClassName('forg-pass-email')[0]
var forg_pass_send = document.getElementsByClassName('forg-pass-send')[0]
// Send email Event handler 
forg_pass_send.addEventListener('click', sendPassword)

// Forgotten password button and event handler to show the form
var password_recover_button = document.getElementsByClassName('forgotten-password')[0]
password_recover_button.addEventListener('click', showForgPassBlock)


// ********
// Show forgotten password form block
// ********
function showForgPassBlock() {
	forg_pass_block.style.display = 'block';

	window.setTimeout(function(){
		forg_pass_block.style.opacity = 1;
		forg_pass_block.style.bottom = 0;
	}, 100)

}


// ********
// Show user email
// ********
function sendPassword() {
	var csrfmiddlewaretoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
	var username = forg_pass_email.value

	var xhr = new XMLHttpRequest()
	xhr.open('POST', 'forgotten_password');
	xhr.send('csrfmiddlewaretoken=' + encodeURIComponent(csrfmiddlewaretoken) + 
		'&username=' + encodeURIComponent(username) )

	xhr.onreadystatechange = function() {
		if ( xhr.status == 200) {
			document.getElementsByClassName('send-mail-success')[0].className = 'send-mail-success send-mail-success-show';

			window.setTimeout(function() {
				form_block.removeChild(forg_pass_block)
			}, 3000)
		} else {
			forg_pass_email.style.borderColor = '#DC584D'
			forg_pass_email.value = 'User ' + username + ' not found.'
		}
	}
}


// ********
// Show form errors
// ********
function showError(message, theform, form) {
	if ( document.getElementsByClassName('form-error').length != 0 ) {
		error = document.getElementsByClassName('form-error')
		theform.removeChild(error[0])
	}

	var error = document.createElement('span')
	error.className = 'form-error';
	error.textContent = message;
	var error = theform.insertBefore(error, submit_button)
}


// Store terms link and add event handler
var terms_link = document.getElementsByClassName('footer-links-item')[2]
terms_link.addEventListener('click', show_hide_terms)

// Store terms block
var terms_block = document.getElementsByClassName('terms-block')[0];

// Store html tag to listen for escape button
var html = document.getElementsByTagName('html')[0]

var close_terms_button = document.getElementById('terms-close-button');
close_terms_button.addEventListener('click', show_hide_terms)


// ********
// Show or hide terms window
// ********
function show_hide_terms() {
	var display = terms_block.style.display
	
	html.addEventListener('keyup', hideWindow)

	if ( display == 'block' ) {
		terms_block.style.display = 'none';
	} else {
		terms_block.style.display = 'block';
	}
}


// Store pribacy block
var privacy_block = document.getElementsByClassName('terms-block')[1];

// Store privacy link and add event handler
var privacy_link = document.getElementsByClassName('footer-links-item')[3]
privacy_link.addEventListener('click', show_hide_privacy)

// Store X button and add event handler
var close_privacy_button = document.getElementById('privacy-close-button');
close_privacy_button.addEventListener('click', show_hide_privacy)


// ********
// Show or hide privacy window
// ********
function show_hide_privacy() {
	var display = privacy_block.style.display

	html.addEventListener('keyup', hideWindow)

	if ( display == 'block' ) {
		privacy_block.style.display = 'none';
	} else {
		privacy_block.style.display = 'block';
	}
}


// ********
// Hide window on escape button
// ********
function hideWindow(e) {
	html.removeEventListener('keyup', hideWindow)
	if ( e.keyCode == 27 && privacy_block.style.display == 'block' ) {
		html.removeEventListener('keyup', hideWindow)
		show_hide_privacy();
	} else if ( e.keyCode == 27 && terms_block.style.display == 'block' ) {
		html.removeEventListener('keyup', hideWindow)
		show_hide_terms();
	}
}
