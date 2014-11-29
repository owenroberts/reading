$(document).ready( function() {
	function openTypeDiv(e) {
		$(e.target).hide();
		$('').show();		
	}
	$('.addtype').on('click', openTypeDiv);
});