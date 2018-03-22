$(document).ready(function(){
	$('.browse select[name=_field]').on('change', function(){
		console.log($('select.choices'))
		$('select.choices').css('display', 'none').attr('disabled', true);
		$('select[name='+$(this).val()+']').css('display', 'inline').attr('disabled', false);
	});
	$('.browse select[name=_types]').css('display', 'inline').attr('disabled', false);
});
