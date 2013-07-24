$(document).ready(function() {

    var scrollTime = 400;
    var body = $('body, html');
    var featuresScroll = $('#features-scroll');
    var featuresBlock = $('.features-block');
    var signUpForm = $('#sign-up');
    var signInForm = $('#sign-in');
    var formToggle = $('#form-toggle');
	var translateL = {
		'-webkit-transform':'translateX(-110%)',
		'-ms-transform':'translateX(-110%)',
		'transform':'translateX(-110%)'
	};
	var translateNull = {
		'-webkit-transform':'translateX(0)',
		'-ms-transform':'translateX(0)',
		'transform':'translateX(0)'
	};
	var translateR = {
		'-webkit-transform':'translateX(110%)',
		'-ms-transform':'translateX(110%)',
		'transform':'translateX(110%)'
	};

	formToggle.on('click', function() {

			if ( formToggle.text() == 'Sign In' ) {

				if ( window.scrollY > 300 ) {
					body.animate({scrollTop: 0}, scrollTime)
				}

				signUpForm.css( translateL );
				signInForm.css( translateNull );

				formToggle.text('Sign Up');
			} else if (formToggle.text() == 'Sign Up') {

				if ( window.scrollY > 300 ) {
					body.animate({scrollTop: 0}, scrollTime)
				}

				signUpForm.css( translateNull );
				signInForm.css( translateR );

				formToggle.text('Sign In');
			}
			
	});



    featuresScroll.on("click", function() {
        body.animate({scrollTop: featuresBlock.offset().top - 40}, scrollTime)
    });

});
