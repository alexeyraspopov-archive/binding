(function(factory){
	'use strict';
var binding = {}, directives = {};

function children(root){
	var index, length, elements = [],
		nodes = root.getElementsByTagName('*');

	for(index = 0, length = nodes.length; index < length; index++){
		elements.push(nodes[index]);
	}

	return elements;
}

binding.adapter = {
	watch: function(){
		throw new Error('You should declare binding adapter');
	},
	unwatch: function(){
		throw new Error('You should declare binding adapter');
	},
	read: function(scope, keypath){
		return scope[keypath];
	},
	publish: function(scope, keypath, value){
		scope[keypath] = value;
	}
};

binding.apply = function(scope, root){
	var nodes = children(root), index, skipNodes = [], compile, filters;

	filters = function(node, directive){
		var pipe = node.dataset[directive].split(/\s*\|\s*/);

		node.dataset[directive] = pipe[0];

		return pipe.slice(1);
	};

	compile = function(node){
		var keys, index, directive, filter, scoped;

		if(skipNodes.indexOf(node) !== -1){
			return;
		}

		keys = Object.keys(node.dataset);

		for(index = 0; index < keys.length; index++){
			directive = directives[keys[index]];
			filter = filters(node, keys[index]);

			console.log(filter);

			if(!directive){
				continue;
			}

			if(directive.scoped/* && !node.scoped*/){
				skipNodes = skipNodes.concat(children(node));
			}

			directive(node, scope, node.dataset, filter);

			/*if(node.scoped){
				break;
			}*/
		}
	};

	// compile(root);

	for(index = 0; index < nodes.length; index++){
		compile(nodes[index]);
	}
};

binding.directive = function(name, constructor, scoped){
	directives[name] = constructor;
	constructor.scoped = scoped;
};

factory('binding', binding);
binding.directive('bind', function(element, scope, dataset){
	binding.adapter.watch(scope, dataset.bind, function(value){
		element.textContent = value;
	});
});

binding.directive('html', function(element, scope, dataset){
	binding.adapter.watch(scope, dataset.bind, function(value){
		element.innerHTML = value;
	});
});

binding.directive('click', function(element, scope, dataset){
	element.addEventListener('click', function(){
		binding.adapter.publish(scope, dataset.click);
	});
});

binding.directive('model', function(element, scope, dataset){
	var value = element.type === 'text' ? 'value' : 'checked';

	binding.adapter.watch(scope, dataset.model, function(data){
		element[value] = data;
	});

	element.addEventListener('change', function(){
		binding.adapter.publish(scope, dataset.model, element[value]);
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

	/*if(element.scoped){
		return;
	}*/

	// element.scoped = true;
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
				deleted.push(created[index]);
			}
		}

		for(index = 0; index < deleted.length; index++){
			deletedIndex = created.indexOf(deleted[index]);

			parent.removeChild(elements[deletedIndex]);
			created.splice(deletedIndex, 1);
			elements.splice(deletedIndex, 1);
		}

		for(index = 0; index < array.length; index++){
			if(created.indexOf(array[index]) > -1){
				continue;
			}

			child = element.cloneNode(true);
			// child.scoped = true;
			childScope = Object.create(scope);
			childScope[local] = array[index];
			binding.apply(childScope, child);

			parent.insertBefore(child, marker.nextElementSibling);
			elements.push(child);
			created.push(array[index]);
		}

		// TODO: check element indeces and swap if they're not equal
	});
}, true);
})(function(name, object){
	if(typeof define === 'function' && define.amd){
		define(function(){
			return object;
		});
	}else if(typeof window === 'object'){
		window[name] = object;
	}else{
		module.exports = object;
	}
});