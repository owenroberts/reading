$(document).ready(function(){
	$('select[name=_field]').on('change', function(){
		$('select.choices').css('display', 'none').attr('disabled', true);
		$('select[name='+$(this).val()+']').css('display', 'inline').attr('disabled', false);
	});
	$('select[name=_types]').css('display', 'inline').attr('disabled', false);
});
