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
	function hiddenToggle() {
		var state = $(this).text();
		if (state[0] == "-") {
			var d = $(this).parent();
			d.height(26);
			d.innerWidth('30%');
			$(this).text('+');
			var text = $(this).parent().find( 'textarea' );
			text.css({resize:"none", width:"100%"})
		} else {
			var d = $(this).parent();
			d.height(d[0].scrollHeight);
			d.innerWidth('100%');
			$(this).text('-');
			var text = $(this).parent().find( 'textarea' );
			text.css({resize:"auto", width:"75%", maxWidth: "100%", maxHeight: "100%"});
		}
	}
	$('body').on('click', '.hidecontents span', hiddenToggle);

	/* changes height of textareas for notes and quotes */
	$('.book-single').on( 'change keyup keydown paste cut', 'textarea.edit', function (){
		$(this).height(0).height(this.scrollHeight);
	}).find( 'textarea' ).change();

	$('.book-single').on( 'change keyup keydown paste cut', 'textarea.edit', function (){
		this.parentNode.parentNode.style.height = "0px";
		this.parentNode.parentNode.style.height = this.offsetHeight + "px";
	});


	/* shows attribute adding buttons */
	$('#addAtts').on('click', function() {
		$('#atts-container').css('display', 'block');
		$(this).hide();
	});
	/* calls addAttributes(), removes atts container after clicking on one of the optoins */
	$('.atts').on('click', function(elem){
		addAttribute(elem.target.innerHTML);
		$('#atts-container').hide();
	});
	/* removes  */
	$('.cancel').on('click', function() {
		console.log("what")
		$('#atts-container').hide();
		$('#addAtts').show();
	});


	/* adds attribute section */
	function addAttribute(type) {
		var newAttDiv = $('<div>')
			.addClass('new-attribute');
		var cancel = $('<span>')
			.attr({	'class': 'clickable',
					'id': 'cancel-att'
				})
			.text("Cancel");
		var save = $('<span>')
			.attr({	'class': 'clickable',
					'id': 'save-att'
				})
			.text("Save");
		
		var newLabel, newInput;

		if (type == "link") {
			newLabel = $('<input>')
				.attr({	'type': 'text',
						'name': 'newlabel',
						'placeholder': 'Name'
					});
			newInput = $('<input>')
				.attr({	'type':'text',
						'name': 'new'+type,
						'placeholder': 'URL'
					});
			newAttDiv.append(newLabel)
				.append(newInput);

			save.on('click', function() {
				type += "s";
				Updater.updateParameter(type, newLabel[0].value+","+newInput[0].value, -1);
				$('.new-attribute').remove();
				$('#addAtts').show();
			});
		// note or quote or tag
		} else  {
			newLabel = $('<div>')
				.addClass('label')
				.text(type);

			if (type == "tag") newInput = $('<input>')
			else newInput = $('<textarea>')

			newInput.attr({	'type':'text',
				'name': 'new'+type,
				'placeholder': 'Input new ' + type
			});

			newAttDiv.append(newLabel)
				.append(newInput);

			save.on('click', function() {
				type += "s";
				Updater.updateParameter(type, newInput[0].value, -1);
				$('.new-attribute').remove();
				$('#addAtts').show();
			});
		} 

		newAttDiv.append(cancel);
		newAttDiv.append(save);

		cancel.on('click', function() {
			$('.new-attribute').remove();
			$('#addAtts').show();
		});

		newAttDiv.insertBefore('#references');
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
	function addRef() {
		$('.addref').show();
	}
	$('#addRef').on('click', function(){
		$('.addref').show();
		$(this).hide();
	});
}