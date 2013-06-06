binding.directive('bind', function(element, scope, dataset){
	binding.adapter.watch(scope, dataset.bind, function(value){
		element.textContent = value;
	});
});

binding.directive('click', function(element, scope, dataset){
	element.addEventListener('click', function(){
		binding.adapter.write(scope, dataset.click);
	});
});

binding.directive('model', function(element, scope, dataset){
	var value = element.type === 'text' ? 'value' : 'checked';

	binding.adapter.watch(scope, dataset.model, function(data){
		element[value] = data;
	});

	element.addEventListener('change', function(){
		binding.adapter.write(scope, dataset.model, element[value]);
	});
});

binding.directive('class', function(element, scope, dataset){
	var definitions = dataset.class.split(/\s*,\s*/),
		index, matches, bindClass;

	bindClass = function(className, expression){
		binding.adapter.watch(scope, expression, function(value){
			value = !!value;

			if(value){
				element.classList.add(className);
			}else{
				element.classList.remove(className);
			}
		});
	};

	for(index = 0; index < definitions.length; index++){
		matches = definitions[index].match(/^(.+):\s*(.+)$/);
		bindClass(matches[1], matches[2]);
	}
});

binding.directive('repeat', function(element, scope, dataset){
	var marker = document.createComment(' repeat: ' + dataset.repeat + ' '),
		matches = dataset.repeat.match(/^(.+)\s+in\s+(.+)$/),
		local = matches[1],
		arrayName = matches[2],
		array = binding.adapter.read(scope, arrayName),
		elements = [],
		parent = element.parentNode,
		created = [],
		tick = 0;

	parent.insertBefore(marker, element);
	parent.removeChild(element);

	binding.adapter.watch(scope, function(){
		var index;

		if(array.length !== created.length){
			return ++tick;
		}

		for(index = 0; index < array.length; index++){
			if(array[index] !== created[index]){
				return ++tick;
			}
		}
	}, function(){
		// What if we swap two elements? fuuuuuuuuu
		var index, child, childScope, deleted = [], deletedIndex;

		for(index = 0; index < created.length; index++){
			if(array.indexOf(created[index]) === -1){
				parent.removeChild(elements[index]);
				deleted.push(created[index]);
			}
		}

		for(index = 0; index < deleted.length; index++){
			deletedIndex = created.indexOf(deleted[index]);

			created.splice(deletedIndex, 1);
			elements.splice(deletedIndex, 1);
		}

		for(index = 0; index < array.length; index++){
			if(created.indexOf(array[index]) > -1){
				continue;
			}

			child = element.cloneNode(true);

			childScope = binding.adapter.inherit(scope);
			childScope[local] = array[index];
			bind(childScope, child);

			parent.insertBefore(child, marker.nextElementSibling);
			elements.push(child);
			created.push(array[index]);
		}

		// TODO: check element indeces and swap if they're not equal
	});
}, true);