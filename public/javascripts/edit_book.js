$( document ).ready(function() {
function addRef() {
	$('.addref').show();
}
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
	console.log(this);
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


/* hidden stuff */
function hiddenToggle() {
	console.log('unhide');
	var state = $(this).text();
	if (state[0] == "-") {
		$(this).parent().find('div').css('display', 'none');
		$(this).text('+');	
	} else {
		$(this).parent().find('div').css('display', 'block');
		$(this).text('-');
		var text = $(this).parent().find( 'textarea' );
		text.height(50);
	}
}
$('.hidecontents span').on('click', hiddenToggle);

$('#addAtts').on('click', function() {
	$('#atts-container').css('display', 'block');
});
$('.cancel').on('click', function() {
	$('#atts-container').hide();
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
					'class': 'label',
					'placeholder': 'Name',
					'id': 'newLabel'+count,
					'class': 'label',
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

	container.append(newAttDiv);
	newAttDiv.append(cancel);

	cancel.on('click', function() {
		$('.new-attribute').remove();
	});

	count++;
}
$('#addRef').on('click', function(){
	$('.addref').show();
	$(this).hide();
});
	
});