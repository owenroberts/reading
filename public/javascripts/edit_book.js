function setup() {
	function editParameter(elem) {
		if (elem.value != Updater.data[elem.name]) {
			Updater.status.innerHTML = "Saving...";
			Updater.status.classList.add('fade-in');
			Updater.status.classList.remove("fade-out");
			Updater.updateParameter(elem.name.replace("+", ""), elem.value, elem.dataset.num);
		}
	}

	function adjustHeight(ev) {
		ev.target.style.height = ev.target.scrollHeight + 'px';
	}

	const edits = document.getElementsByClassName('edit');
	Array.from(edits).forEach(edit => {
		edit.addEventListener('blur', ev => {
			editParameter(ev.target);
		});
		if (edit.tagName == 'TEXTAREA')
			edit.addEventListener('keyup', adjustHeight);
		if (edit.tagName == 'INPUT')
			edit.addEventListener('keyup', ev => {
				if (ev.keyCode == 13) editParameter(ev.target);
			});
	});

	const attButtons = document.getElementsByClassName('atts');
	Array.from(attButtons).forEach(btn => {
		btn.addEventListener('click', ev => {
			addAttribute(ev.target.innerHTML);
		});
	});

	const newAttributeDiv = document.getElementById('new-attribute');
	const newLinkDiv = document.getElementById('link');
	const newInputDiv = document.getElementById('input');
	const newOtherDiv = document.getElementById('other');
	const saveAttribute = document.getElementById('save-att');
	const cancelAttribute = document.getElementById('cancel-att');
	const newLinkTitle = document.getElementById('new-link-title');
	const newLinkUrl = document.getElementById('new-link-url');

	const attributeText = document.getElementById('new-attribute-text');
	attributeText.addEventListener('keyup', adjustHeight);

	const inputText = document.getElementById('new-input-text');

	function reset() {
		newAttributeDiv.style.display = 'none';
		newLinkDiv.style.display = 'none';
		newOtherDiv.style.display = 'none';
		newInputDiv.style.display = 'none';
		saveAttribute.onclick = undefined;
	};

	cancelAttribute.onclick = reset;


	/* adds attribute section -- this sucks ... */
	function addAttribute(type) {
		reset();
		newAttributeDiv.style.display = 'block';

		switch (type) {
			case 'link':
				newLinkDiv.style.display = 'block';
				newLinkTitle.focus();
				newLinkTitle.addEventListener('keydown', ev => {
					if (ev.which == 13 && ev.metaKey) saveValue();
				});
				newLinkUrl.addEventListener('keydown', ev => {
					if (ev.which == 13 && ev.metaKey) saveValue();
				});
			break;
			case 'tag':
			case 'vimeo':
			case 'youtube':
			case 'image':
				newInputDiv.style.display = 'block';
				inputText.placeholder = type;
				inputText.addEventListener('keydown', ev => {
					if (ev.which == 13) saveValue();
				});
				inputText.focus();
			break;
			default:
				newOtherDiv.style.display = 'block';
				attributeText.placeholder = type;
				attributeText.addEventListener('keydown', ev => {
					console.log(ev);
					if (ev.which == 13 && ev.metaKey) saveValue();
				});
				attributeText.focus();
			break;
		}
		
		function saveValue() {
			
			let value;
			switch (type) {
				case 'link':
					value = newLinkTitle.value + ',' + newLinkUrl.value;
				break;
				case 'tag':
				case 'vimeo':
				case 'youtube':
				case 'image':
					value = inputText.value;
				break;
				default:
					value = attributeText.value;
				break;
			}

			Updater.updateParameter(`${type}s`, value, -1);
			
			newAttributeDiv.style.display = 'none';
			newLinkDiv.style.display = 'none';
			newOtherDiv.style.display = 'none';
			newInputDiv.style.display = 'none';
		};

		saveAttribute.onclick = saveValue;

		
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