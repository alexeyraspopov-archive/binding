(function(){
	'use strict';

	function elements(root){
		var children = root.getElementsByTagName('*'), nodes = [root], index;

		for(index = 0; index < children.length; index++){
			nodes.push(children[index]);
		}

		return nodes;
	}

	function compile(node, scope, skipped){
		var keys = Object.keys(node.dataset), index, directive, nodes;

		for(index = 0; index < keys.length; index++){
			directive = directives[keys[index]];

			if(directive){
				directive.compile(node, scope, node.dataset);

				if(directive.scope){
					nodes = elements(node);

					while(nodes.length){
						skipped.push(nodes.shift());
					}

					break;
				}
			}
		}
	}

	function apply(scope, view){
		var nodes = elements(view), skipped = [], index;

		for(index = 0; index < nodes.length; index++){
			if(skipped.indexOf(nodes[index]) === -1){
				compile(nodes[index], scope, skipped);
			}
		}
	}

	var directives = {
		text: {
			compile: function(element, scope, dataset){
				data.subscribe(scope, dataset.text, function(value){
					element.innerText = value;
				});
			}
		},
		model: {
			compile: function(element, scope, dataset){
				var direct = false, key = element.type === 'text' ? 'value' : 'checked';

				data.subscribe(scope, dataset.model, function(value){
					if(direct){
						direct = false;
					}else{
						element[key] = value;
					}
				});

				element.addEventListener('change', function(){
					setTimeout(function(){
						direct = true;
						data.write(scope, dataset.model, element[key]);
					}, 0);
				});
			}
		},
		click: {
			compile: function(element, scope, dataset){
				element.addEventListener('click', function(){
					data.write(scope, dataset.click);
				});
			}
		},
		repeat: {
			compile: function(element, scope, dataset){
				var header = document.createComment(' repeat: ' + dataset.repeat + ' '),
					marker = document.createComment(' end repeat '),
					matches = dataset.repeat.match(/^(.+)\s+in\s+(.+)$/),
					local = matches[1],
					arrayName = matches[2],
					array = data.read(scope, arrayName),
					elements = [],
					parent = element.parentNode,
					created = [],
					tick = 0;

				element.removeAttribute('data-repeat');
				parent.insertBefore(marker, element);
				parent.insertBefore(header, marker);
				parent.removeChild(element);

				data.subscribe(scope, function(){
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
						childScope = Object.create(scope);
						childScope[local] = array[index];
						apply(childScope, child);

						parent.insertBefore(child, marker);
						elements.push(child);
						created.push(array[index]);
					}

					// TODO: check element indeces and swap if they're not equal
				});
			},
			scope: true
		},
		checked: {
			compile: function(element, scope, dataset){

			}
		}
	};

	var data = {
		read: function(scope, expression){
			return Watcher.parse(expression)(scope);
		},
		write: function(scope, expression, value){
			if(arguments.length > 2){
				expression += ' = locals[0]';
			}

			Watcher.parse(expression)(scope, [value]);
			scope.watcher.digest();
		},
		subscribe: function(scope, expression, callback){
			if(!scope.watcher){
				scope.watcher = new Watcher();
			}

			scope.watcher.watch(scope, expression, callback);
		}
	};

	window.applyBindings = apply;
})();