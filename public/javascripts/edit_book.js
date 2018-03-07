function setup() {

	function editParameter(elem) {

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
		if (ev.keyCode == 13) editParameter(this);
	});

	/* hidden stuff */
	function hiddenToggle(elem) {
		var state = $(elem).text();
		if (state[0] == "-") {
			hideText(elem);
		} else {
			showText(elem);
		}
	}

	function hideText(elem) {
		var d = $(elem).parent();
		d.height(26);
		d.innerWidth('30%');
		$(elem).text('+');
		var text = $(elem).parent().find( 'textarea' );
		text.css({resize:"none", width:"100%"});
	}
	function showText(elem) {
		var d = $(elem).parent();
		d.height(d[0].scrollHeight);
		d.innerWidth('100%');
		$(elem).text('-');
		var text = $(elem).parent().find( 'textarea' );
		text.css({resize:"auto", width:"75%", maxWidth: "100%", maxHeight: "100%"});
	}

	$('body').on('click', '.hidecontents span', function() { 
		hiddenToggle(this); 
	});

	/* changes height of textareas for notes and quotes */
	$('.book-single').on( 'change keyup keydown paste cut', 'textarea.edit', function (){
		$(this).height(0).height(this.scrollHeight);
	}).find( 'textarea' ).change();

	$('.book-single').on( 'change keyup keydown paste cut', 'textarea.edit', function (){
		this.parentNode.parentNode.style.height = "0px";
		this.parentNode.parentNode.style.height = this.offsetHeight + "px";
	});

	/* calls addAttributes(), removes atts container after clicking on one of the optoins */
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