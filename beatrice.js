function post(url = '', data = {}) {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'cache-control': 'no-cache'
        },
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => response.json()); // parses JSON response into native Javascript objects 
}

function get(url = '') {
    return fetch(url, {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        cache:'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json()); // parses JSON response into native Javascript objects 
}

// I don't like set timeout 
// so I wrapped it 
const delay = (f)=>{
    let delayObject = {
        f:f,
        for:function(ms){
            setTimeout(this.f,ms);
        }
    };
    return delayObject;
}

//manage "windows"
let W = {
    fadeTime:0.4,
    //window system uses a double-linked list to maintain state
    head:null,
    tail:null,
    bas:null,
    currentWindow:null,
    setBar:function(barElem) {
        this.bar = barElem
    },
    esc:function(){
        console.log('close currentWindow and update linked list structure')
    },
    addEsc:function(escapeHandler){
        this.escapables.push(escapeHandler);
    },

    fadeRemove:function(elem){
        elem.style.opacity = 0;
        delay(()=>{
            elem.remove();
        }).for(this.fadeTime*1000);
    },

    lbox:function(opts){
        let tgt = opts.tgt || false;
        const padding = opts.padding || false;
        const includeHeader = opts.hasOwnProperty('header')? opts.header : true;
        const headerText = opts.headerText || '';
        let lboxData = {};

        //add some methods
        lboxData.fadeInto = function(tgt){
            tgt.appendChild(this.root);
            delay(()=>{
                this.root.style.opacity = 1;
            }).for(10);
        };

        new H().part({root:'div'})
        .ex(elem=>{
            //transition effect stuff
            elem.style.opacity = 0;
            elem.style.transition = this.fadeTime+'s';
            lboxData.root = elem;
            this.addEsc(()=>{
                this.fadeRemove(elem);
            });
        })
        .click(e=>{
            let elem = e.target;
            this.fadeRemove(elem);
        })
        .if(padding,(iH)=>{
            iH.styles({padding:padding});
        })
        .class('lbox')
            .div().noProp().kids()
                .if(includeHeader,(headerH)=>{
                    headerH.div().class('header').kids()
                        .span().text(headerText+'   ')
                        .if(opts.includeHeader,(minimizeH)=>{
                            minimizeH.button({text:'_'})
                        })
                        .button().click(()=>{
                            let elem = lboxData.root;
                            this.fadeRemove(elem);
                            //remove the escapable for this lbox from the list
                            this.escapables.pop();
                        }).text('X')
                    .pop()//end lbox header
                })//end .if(...)
                .div().class('body').ex(elem=>{lboxData.body = elem;})
            .pop()
        .make(tgt);
        return lboxData;
    },
    init:function(){
        document.body.addEventListener('keyup',(e)=>{
            if(e.keycode==27||e.which==27){
                this.esc();
            }
        });
    }
};

W.init();

const isEnter = (e)=>{
    if(e.keycode==13||e.which==13){
        return true;
    }else{
        return false;
    }
};

//super petite micro version of H for quick "one off elems"
const mu = (elem)=>{
    return {
        elem:document.createElement(elem),
        on:function(event,f){
            this.elem.addEventListener(event,f);
        }
    }
};
//what a drag... another drag class....
//currently only draggable relative to a parent
/*
class Drag{
    constructor(opts){

        //the element unto which we will click
        //in order to drag
        this.anchorElem = opts.anchorElem;
        this.anchorElem.addEventListener('mousedown',this.startDrag.bind(this));
        
        //element that we want to drag
        this.dragElem = opts.dragElem;

        // make sure the parent is relative
        this.dragParent = this.dragElem.parentNode;
        this.dragParent.classList.add('relative');
        //put the mouseup on THE PARENT
        //MAKE SURE THE PARENT HAS THE DIMENSIONS YOU WANT LIKE 100%X100%
        this.dragParent.addEventListener('mouseup',this.endDrag.bind(this))

        //optional cascade fuctionality
        //example positioning svg line connectors behind drag elems
        this.cascade = opts.cascade || false;
    }

    startDrag(){
        //set up starting coords for calculating drag change
        this.mouseStartX = event.clientX;
        this.mouseStartY = event.clientY;

        

        let dragOffsets = this.dragElem.getBoundingClientRect();
        this.dragElemStartX = dragOffsets.left;
        this.dragElemStartY = dragOffsets.top;

        

        //make it absolute but positioned exactly where it is
        const styleStr = 'left:'+this.dragElemStartX+'px;top:'+this.dragElemStartY+'px;';
        this.dragElem.setAttribute('style',styleStr);
        this.dragElem.classList.add('absolute');

        //add ondrag even listenr to the parent
        this.dragParent.addEventListener('mousemove',this.onDrag.bind(this));
        this.dragging = true;

        if(this.cascade){
            this.cascade(this,'startDrag');
        }
    }

    onDrag(event){
        if( !this.dragging){return}
        
        const x = event.clientX;// Get the horizontal coordinate
        const y = event.clientY;// Get the vertical coordinate

        //calculate mouse delta
        const deltaX = this.dragElemStartX + x - this.mouseStartX;
        const deltaY = this.dragElemStartY + y - this.mouseStartY;
        //add the deltas to this for cascading
        this.deltaX = deltaX;
        this.deltaY = deltaY;
        const styleStr = 'left:'+deltaX+'px;top:'+deltaY+'px;';
        this.dragElem.setAttribute('style',styleStr);
        
        if(this.cascade){
            this.cascade(this,'onDrag');
        }
    }

    endDrag(){
        this.dragging=false;
    }

    destroy(){
        console.log('currently removing the event listeners is not working');
        console.log('it definitly has to do with the methods...');
    }
};
*/





class Beatrice{
    constructor(opts={}){
        this.bindingObject = opts.bindObj || {};
        this.proxy = new Proxy(this, {
            get (receiver, name) {
                return name in receiver ? receiver[name] : receiver.makeElem(name);
            }
        });
        this.rootWasProvided = false;
        this.root = null;


         //starts the widget
        //def - definition dict
        //default to a div
        opts.root = opts.root || 'div';
        const rootType = typeof opts.root;

        if(rootType==='string'){
            this.root = document.createElement(opts.root);
        }else if(rootType==='object'){
            this.root = opts.root;
            this.rootWasProvided = true;
        }else{
            console.log('rootType not support must be element object or string');
        }
        let root = this.root;
        this.currentElem = root;
        this.currentScopeElem = root;

        if(opts.id){
            this.root.id = opts.id;
        }

        return this.proxy;
    }

    setStyles(elem,styles){
        for(let style in styles){
            const val = styles[style];
            elem.style[style] = val;
        }
    }

    styles(styles){
        this.setStyles(this.currentElem,styles);
        return this.proxy;
    }

    setAtts(atts){
        //log(atts);
        for(let att in atts){

            const val = atts[att];

            switch(att){
                case 'styles':
                    this.setStyles(this.currentElem,val);
                break;

                case 'text':
                    this.currentElem.innerText = val;
                break;

                default:
                   this.currentElem.setAttribute(att,val);
            }//end switch

        }
        return this.proxy;
    }//end setAtts

    class(classes){
        this.currentElem.setAttribute('class',classes);
        return this.proxy;
    }

    text(txt){
        this.currentElem.innerText = txt;
        return this.proxy;
    }

    value(val){
        this.currentElem.value = val;
        return this.proxy;
    }

    placeholder(val){
        this.currentElem.placeholder = val;
        return this.proxy;
    }

    id(id) {
        this.currentElem.id = id;
        return this.proxy;
    }

    kids(){
        this.currentScopeElem=this.currentElem;
        return this.proxy;
    }

    pop(){
        this.currentScopeElem = this.currentScopeElem.parentElement;
        this.currentElem = this.currentScopeElem;
        return this.proxy;
    }

    on(eventName,f){
        let wrappedF = (e)=>{
            f(e);
        };
        if(typeof eventName =='string'){
            this.currentElem.addEventListener(eventName,wrappedF);
        }else{
            //trigger for multiple events
            for (var i = eventName.length - 1; i >= 0; i--) {
                this.currentElem.addEventListener(eventName[i],wrappedF);
            }
        }
        
        return this.proxy;
    }

    if(cond,f){
        if(cond){
            f(this);
        }
        return this;
    }

    keyup(f){
        return this.on('keyup',f);
    }

    onEnter(f){
        return this.keyup((e)=>{
            if(isEnter(e)){
                f(e);
            }
        });
    }

    noProp(){
        this.currentElem.addEventListener('click',(e)=>{
            e.stopPropagation();
        });
        return this;
    }

    click(f){
        return this.on('click',f);
    }

    //if for what ever reason we need somthing for 
    //"external" purposes
    //eg: using current elem with quill
    ex(f){
        f(this.currentElem);
        return this.proxy;
    }

    getBind(f){
        f(this.bindingObject)
        return this.proxy;
    }

    bind(key){
        this.bindingObject[key] = this.currentElem;
        return this.proxy;
    }

    //do some other stuff without interupting 
    //the chain
    interlude(f) {
        f();
        return this;
    }

    iH(f) {
       f(this);
       return this.proxy;
    }

    map(data,f){
        const len = data.length;
        this.kids();
        for (var i = 0; i < len; i++) {
            f(this,data[i],this.currentElem);
        }
        return this.pop();
    }

    makeElem(elem){
        elem = document.createElement(elem);
        this.currentScopeElem.appendChild(elem);
        this.currentElem = elem;
        //we return the method so that
        //the syntax .elem() is valid
        return this.setAtts;
    }

    reset(){
        this.root = null;
        this.currentScopeElem = null;
        this.currentElem = null;
        this.widget = null;
    }

    make(tgt,ow){
        tgt = tgt || false;
        //overwrite
        if(ow){
            tgt.innerHTML = '';
        }
        if(this.rootWasProvided){
            console.log('the root was provided so do not use make use .end()');
            return this.end();
        }
        //ends widget and resets to defaults
        //if no target is provided simple return the made element
        if(tgt){
            tgt.appendChild(this.root);
            this.reset();
        }else{
            let toReturn = this.root;
            this.reset();
            return toReturn;
        }
    }

    obj(){
        return this.bindingObject;
    }

    insertAt(tgt,index){
        const kidsCount = tgt.children.length;
        if(kidsCount==0||index==kidsCount){
            tgt.appendChild(this.root);
        }else {
            tgt.insertBefore(this.root,tgt.children[index]);
        }
    }
};