$(document).ready( function() {
	function openTypeDiv(e) {
		$(e.target).hide();
		$('.selecttype').remove();
		var newTypeDiv = $('<input>')
			.addClass('newtype underlined')
			.attr({
				name:"type",
				placeholder: "New Type"
			});
		var newTypeAlert = $('<input>')
			.attr({
				name:"newtype",
				type:"hidden"
			});
		$('.type').append(newTypeDiv)
			.append(newTypeAlert);
	}
	$('.addtype').on('click', openTypeDiv);
	$('.newtype').hide();
});