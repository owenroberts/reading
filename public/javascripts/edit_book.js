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
	const newOtherDiv = document.getElementById('other');
	const saveAttribute = document.getElementById('save-att');
	const cancelAttribute = document.getElementById('cancel-att');
	const newLinkTitle = document.getElementById('new-link-title');
	const newLinkUrl = document.getElementById('new-link-url');

	const attributeText = document.getElementById('new-attribute-text');
	attributeText.addEventListener('keyup', adjustHeight);

	/* adds attribute section -- this sucks ... */
	function addAttribute(type) {
		newAttributeDiv.style.display = 'block';
		const isLink = type == "link";
		
		if (isLink) {
			newLinkDiv.style.display = 'block';
		} else {
			newOtherDiv.style.display = 'block';
			attributeText.placeholder = type;
		}

		saveAttribute.onclick = function() {
			let value = isLink ?  newLinkTitle.value + ',' + newLinkUrl.value : attributeText.value;
			type += "s";
			Updater.updateParameter(type, value, -1);
			newAttributeDiv.style.display = 'none';
			newLinkDiv.style.display = 'none';
			newOtherDiv.style.display = 'none';
		};

		cancelAttribute.onclick = function() {
			newAttributeDiv.style.display = 'none';
			newLinkDiv.style.display = 'none';
			newOtherDiv.style.display = 'none';
		};
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