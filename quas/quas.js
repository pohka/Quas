/**
 Component for creating and rendering HTML
*/
class Comp{
  /**
    @param {String, JSON, String} data
    */
  constructor(tag, attrs, txt, children){
    this.tag=tag;

    if(attrs !== undefined){
      this.attrs = attrs;
    }
    else{
      this.attrs = {};
    }

    if(txt !== undefined){
      this.txt = txt;
    }

    if(children !== undefined){
      this.children = children;
    }
    else {
      this.children = [];
    }
  }

  addChild(tag, attrs, txt){
    this.children.push({
      tag : tag,
      attrs : attrs,
      txt : txt,
      children : []
    });
    return this.children[this.children.length-1];
  }

  /**
    Insert HTML into the selector based on the data of this component
    If the type is undefined it will append the HTML
    append: adds HTML to the end
    prepend : adds HTML to the start
    set : overwrites the HTML
    @param {String|HTMLDOMElement} sel - See Quas.sel()
    @param {String} type - (optional) append/prepend/set
  */
  render(sel){
    let e;
    if(sel.constructor !== String){ //HTMLElement
      e = sel;
    }
    else{ //String
      e = document.querySelector(sel);
    }
    let root = e.addEl(this.tag,this.attrs, this.txt);
    renderChildren(root, this.children);
    return root;
  }

  renderChildren(root, children){
    for(let i in children){
      let el = root.addEl(
        children[i].tag,
        children[i].attrs,
        children[i].txt);
      for(let c in children[i].children){
        renderChildren(el, children[c].children);
      }
    }
  }
}

//add a child element, (type=append/prepend) retruns element created
HTMLElement.prototype.addEl = function(tag, attrs, txt, type){
    let e = document.createElement(tag);
    console.log(e);
    for(let a in attrs){
      e.setAttribute(a, attrs[a]);
    }
    if(txt!==undefined){
      e.textContent = txt;
    }

  if(type === undefined || type=="append"){
    this.appendChild(e);
  }
  else if(type === "prepend"){
    this.insertBefore(e, this.childNodes[0]);
  }
  return e;
}

//get or set attribute
HTMLElement.prototype.attr = function(key, val){
  if(val !== undefined){
    this.setAttribute(key, val);
  }
  else{
    let a = this.getAttribute(key);
    if(a != null)
      return a;
    return undefined
  }
}

//set or get the text content
HTMLElement.prototype.text = function(txt){
  if(txt === undefined)
    return this.textContent;
  this.textContent = txt;
}

//set or get the value
HTMLElement.prototype.val = function(v){
  if(v === undefined)
    return this.getAttribute("value");
  this.setAttribute("value", v);
}

//removes all child nodes
HTMLElement.prototype.clearChildren = function(){
  while(this.hasChildNodes())
    this.removeChild(this.childNodes[0])
}

//adds a class
HTMLElement.prototype.addCls = function(c){
  this.className += " " + c;
}

//returns true if this element has the given class
HTMLElement.prototype.hasCls = function(c){
  let arr = this.className.split(" ");
  return (arr.indexOf(c) > -1);
}

//get or set a data attribute
HTMLElement.prototype.data = function(key, val){
  return this.attr("data-"+key, val);
}

//removes the element
HTMLElement.prototype.del = function(){
  this.remove();
}

//removes a class from this element
HTMLElement.prototype.delCls = function(c){
  let arr = this.className.split(" ");
  let i = arr.indexOf(c);
  if(i>-1){
    arr.splice(i,1);
  }
  this.className = arr.join(" ");
}


/**
  Vertically scrolls to the top of this element
  won't work if you call in Quas.start
*/
HTMLElement.prototype.scrollTo = function(){
  window.scrollTo(0,this.offsetTop);
}

//toggle/set visiblity (type=display type i.e. block, inline-block)
HTMLElement.prototype.visible = function(show, type){
  //toggle visiblity
  if(show === undefined){
    show = !this.isVisible();
  }
  if(show && type === undefined){
    type = "block";
  }
  //set style
  if(show){
    this.style = "display: "+type+" !important;";
  }
  else{
    this.style = "display: none !important;";
  }
}

//returns true if the element is visible
HTMLElement.prototype.isVisible = function(){
  return (window.getComputedStyle(this).display !== "none");
}

//add event listener(s)s to this element
HTMLElement.prototype.on = function(eventsStr, callback){
  let arr = eventsStr.split(" ");
  for(let i in arr){
    this.addEventListener(arr[i], callback);
  }
}

//removes event listener(s)
HTMLElement.prototype.off = function(eventsStr, callback){
  let arr = eventsStr.split(" ");
  for(let i in arr){
    this.removeEventListener(arr[i], callback);
  }
}


/**
  Static class for library functions
*/
class Quas{

  static makeComps(c, fields){
    let  comps =  [];
    for(let i in fields){
      comps.push(new c(fields[i]));
    }
    return comps;
  }

  static makeCompsAndRender(c, sel, fields){
    let comps = Quas.makeComps(c, fields);
    for(let i in comps){
      comps[i].render(sel);
    }
  }

  /**
    Ajax request
    @param {JSON} req - request data
    Layout of req:
    {
      url : "login.php",
      type : "POST",
      data : {
        key : "value"
      },
      return : "json",
      success : function(result){},
      error : function(errorMsg, errorCode){}
    }
  */
  static ajax(req){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          if(req.success!==undefined){
            let result;
            if(req.return === undefined){
              result = this.responseText;
            }
            else{
              let returnType = req.return.toLowerCase();
              switch(returnType){
                case "json" :
                  try {
                    result = JSON.parse(this.responseText);
                  } catch(e){
                    result = "Failed to parse return text to JSON:\n" + this.responseText;
                  }
                  break;
              }
            }

            req.success(result);
          }
        }
        else if(this.readyState == 4){
          if(req.error !== undefined){
            req.error(this.statusText, this.status);
          }
        }
    };
    let str = req.url + "?";
    let i = 0;
    if(req.data!==undefined){
      for(let key in req.data){
        str += key + "=" + encodeURIComponent(req.data[key]) + "&"
      }
    }
    xhr.open(req.type, str.slice(0,-1), true);
    //xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    //var contentType = "multipart/form-data; boundary=" + boundary;
    //xhr.setRequestHeader("Content-Type", contentType);

    //file uploading
    if(req.data !== undefined && req.data.constructor === FormData){
      xhr.send(req.data);
    }
    else{
      xhr.send();
    }
  }

  /**
    Returns a json object with the browser info
    name - browser name,
    version - browser version,
    isMobile - true if a mobile browser
    @return {JSON}
  */
  static browserInfo(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
        return {name:'IE ',version:(tem[1]||'')};
        }
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1],
      isMobile : /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
  }

  /**
    For each element with a matching selector call the callback
    @param {String} sel
    @param {Function(HTMLDOMElement)} callback
  */
  static each(sel, callback){
    [].forEach.call(document.querySelectorAll(sel), callback);
  }

  /**
    Turns a string array into an array JSON list items
    @param {String[]} items
    @return {JSON[]}
  */
  static genList(items, attrs){
    if(attrs === undefined){
      attrs = {};
    }
    let c = new Comp(
      "ul",
      attrs,
    );
    for(let i in items){
      c.addChild("li", {}, items[i]);
    }
    return c;
  }

  /**
    Generates a table from string arrays
    if headings.length == 0 there will be no heading row on the table
    @param {String[]} headings
    @param {String[][]} rows
    @return {JSON[]}
  */
  static genTable(headings, rows, attrs){
    if(attrs === undefined){
      attrs = {};
    }
    let t = new Comp(
      "table",
      attrs,
    );
    let h = t.addChild("tr");
    for(let c=0; c<headings.length; c++){
      h.children.push({
        tag : "th",
        attrs : {},
        txt : headings[c]
      });
    }

    for(let r = 0; r < rows.length; r++){
      let row = t.addChild("tr");
      for(let c=0; c < rows[r].length; c++){
        row.children.push({
          tag : "td",
          attrs : {},
          txt : rows[r][c]
        });
      }
    }

    return t;
  }

  /**
    Returns the element for the selector
    @param {String} sel
    @return {Element} - undefined if not found
  */
  static getEl(sel){
    let r = document.querySelector(sel);
    if(r == null)
      return undefined;
    return r;
  }

  /**
    Returns the data from the url in as a JSON object
    @return {JSON}
  */
  static getUrlValues(){
    let str = window.location.search;
    if(str.charAt(0)=="?"){
      str = str.substr(1, str.length-1);
    }
    let variables = str.split("&");
    let data = {};
    for(let i = 0; i<variables.length; i++){
      if(variables[i]!==""){
        let item = variables[i].split("=");
        data[item[0]] = decodeURI(item[1]);
      }
    }
    return data;
  }

  /**
    Helper function to prevent default events
    @param {Event}
  */
  static preventDefault(e) {
   e = e || window.event;
   if (e.preventDefault)
       e.preventDefault();
   e.returnValue = false;
  }

  /**
    Helper function to prevent default events
    @param {Event}
  */
  static preventDefaultForScrollKeys(e) {
     if (Quas.scrollKeys[e.keyCode]) {
         preventDefault(e);
         return false;
     }
  }

  /**
    Toggle or set users ability to scroll
    If enabled is undefined then the scroll ability will be toggled
    @param {Boolean} enabled - (optional)
  */
  static scrollable(enabled){
    if(enabled === undefined){
      enabled = !Quas.isScrollable;
    }
    if(enabled){
      if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', Quas.preventDefault, false);
      window.onmousewheel = document.onmousewheel = null;
      window.onwheel = null;
      window.ontouchmove = null;
      document.onkeydown = null;
    }
    else{
      if (window.addEventListener) // older FF
          window.addEventListener('DOMMouseScroll', Quas.preventDefault, false);
      window.onwheel = Quas.preventDefault; // modern standard
      window.onmousewheel = document.onmousewheel = Quas.preventDefault; // older browsers, IE
      window.ontouchmove  = Quas.preventDefault; // mobile
      document.onkeydown  = Quas.preventDefaultForScrollKeys;
    }
    Quas.isScrollable = enabled;
  }

  /**
    Reloads the page and set or change variables in the url
    If the value === "" then the value is removed form the url
    Values will be encoded so they are allowed to have spaces
    @param {JSON} newVals
  */
  static setUrlValues(newVals){
    let data = Quas.getUrlValues();
    for(let key in newVals){
      data[key] = encodeURI(newVals[key]);
    }
    let str = "?";
    for(let key in data){
      if(data[key] !== "")
        str += key + "=" + data[key] + "&";
    }
    str = str.slice(0,-1);
    window.location = window.origin + window.location.pathname + str;
  }

  static decodeHtmlSpecialChars(str){
    str = str.split("&amp;").join("&");
    str = str.split("&quot;").join('"');
    str = str.split("&#039;").join("'");
    str = str.split("&lt;").join("<");
    str = str.split("&gt;").join(">");
    return str;
  }

  static enableScrollTracker(callback){
    Quas.on("scroll", window, function(){
      let viewport = {
        top : window.scrollY,
        bottom : window.scrollY + window.innerHeight
      };
      callback(viewport);
    });
  }
}
/**
  Current state of the users ability to scroll
*/
Quas.isScrollable = true;

/**
  Keys codes that can scroll
*/
Quas.scrollKeys = {37: 1, 38: 1, 39: 1, 40: 1};

Quas.path;
window.onload = function(){
  Quas.path = location.pathname.substr(1);
  Quas.start();
}
