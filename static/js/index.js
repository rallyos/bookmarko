$(document).ready(function() {

    var scrollTime = 400;
    var body = $('body, html');
    var featuresScroll = $('#features-scroll');
    var featuresBlock = $('.features-block');
    var signUpForm = $('#sign-up');
    var signInForm = $('#sign-in');
    var formToggle = $('#form-toggle');

	formToggle.on('click', function() {

			if ( formToggle.text() == 'Sign In' ) {

				if ( window.scrollY > 300 ) {
					body.animate({scrollTop: 0}, scrollTime)
				}

				signUpForm.toggleClass('form-hide-left');
				signInForm.toggleClass('form-hide-right');

				formToggle.text('Sign Up');
			} else if (formToggle.text() == 'Sign Up') {

				if ( window.scrollY > 300 ) {
					body.animate({scrollTop: 0}, scrollTime)
				}

				signUpForm.toggleClass('form-hide-left')
				signInForm.toggleClass('form-hide-right');

				formToggle.text('Sign In');
			}
			
	});



    featuresScroll.on("click", function() {
        body.animate({scrollTop: featuresBlock.offset().top - 40}, scrollTime)
    });

});
