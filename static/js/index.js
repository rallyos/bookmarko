
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
//
var formSubmit = document.getElementsByClassName('form-submit');

//
var featuresBlock = document.getElementsByClassName('features-block')[0];
var FeaturesBlockHeight = featuresBlock.scrollHeight - 45;

var continueButton = document.getElementById('continue-button')

// Add events
formToggle.addEventListener('click', checkThis)
featuresScroll.addEventListener('click', scrollPage)
continueButton.addEventListener('click', closeWindow)

var smoothScrollTo = (function () {
	var timer, start, factor;

	return function (target, duration) {
		var offset = window.pageYOffset,
		delta  = target - window.pageYOffset; // Y-offset difference
		duration = duration || 400;              // default 1 sec animation
		start = Date.now();                       // get start time
		factor = 0;

		if( timer ) {
			clearInterval(timer); // stop any running animation
		}

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

		timer = setInterval(step, 10);
		return timer; // return the interval timer, so you can clear it elsewhere
	  
	  };
}());

// Test function name, change it
function checkThis() {

		if ( formToggle.innerText == 'Sign In' ) {
		
			if ( window.scrollY > 300 ) {
				smoothScrollTo(0);
			}

			// Scroll to top
			formToggle.innerText = 'Sign Up';
			toggleClasses();
		} else if ( formToggle.innerText == 'Sign Up' ) {
			
			if ( window.scrollY > 300 ) {
				smoothScrollTo(0);
			}

			formToggle.innerText = 'Sign In';
			toggleClasses();
		}

}

function scrollPage() {
	smoothScrollTo(FeaturesBlockHeight)
}

function toggleClasses() {

	//IE. . .
	// if ( navigator.appName == 'Microsoft Internet Explorer' ) {
		// if ( signUpForm )
	// }

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
	xhr.open('POST', 'http://markedbyme.appspot.com/register_user', false);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	xhr.send('csrfmiddlewaretoken=' + encodeURIComponent(csrfmiddlewaretoken) +
	'&username=' + encodeURIComponent(user) +
	'&password1=' + encodeURIComponent(pass) +
	'&password2=' + encodeURIComponent(confirmPass))

	if ( xhr.status == 200) {
		location.reload()
	} else if ( xhr.status ==  403) {
		formBlock.style.height = '280px'
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
	xhr.open('GET', 'http://markedbyme.appspot.com/login_user?' + 'csrfmiddlewaretoken=' + encodeURIComponent(csrfmiddlewaretoken) +
	'&username=' + encodeURIComponent(user) +
	'&password=' + encodeURIComponent(pass), false);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	xhr.send()

	if ( xhr.status == 200) {
		formSubmit[1].style.backgroundColor = '#46DD70';
		location.reload()
	} else if ( xhr.status == 404) {
		formBlock.style.height = '280px'
		formSubmit[1].style.margin = '10px auto 0';
		passwordRecover = document.getElementsByClassName('forgotten-password')[0]
		passwordRecover.style.display = 'block';
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
	error.innerText = message;
	var error = theform.insertBefore(error, form)
}

function closeWindow() {
	document.getElementById('not-supported').style.display = 'none';
}
