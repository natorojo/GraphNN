class Node{
	constructor(key){
		this.key = key;
		this.next = null;
		this.prev = null;
	}
}

class LinkedList{
	constructor(){
		this.head = null;
		this.tail = null;
		this.size = 0
	}

	log(){
		console.log('check fwd')
		let current = this.head;
		while(current){
			console.log(current.key);
			current = current.next;
		}
		console.log('check bwd')
		current = this.tail;
		while(current){
			console.log(current.key);
			current = current.prev;
		}
	}

	insert(key,returnNode=true){
		this.size ++;
		let newNode = new Node(key);
		if(this.head === null){
			this.head = newNode;
			this.tail = newNode;
		}else{
			let tail = this.tail;
			newNode.prev = tail
			tail.next = newNode
			this.tail = newNode
		}
		if(returnNode){
			return newNode;
		}
	}

	insertBefore(key,next,returnNode=true){
		this.size ++;
		let newNode = new Node(key);
		let nextPrev = next.prev;
		next.prev = newNode;
		newNode.next = next;
		if( next === this.head){
			this.head = newNode
		}else{
			newNode.prev = nextPrev;
			nextPrev.next = newNode;
		}
		if(returnNode){
			return newNode;
		}
	}

	insertAfter(key,prev,returnNode=true){
		this.size ++;
		let newNode = new Node(key);
		let prevNext = prev.next;
		prev.next = newNode;
		newNode.prev = prev;
		if(prev === this.tail){
			this.tail = newNode;
		}else{
			newNode.next = prevNext;
			prevNext.prev = newNode;
		}
		if(returnNode){
			return newNode;
		}
	}

	remove(node){
		this.size --;
		if(node === this.head){
			this.head = node.next;
			this.head.prev = null;
		}else if(node === this.tail){
			this.tail = node.prev;
			this.tail.next = null;
		}else{
			let prev = node.prev;
			let next = node.next;
			prev.next = next;
			next.prev = prev;
		}
	}

	size(){
		return this.size;
	}
}

class Network{
	constructor(opts){
		this._V = {};
		this._A = {};
		//where to draw the eges
		this._svg = opts.svg;
		//where to insert the vertices
		this._vContainer = opts.vContainer;
		this._vContainer.classList.add('relative');
        this._vContainer.addEventListener('mousemove',this.onDrag.bind(this));
        this._vContainer.addEventListener('mouseup',()=>{
        	this.dragging = false;
        	this.dragTarget = null;
        });
        this.linking = false;
        this.UID = -1;
        //layer color mapping
        this.colorMap = {
        	input:'#5742f5',
        	linear:'#42f5e6',
        	conv:'#6eff8d',
        	maxPool:'#ff5cad',
        	activation:'#ffd257',
        	softmax:'#54fffc'
        };
	}

	/*--------------------------------------------
	
	node edit stuff

	--------------------------------------------*/

	openVertexSettings(UID){
		let vertexData = this._V[UID];
		const center = this.getVertexCenter(UID);
		const width = 512;
		const height = 200;
		const styles = {
			position:'absolute',
			height:height+'px',
			width:width+'px',
			left:Math.max(center[0] - width/2,4)+'px',
			top:Math.max(center[1] - height/2,4)+'px'
		};
		new Beatrice()
			.class('vertexSettingsContainer')
			.styles({
				width:'100%',
				height:'100%',
				backgroundColor:'rgba(0,0,0,0.2)',
				position:'relative'
			})
			.click(e=>{
				e.target.remove()
			})
			.div()
				.class('vertexSettings')
				.noProp()
				.styles(styles)
			.kids()
				.div().class('layerOptions').kids()
					.h3().text('Add layers')
					.button().text('INPUT').click(e=>{
						let layerTgt = e.target.parentNode.nextSibling;
						this.addInputLayer(UID,layerTgt);
					})
					.button().text('LINEAR').click(e=>{
						let layerTgt = e.target.parentNode.nextSibling;
						this.addLinearLayer(UID,layerTgt);
					})
					.button().text('CONV').click(e=>{
						let layerTgt = e.target.parentNode.nextSibling;
						this.addConvLayer(UID,layerTgt);
					})
					.button().text('MAX_POOL').click(e=>{
						let layerTgt = e.target.parentNode.nextSibling;
						this.addMaxPoolLayer(UID,layerTgt);
					})
					.button().text('ACTIVATION').click(e=>{
						let layerTgt = e.target.parentNode.nextSibling;
						this.addActivation(UID,layerTgt);
					})
					.button().text('RESHAPE').click(e=>{
						let layerTgt = e.target.parentNode.nextSibling;
						this.addReshape(UID,layerTgt);
					})
					.button().text('SOFTMAX').click(e=>{
						let layerTgt = e.target.parentNode.nextSibling;
						this.addSoftmax(UID,layerTgt);
					})
				.pop()//end layers options
				.div().class('nodeLayers').ex(layerTgt=>{
					let current = vertexData.layers.head;
					while(current){
						let layerData = current.key;
						switch(layerData.type){
							case 'input':
								this.inputLayerView(layerData,layerTgt);
								break;
							case 'linear':
								this.linearLayerView(layerData,layerTgt);
								break;
							case 'conv':
								this.convLayerView(layerData,layerTgt);
								break;
							case 'pool':
								this.maxPoolView(layerData,layerTgt);
								break;
							case 'activation':
								this.activationView(layerData,layerTgt);
								break;
							case 'reshape':
								this.reshapeView(layerData,layerTgt);
								break;
							case 'softmax':
								this.softmaxView(layerData,layerTgt);
								break;
							default:
								break;
						}
						current = current.next;
					}
				})
			.pop()
		.make(dashboard);
	}

	/*layer adding methods*/

	addInputLayer(UID,layerTgt){
		let vertexData = this._V[UID];
		let layerData = {
			type:'input',
			shape:null
		};
		vertexData.layers.insert(layerData);
		this.inputLayerView(layerData,layerTgt);
	}

	inputLayerView(layerData,layerTgt){
		new Beatrice().class('inputLayer layer')
			.span().text('Input: ')
			.input().value(layerData.shape).placeholder('shape: X,Y,Z...').keyup(e=>{
				let tgt = e.target;
				layerData.shape = tgt.value;
			})
		.make(layerTgt);
	}

	addLinearLayer(UID,layerTgt){
		let vertexData = this._V[UID];
		let layerData = {
			type:'linear',
			inDim:null,
			outDim:null
		};
		vertexData.layers.insert(layerData);
		this.linearLayerView(layerData,layerTgt);
	}

	linearLayerView(layerData,layerTgt){
		new Beatrice().class('linearLayer layer')
			.span().text('Linear: ')
			.input().value(layerData.inDim)
				.placeholder('Input dim')
				.keyup(e=>{
					const val = e.target.value;
					layerData.inDim = val;
				})
			.input().value(layerData.outDim)
				.placeholder('Output dim.')
				.keyup(e=>{
					const val = e.target.value;
					layerData.outDim = val;
				})
		.make(layerTgt);
	}

	addConvLayer(UID,layerTgt){
		let vertexData = this._V[UID];
		let layerData = {
			type:'conv',
			cin:null,
			cout:null,
			f:null,
			s:null,
			p:null
		};
		vertexData.layers.insert(layerData);
		this.convLayerView(layerData,layerTgt);
	}

	convLayerView(layerData,layerTgt){
		new Beatrice().class('convLayer layer')
			.span().text('Conv: ')
			.input()
				.value(layerData.cin)
				.placeholder('C-in')
				.keyup(e=>{
					const val = e.target.value;
					layerData.cin = val;
				})
			.input()
				.value(layerData.cout)
				.placeholder('C-out')
				.keyup(e=>{
					const val = e.target.value;
					layerData.cout = val;
				})
			.input()
				.value(layerData['f'])
				.placeholder('f')
				.keyup(e=>{
					const val = e.target.value;
					layerData.f = val;
				})
			.input()
				.value(layerData['s'])
				.placeholder('s')
				.keyup(e=>{
					const val = e.target.value;
					layerData.s = val;
				})
			.input()
				.value(layerData['p'])
				.placeholder('p')
				.keyup(e=>{
					const val = e.target.value;
					layerData.p = val;
				})
		.make(layerTgt);
	}

	addMaxPoolLayer(UID,layerTgt){
		let vertexData = this._V[UID];
		let layerData = {
			type:'pool',
			f:null,
			s:null,
		};
		vertexData.layers.insert(layerData);
		this.maxPoolView(layerData,layerTgt);
	}

	maxPoolView(layerData,layerTgt){
		new Beatrice().class('maxPoolLayer layer')
			.span().text('Pool: ')
			.input()
				.value(layerData.f)
				.placeholder('f')
				.keyup(e=>{
					const val = e.target.value;
					layerData.f = val;
				})
			.input()
				.value(layerData.s)
				.placeholder('s')
				.keyup(e=>{
					const val = e.target.value;
					layerData.s = val;
				})
		.make(layerTgt);
	}

	addActivation(UID,layerTgt){
		let vertexData = this._V[UID];
		let layerData = {
			type:'activation',
			activation:null
		};
		vertexData.layers.insert(layerData);
		this.activationView(layerData,layerTgt);
	}

	activationView(layerData,layerTgt){
		new Beatrice().class('activationLayer layer')
			.span().text('Activation: ')
			.select()
				.on('change',e=>{
					let tgt = e.target;
					const activation = tgt.options[tgt.selectedIndex].value;
					layerData.activation = activation;
				})
			.kids()
				.option()
					.text('ReLU')
					.if(layerData.activation === 'ReLU',iH=>{
						iH.setAtts({selected:true})
					})
				.option()
					.text('Tanh')
					.if(layerData.activation === 'Tanh',iH=>{
						iH.setAtts({selected:true})
					})
				.option()
					.text('Sigmoid')
					.if(layerData.activation === 'Sigmoid',iH=>{
						iH.setAtts({selected:true})
					})
			.pop()
		.make(layerTgt);
	}

	addReshape(UID,layerTgt){
		let vertexData = this._V[UID];
		let layerData = {
			type:'reshape',
			shape:null
		};
		vertexData.layers.insert(layerData);
		this.reshapeView(layerData,layerTgt);
	}

	reshapeView(layerData,layerTgt){
		new Beatrice().class('reshapeLayer layer')
			.span().text('Reshape: ')
			.input()
				.value(layerData.shape)
				.placeholder('shape: X,Y,Z... or flatten')
				.keyup(e=>{
					const val = e.target.value;
					layerData.shape = val;
				})
		.make(layerTgt);
	}

	addSoftmax(UID,layerTgt){
		let vertexData = this._V[UID];
		let layerData = {
			type:'softmax'
		};
		vertexData.layers.insert(layerData);
		this.softmaxView(layerData,layerTgt);
	}

	softmaxView(layerData,layerTgt){
		new Beatrice().class('softmaxLayer layer')
			.span().text('Softmax')
		.make(layerTgt);
	}

	/*--------------------------------------------
	
	graph building stuff

	--------------------------------------------*/


	getUID(){
		this.UID++;
		return this.UID;
	}

	addVertex(){
		const UID = this.getUID();
		new Beatrice()
			.class('vertex')
			.ex(elem=>{
				elem.dataset.uid=UID;
				this._V[UID] = {
					elem:elem,
					//out arrows
					out:[],
					//in arrows
					in:[],
					layers:new LinkedList()
				}
			})
			.on('mousedown',(e)=>{
				this.startDrag(e);
			}).on('dblclick',(e)=>{
				this.linkVertexes(e);
			}).on('contextmenu',(e)=>{
				e.preventDefault();
				this.openVertexSettings(UID);
				return false;
			})
		.make(this._vContainer);
		console.log(this._V);
		console.log(this._A);
	}

	linkVertexes(e){
		let tgt = e.target;
		//this is the UID for the event target
		const UID = tgt.dataset.uid;
		if(!this.linking){
			tgt.classList.add('linking');
			this.linkSrc = UID;
			this.linking = true;
		}else if(this.linking && this.linkSrc == UID){
			//tgt same as source so
			//reset to non-linking state
			this.linking = false;
			this._V[UID].elem.classList.remove('linking');
		}else{
			//src center
			const srcCoords = this.getVertexCenter(this.linkSrc);
			//tgt center
			const tgtCoords = this.getVertexCenter(UID);

			let srcV = this._V[this.linkSrc];
			let tgtV = this._V[UID];

			let line = this.drawLine(srcCoords[0],srcCoords[1],tgtCoords[0],tgtCoords[1]);
			//add line to edges
			const lineUID = this.getUID()
			this._A[lineUID] = line;
			srcV.out.push(lineUID);
			tgtV.in.push(lineUID);
			

			//reset to non-linking state
			this.linking = false;
			srcV.elem.classList.remove('linking');
		}
	}

	getVertexCenter(UID){
		let r = this._V[UID].elem.getBoundingClientRect();
		return [r.x + r.width/2,r.y + r.height/2];
	}

	drawLine(x1,y1,x2,y2){
		var newLine = document.createElementNS('http://www.w3.org/2000/svg','line');
		newLine.setAttribute('id','line2');
		newLine.setAttribute('x1',x1);
		newLine.setAttribute('y1',y1);
		newLine.setAttribute('x2',x2);
		newLine.setAttribute('y2',y2);
		newLine.setAttribute("stroke", "black");
		this._svg.appendChild(newLine);
		return newLine;
	}

	//todos
	mergeNetworks(N){
		//takes network N and merges with this network
		//will require a "connecting edge"
	}

	/*--------------------------------------------
	
	draggable stuff

	--------------------------------------------*/

	startDrag(){
        //set up starting coords for calculating drag change
        let tgt = event.target;
        this.mouseStartX = event.clientX;
        this.mouseStartY = event.clientY;

        

        const dragOffsets = event.target.getBoundingClientRect();
        const tgtStartX = dragOffsets.left;
        const tgtStartY = dragOffsets.top;

        tgt.dataset.startX = tgtStartX;
        tgt.dataset.startY = tgtStartY;

        //make it absolute but positioned exactly where it is
        const styleStr = 'left:'+tgtStartX+'px;top:'+tgtStartY+'px;';
        tgt.setAttribute('style',styleStr);
        tgt.classList.add('absolute');
        this.dragTarget = tgt;
        this.dragging = true;
    }

    onDrag(){
    	if(!this.dragging){return};
    	const x = event.clientX;// Get the horizontal coordinate
        const y = event.clientY;// Get the vertical coordinate
        //calculate mouse delta
        const deltaX = parseInt(this.dragTarget.dataset.startX) + x - this.mouseStartX;
        const deltaY = parseInt(this.dragTarget.dataset.startY) + y - this.mouseStartY;
        const styleStr = 'left:'+deltaX+'px;top:'+deltaY+'px;';
        this.dragTarget.setAttribute('style',styleStr);

        //shift lines to account for this
        const vertexUID = this.dragTarget.dataset.uid;
        let vertexData = this._V[vertexUID];
        const c = this.getVertexCenter(vertexUID);
        vertexData.out.forEach(d=>{
        	let line = this._A[d];
        	line.setAttribute('x1',c[0]);
			line.setAttribute('y1',c[1]);
        });

        vertexData.in.forEach(d=>{
        	let line = this._A[d];
        	line.setAttribute('x2',c[0]);
			line.setAttribute('y2',c[1]);
        });
    }
}




let N = new Network({
	svg:edgeTarget,
	vContainer:dashboard
})


new Beatrice({root:'button'}).class('addVertex').text('Add vertex').click(()=>{
	N.addVertex();
}).make(dashboard);


