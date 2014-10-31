var count = 0;
function addAtts() {
	var atts = document.getElementById('atts-container');
	atts.style.display = 'block';
}
$('.cancel').on('click', function() {
	$('#atts-container').hide();
});

$('.atts').on('click', function(elem){
	addAttribute(elem.target.innerHTML);
	$('#atts-container').hide();
});

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
		} else {
			this.name = "+"+this.name;
		}
	}
});

$('.book-single').on( 'change keyup keydown paste cut', 'textarea', function (){
    $(this).height(0).height(this.scrollHeight);
}).find( 'textarea' ).change();

function addAttribute(type) {
	var container = document.getElementById('form');
	var newAttDiv = document.createElement('div');
	var cancel = document.createElement('span');

	newAttDiv.setAttribute('class', 'new-attribute'); 
	var newLabel;
	if (type != "other") {
		newLabel = document.createElement('div');
		newLabel.setAttribute('class', 'label');
		newLabel.innerHTML = type;
	} else {
		newLabel = document.createElement('input');
		newLabel.setAttribute('type', 'text');
		newLabel.setAttribute('name', 'newlabel');
		newLabel.setAttribute('class', 'label');
		newLabel.setAttribute('value', type);
		newLabel.setAttribute('id', 'newLabel'+count);
		newLabel.setAttribute('class', 'label');
		newLabel.onclick = function() {
			this.select();
		}
		newLabel.onchange = function(elem) {
			var targetIndex = elem.target.id;
			targetIndex = targetIndex.substring(8);
			var newInput = document.getElementById('newAtt'+targetIndex);
			newInput.setAttribute('name', 'new'+elem.target.value);
		}
	}

	var newInput = document.createElement('textarea');
	newInput.setAttribute('type', 'text');
	newInput.setAttribute('name', 'new'+type);
	newInput.setAttribute('value', 'Input new ' + type);
	newInput.setAttribute('id', 'newAtt'+count);
	newAttDiv.appendChild(newLabel);
	newAttDiv.appendChild(newInput);
	
	container.appendChild(newAttDiv);

	cancel.setAttribute('class', 'clickable');
	cancel.setAttribute('id', 'cancel-att');
	cancel.innerHTML = "Cancel";
	newAttDiv.appendChild(cancel);

	cancel.onclick = function() {
		container.removeChild(container.lastChild)
	}

	newInput.onclick = function() {
		this.select();
	}

	count++;
}	