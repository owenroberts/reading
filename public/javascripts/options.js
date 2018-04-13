$(document).ready(function(){
	$('.browse select[name=field]').on('change', function(){
		$('select.choices').css('display', 'none').attr('disabled', true);
		$('select[name='+$(this).val()+']').css('display', 'inline').attr('disabled', false);
	});
	$('.browse select[name=types]').css('display', 'inline').attr('disabled', false);
});
