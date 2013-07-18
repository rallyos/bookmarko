$(document).ready(function() {

	var tap = $('#form-toggle').text();

	$('#form-toggle').on('click', function() {
		
		if ($('#form-toggle').text() == 'Sign In') {
			$('.sign-up-form').css('-webkit-transform', 'translateX(-110%)');
			$('.sign-in-form').css('-webkit-transform', 'translateX(0)');
			$('#form-toggle').text('Sign Up');
		} else if ($('#form-toggle').text() == 'Sign Up') {
			$('.sign-up-form').css('-webkit-transform', 'translateX(0)');
			$('.sign-in-form').css('-webkit-transform', 'translateX(110%)');
			$('#form-toggle').text('Sign In');
		}

	});
});
