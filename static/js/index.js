
if (navigator.appName == 'Microsoft Internet Explorer') {
	var continueButton = document.getElementById('continue-button')

	continueButton.attachEvent('onclick', closeWindow)
}

// Store elements
var formToggle = document.getElementById('form-toggle');
var featuresScroll = document.getElementById('features-scroll');
var signUpForm = document.getElementById('sign-up');
var signInForm = document.getElementById('sign-in');
var formBlock = document.getElementsByClassName('sign-up-block')[0]
var termsLink = document.getElementsByClassName('footer-links-item')[2]
var privacyLink = document.getElementsByClassName('footer-links-item')[3]

var termsLinkForm = document.getElementsByClassName('undrl')[0]
var privacyLinkForm = document.getElementsByClassName('undrl')[1]
html = document.getElementsByTagName('html')[0]

var termsBlock = document.getElementsByClassName('terms-block')[0];
var closeTermsButton = document.getElementById('terms-close-button');
var privacyBlock = document.getElementsByClassName('terms-block')[1];
var closePrivacyButton = document.getElementById('privacy-close-button');

//
var formSubmit = document.getElementsByClassName('form-submit');

//
var featuresBlock = document.getElementsByClassName('features-wrap')[0];
var featuresBlock = featuresBlock.offsetTop - 65;

var continueButton = document.getElementById('continue-button')

passwordRecoverButton = document.getElementsByClassName('forgotten-password')[0]
forgPassBlock = document.getElementsByClassName('forg-pass-block')[0]
forgPassEmail = document.getElementsByClassName('forg-pass-email')[0]
forgPassSend = document.getElementsByClassName('forg-pass-send')[0]

// Add events
formToggle.addEventListener('click', checkThis)
featuresScroll.addEventListener('click', scrollPage)
continueButton.addEventListener('click', closeWindow)
termsLink.addEventListener('click', showTerms)
closeTermsButton.addEventListener('click', showTerms)
termsLinkForm.addEventListener('click', showTerms)

privacyLink.addEventListener('click', showPrivacy)
closePrivacyButton.addEventListener('click', showPrivacy)
privacyLinkForm.addEventListener('click', showPrivacy)

passwordRecoverButton.addEventListener('click', showForgPassBlock)
forgPassSend.addEventListener('click', sendPassword)

function showForgPassBlock() {
	forgPassBlock.style.display = 'block';
	window.setTimeout(function(){
		forgPassBlock.style.opacity = 1.0;
		forgPassBlock.style.bottom = 0;
	}, 100)
}

function sendPassword() {
	//test
	csrfmiddlewaretoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
	username = forgPassEmail.value

	var xhr = new XMLHttpRequest()
	xhr.open('POST', 'forgotten_password', false);
	xhr.send('csrfmiddlewaretoken=' + encodeURIComponent(csrfmiddlewaretoken) + 
		'&username=' + encodeURIComponent(username) )

	if ( xhr.status == 200) {
		document.getElementsByClassName('send-mail-success')[0].className = 'send-mail-success send-mail-success-show';

		window.setTimeout(function() {
			formBlock.removeChild(forgPassBlock)
		}, 3000)
	} else {
		forgPassEmail.style.borderColor = '#DC584D'
		forgPassEmail.value = 'User ' + username + ' not found.'
	}
}

function hideWindow(e) {
	html.removeEventListener('keyup', hideWindow)
	if ( e.keyCode == 27 && privacyBlock.style.display == 'block' ) {
		html.removeEventListener('keyup', hideWindow)
		showPrivacy();
	} else if ( e.keyCode == 27 && termsBlock.style.display == 'block' ) {
		html.removeEventListener('keyup', hideWindow)
		showTerms();
	}
}

function showTerms() {
	display = termsBlock.style.display
	
	html.addEventListener('keyup', hideWindow)

	if ( display == 'block' ) {
		termsBlock.style.display = 'none';
	} else {
		termsBlock.style.display = 'block';
	}
}

function showPrivacy() {
	display = privacyBlock.style.display

	html.addEventListener('keyup', hideWindow)

	if ( display == 'block' ) {
		privacyBlock.style.display = 'none';
	} else {
		privacyBlock.style.display = 'block';
	}
}

var smoothScrollTo = ( function () {
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

// Test function name, change it
function checkThis() {

		if ( formToggle.textContent == 'Sign In' ) {
		
			if ( window.scrollY > 300 ) {
				smoothScrollTo(0);
			}

			// Scroll to top
			formToggle.textContent = 'Sign Up';
			toggleClasses();
		} else if ( formToggle.textContent == 'Sign Up' ) {
			
			if ( window.scrollY > 300 ) {
				smoothScrollTo(0);
			}

			formToggle.textContent = 'Sign In';
			toggleClasses();
		}

}

function scrollPage() {
	smoothScrollTo(featuresBlock)
}

function toggleClasses() {

	if ( signUpForm.className == 'sign-form' ) {
		signUpForm.className = signUpForm.className + ' form-hide-left';
		signInForm.className = 'sign-form';
	} else if ( signInForm.className == 'sign-form' ) {
		signInForm.className = signInForm.className + ' form-hide-right';
		signUpForm.className = 'sign-form';
	}

}

signUpForm.onsubmit = function() {

	// Store the elements
	csrfmiddlewaretoken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
	user = document.getElementById('reg-user').value;
	pass = document.getElementById('reg-pass').value;
	confirmPass = document.getElementById('reg-confirm-pass').value;

	var xhr = new XMLHttpRequest()
	xhr.open('POST', 'register_user', false);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	xhr.send('csrfmiddlewaretoken=' + encodeURIComponent(csrfmiddlewaretoken) +
	'&username=' + encodeURIComponent(user) +
	'&password1=' + encodeURIComponent(pass) +
	'&password2=' + encodeURIComponent(confirmPass))

	if ( xhr.status == 200) {
		location.reload()
	} else if ( xhr.status ==  403) {
		var message = 'Your email or password is invalid'
		var form = formSubmit[0];
		showError(message, signUpForm, form)
	}

	return false;
}

signInForm.onsubmit = function() {

	csrfmiddlewaretoken = document.getElementsByName('csrfmiddlewaretoken')[1].value;
	user = document.getElementById('log-user').value;
	pass = document.getElementById('log-pass').value;

	var xhr = new XMLHttpRequest()
	xhr.open('GET', 'login_user?' + 'csrfmiddlewaretoken=' + encodeURIComponent(csrfmiddlewaretoken) +
	'&username=' + encodeURIComponent(user) +
	'&password=' + encodeURIComponent(pass), false);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	xhr.send()

	if ( xhr.status == 200) {
		formSubmit[1].style.backgroundColor = '#46DD70';
		location.reload()
	} else if ( xhr.status == 404) {
		passwordRecoverButton.style.display = 'block';
		message = 'Wrong username or password'
		var form = formSubmit[1];
		showError(message, signInForm, form)
	};

	return false;
}

function showError(message, theform, form) {
	if ( document.getElementsByClassName('form-error').length != 0 ) {
		error = document.getElementsByClassName('form-error')
		theform.removeChild(error[0])
	}

	var error = document.createElement('span')
	error.className = 'form-error';
	error.textContent = message;
	var error = theform.insertBefore(error, form)
}

function closeWindow() {
	document.getElementById('not-supported').style.display = 'none';

}
