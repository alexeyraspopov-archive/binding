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
	var nodes = children(root), index, skipNodes = [], compile;

	compile = function(node){
		var keys, index, directive, scoped;

		if(skipNodes.indexOf(node) !== -1){
			return;
		}

		keys = Object.keys(node.dataset);

		for(index = 0; index < keys.length; index++){
			directive = directives[keys[index]];

			if(!directive){
				continue;
			}

			if(directive.scoped/* && !node.scoped*/){
				skipNodes = skipNodes.concat(children(node));
			}

			directive(node, scope, node.dataset);

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