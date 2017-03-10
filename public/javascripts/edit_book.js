$( document ).ready(function() {

var bookform = document.querySelector('#form');
document.onkeypress = function(ev) {
	if (ev.which == 13 && ev.altKey) bookform.submit();
};

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

$('select[name=_field]').on('change', function(){
	$('select.choices').css('display', 'none').attr('disabled', true);
	$('select[name='+$(this).val()+']').css('display', 'inline').attr('disabled', false);
});
$('select[name=_types]').css('display', 'inline').attr('disabled', false);


var count = 0;
$('input.edit').on('change', function() {
	if (this.name[0] != "+") {
		if (this.name == "quotes") {
			$('textarea[name="quotes"]').attr('name', '+quotes');
		} else {
			this.name = "+"+this.name;
		}
	}
});
$('textarea.edit').on('keydown', function() {
	if (this.name[0] != "+") {
		if (this.name == "quotes") {
			$('textarea[name="quotes"]').attr('name', '+quotes');
		} else if (this.name == "notes") {
			$('textarea[name="notes"]').attr('name', '+notes');
		} else {
			this.name = "+"+this.name;
		}
	}
});

$('.book-single').on( 'change keyup keydown paste cut', 'textarea', function (){
    $(this).height(0).height(this.scrollHeight);
}).find( 'textarea' ).change();

$('.book-single').on( 'change keyup keydown paste cut', 'textarea', function (){
    this.parentNode.parentNode.style.height = "0px";
     this.parentNode.parentNode.style.height = this.offsetHeight + "px";
});

/* hidden stuff */
function hiddenToggle() {
	var state = $(this).text();
	if (state[0] == "-") {
		var d = $(this).parent();
		d.height(26);
		$(this).text('+');	
	} else {
		var d = $(this).parent();
		d.height(d[0].scrollHeight);
		$(this).text('-');
		/*var text = $(this).parent().find( 'textarea' );
		text.height(text[0].scrollHeight);*/
	}
}
$('.hidecontents span').on('click', hiddenToggle);

$('#addAtts').on('click', function() {
	$('#atts-container').css('display', 'block');
	$(this).hide();
});
$('.cancel').on('click', function() {
	console.log("what")
	$('#atts-container').hide();
	$('#addAtts').show();
});

$('.atts').on('click', function(elem){
	addAttribute(elem.target.innerHTML);
	$('#atts-container').hide();
});

function addAttribute(type) {
	var container = $('#form');
	var newAttDiv = $('<div>')
		.addClass('new-attribute');
	var cancel = $('<span>')
		.attr({	'class': 'clickable',
				'id': 'cancel-att'
			})
		.text("Cancel");
	var newLabel, newInput;

	if (type == "link") {
		newLabel = $('<input>')
			.attr({	'type': 'text',
					'name': 'newlabel',
					'placeholder': 'Name',
					'id': 'newLabel'+count,
				});

		newInput = $('<input>')
			.attr({	'type':'text',
					'name': 'new'+type,
					'placeholder': 'URL',
					'id': 'newAtt'+count
				});
		newAttDiv.append(newLabel)
			.append(newInput);

		newLabel.on('change', function(elem) {
			var targetIndex = elem.target.id;
			targetIndex = targetIndex.substring(8);
			//var newInput = document.getElementById('newAtt'+targetIndex);
			newInput.attr('name', 'new'+type);
		});
		newInput.on('change', function() {
			newInput.val(newLabel.val()+","+newInput.val());
		});
	} else if (type == "tag") {
		newLabel = $('<div>')
			.addClass('label')
			.text(type);

		newInput = $('<input>')
			.attr({	'type':'text',
					'name': 'new'+type,
					'placeholder': 'Input new ' + type,
					'id': 'newAtt'+count
				});
		newAttDiv.append(newLabel)
			.append(newInput);
	} else  {
		newLabel = $('<div>')
			.addClass('label')
			.text(type);

		newInput = $('<textarea>')
			.attr({	'type':'text',
					'name': 'new'+type,
					'value': 'Input new ' + type,
					'id': 'newAtt'+count
				});
		newAttDiv.append(newLabel)
			.append(newInput);
	} 

	//container.append(newAttDiv);
	newAttDiv.insertBefore('#editBookSubmit');
	newAttDiv.append(cancel);

	cancel.on('click', function() {
		$('.new-attribute').remove();
		$('#addAtts').show();
	});

	count++;
}
$('#addRef').on('click', function(){
	$('.addref').show();
	$(this).hide();
});
	
});