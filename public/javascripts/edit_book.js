function setup() {
	function editParameter(elem) {
		console.log(elem);
		if (elem.value != Updater.data[elem.name]) {
			Updater.status.innerHTML = "Saving...";
			Updater.status.className = "fadeIn";
			Updater.updateParameter(elem.name.replace("+", ""), elem.value, elem.dataset.num);
		}
	}
	$('.edit').on('blur', function() {
		editParameter(this);
	});
	$('input.edit').on('keyup', function(ev) {
		if (ev.keyCode == 13) 
			editParameter(this);
	});

	/* changes height of textareas for notes and quotes */
	$('.book-single').on( 'change keyup keydown paste cut', 'textarea.edit', function (){
		$(this).height(0).height(this.scrollHeight);
	}).find( 'textarea' ).change();

	/* calls addAttributes(), removes atts container after clicking on one of the options */
	$('.atts').on('click', function(elem){
		addAttribute(elem.target.innerHTML);
	});

	/* adds attribute section -- this sucks ... */
	function addAttribute(type) {
		$('#new-attribute').show();
		if (type == "link") {
			$('.newlink').show();
		} else {
			$('.newother').show();
			$('.newother .label').text(type);
		}
		$('#save-att').on('click', function() {
			var value = "";
			if (type == "link") {
				value = $('#newlinktitle').val() + "," + $('#newlinkurl').val();
			} else {
				value = $('#newother').val();
			}
			type += "s";
			Updater.updateParameter(type, value, -1);
			$('#new-attribute').hide();
			$('.newlink').hide();
			$('.newother').hide();
		});

		$('#cancel-att').on('click', function() {
			$('#new-attribute').hide();
			$('.newlink').hide();
			$('.newother').hide();
		});
	}

	/* maybe does some stuff with references */
	var pageload = true;
	$('[name="_refNote"]').on('change keyup keydown paste cut', function() {
		if (pageload) {
			pageload = false;
		} else {
			$(this).parent().find('.refedit').attr({type:"submit"});
		}
	});

	$('#addRef').on('click', function(){
		$('.addref').toggle();
	});
}