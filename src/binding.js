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
	scope: function(object){
		return object;
	},
	watch: function(){
		throw new Error('You should declare binding adapter');
	},
	read: function(scope, keypath){
		return scope[keypath];
	},
	write: function(scope, keypath, value){
		scope[keypath] = value;
	}
};

binding.apply = function(scope, root){
	var nodes = children(root), node, skipNodes = [],
		keys, i, j, directive;

	scope = binding.adapter.scope(scope);

	for(i = 0; i < nodes.length; i++){
		node = nodes[i];

		if(skipNodes.indexOf(node) > -1){
			continue;
		}

		keys = Object.keys(node.dataset);

		for(j = 0; j < keys.length; j++){
			directive = directives[keys[j]];

			if(!directive){
				continue;
			}

			if(directive.scoped){
				skipNodes = skipNodes.concat(children(node));
			}

			directive(node, scope, node.dataset);
		}
	}
};

binding.directive = function(name, constructor, scoped){
	directives[name] = constructor;
	constructor.scoped = scoped;
};

factory('binding', binding);