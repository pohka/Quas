/**
 Component for creating and rendering HTML
*/
class Comp{
  /**
    @param {JSON} data
    Layout of data:
    {
      tag : "div",
      txt : "my text",
      data :
      {
        key : "value",
        url : "abc.com",
      }
      css :
      {
        height : "100px",
        "padding-top" : "20px",
      },
      on :
      {
        click : function(){},
        mouserover : function(){},
      },
      children :
      [
        {
          tag : "a",
          href : "abc.com",
          txt : "link",
        },
        {
          tag : "div",
          txt : "child 2",
        }
      ]
    }
  */
  constructor(data){
    this.data=data;
  }

  /**
    Adds a child to the children of this component
    if sel is undefined then it will append the child
    if sel is found then it insert it after that child
    if before is true then it will insert it before the selector
    @param {JSON} child
    @param {String} sel - (optional)
    @param {Boolean} before - (optional)
  */
  addChild(child, sel, before){
    if(this.data.children === undefined){
      this.data.children = [];
    }
    switch(sel){
      case undefined  : this.data.children.push(child); break;
      case "first"    : this.data.children.splice(0, 0, child); break;
      default         :
        let ch = sel.charAt(0);
        let str = sel.substr(1);
        let key;
        let isData = false;
        switch(ch){
          case "#" : key = "id";    break;
          case "." : key = "class"; break;
          default  :
            let a = sel.split(":");
            key = a[0];
            str = a[1];
            isData = true;
            break;
        }

        for(let i=0; i<this.data.children.length; i++){
          let c;
          if(!isData){
            c = this.data.children[i];
          }
          else{
            c = this.data.children[i].data;
          }

          if(c!=undefined && c[key] !== undefined && c[key]=== str){
            if(!before) i++;

            this.data.children.splice(i, 0, child);
            return;
          }
        }
        this.data.children.push(child);
    }
  }

  /**
    Insert HTML into the selector based on the data of this component
    If the type is undefined it will append the HTML
    append: adds HTML to the end
    prepend : adds HTML to the start
    set : overwrites the HTML
    @param {String|Element|HTMLElement} sel - See Quas.sel()
    @param {String} type - (optional) append/prepend/set
  */
  render(sel, type){
    let el;
    if(sel.constructor === Element){
      el = sel.el;
    }
    else if(sel.constructor !== String)
      el = sel;
    else
      el = Quas.sel(sel);
    Quas.addEl(el, this.data, type);
  }
}



/**
  Wrapper class for a dom element
*/
class Element{
  /**
    @param {HTMLElement} el
  */
  constructor(el){
    this.el = el;
  }

  /**
    Set or toggle the active class of this element
    If state is undefined it will toggle the state
   @param {Boolean} state - (optional)
  */
  active(state){
    let a = "active";
    if(state === undefined){
      state = !this.hasCls(a);
    }

    if(state && !this.hasCls(a)) this.addCls(a);
    else      this.delCls(a);
  }

  /**
    Creates and renders a new Comp for this element
    See Comp.render for type
    @param {JSON} data
    @param {String} type (optional)
  */
  addChild(data, type){
    if(type === undefined)
      type = "append";
    let c = new Comp(data);
    c.render(this.el, type);
  }

  clearChildren(){
    while(this.el.hasChildNodes())
      this.el.removeChild(this.el.childNodes[0])
  }

  /**
    Adds a class to this element
    @param {String} cls
  */
  addCls(cls){
    this.el.className += " " + cls;
  }

  /**
    Returns or sets an attribute for this element
    If a val is defined it sets the attr
    @param {String} key
    @param {String} val - (optional)
    @return {String} (undefined if the attribute doesn't exist)
  */
  attr(key, val){
    if(val !== undefined){
      this.el.setAttribute(key, val);
    }
    else{
      let a = this.el.getAttribute(key);
      if(a != null)
        return a;
      return undefined
    }
  }

  /**
    Returns or sets a data attribute
    @param {String} key
    @param {String} val - (optional)
    @return {String} (undefined if the data attribute doesn't exist)
  */
  data(key, val){
    return this.attr("data-"+key, val);
  }

  /**
    Removes this element
  */
  del(){
    this.el.remove();
  }

  /**
    Removes a class from this element
    @param {String} cls
  */
  delCls(cls){
    let arr = this.el.className.split(" ");
    let i = arr.length-1;
    let c = "";
    while(i > -1){
      if(arr[i] !== cls)
        c += arr[i] + " ";
      i--;
    }
    this.el.className = c.slice(0, -1);
  }

  /**
    Returns true if this element has a class that matches cls
    @param {String} cls
  */
  hasCls(cls){
    let arr = this.el.className.split(" ");
    let i = arr.length;
    while(i > 0){
      i--;
      if(arr[i] === cls)
        return true;
    }
    return false;
  }

  /**
    Returns or sets a HTML DOM property of the element
    If val is undefined it returns the value
    @param {String} key
    @param {String|Number} val - (optional)
    @return {String|Number}
  */
  prop(key, val){
    if(val === undefined){
      return this.el[key];
    }
    this.el[key] = val;
  }

  /**
    Vertically scrolls to the top of this element
  */
  scrollTo(){
    window.scrollTo(0,this.el.offsetTop);
  }

  /**
    Returns the text content of the element
  */
  text(val){
    if(val !==undefined){
      this.el.textContent = val;
    }
    else{
      return this.el.textContent;
    }
  }

  val(val){
    if(val===undefined){
      return this.prop("value");
    }
    this.prop("value", val);
  }

  /**
    Returns or set the visibility of an element
    use Quas.is
    Otherwise the visibility will be set to show
    @param {Boolean} show - (optional)
  */
  visible(show){
    //return value
    if(show === undefined){
      let v = window.getComputedStyle(this.el).display;
      return (v !== "none");
    }
    //set value
    else{
      if(show){
        this.el.style = "display: block !important;";
      }
      else{
        this.el.style = "display: none !important;";
      }
    }
  }

  toggleVisible(){
    this.visible(!this.visible());
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
    Recussive function to add a dom element and all of it's children
    @param {JSON} s - parent
    @param {String} d - selector
    @param {String} type - (optional) append/prepend/set
  */
  static addEl(s, d, type){
    if(s === undefined){
      return;
    }

    if(d.tag === undefined){
      var textnode = document.createTextNode(d.txt);
      s.appendChild(textnode);
      return;
    }
    let el = document.createElement(d.tag);
    if(d.txt !== undefined){
      let c = document.createTextNode(d["txt"]);
      el.appendChild(c);
    }
    for(let key in d){
      if(key === "css"){
        let v = "";
        for(let i in d.css){
          v += i + ":" + d.css[i] + ";";
        }
        el.setAttribute("style", v);
      }
      else if(key === "on"){
        for(let evnt in d[key]){
          el.addEventListener(evnt, d[key][evnt]);
        }
      }
      else if(key === "data"){
        for(let i in d.data){
          el.setAttribute("data-" + i, d.data[i]);
        }
      }
      else if(key !== "txt" && key !== "tag" && key !== "children"){
          el.setAttribute(key, d[key]);
      }
    }

    if(type === "prepend"){
      let first = s.firstElementChild;
      if(first !== undefined){
        s.insertBefore(el, s.childNodes[0]);
      }
      else {
        s.appendChild(el);
      }
    }
    else{
      if(type === "set"){
        while(s.firstChild) {
          s.removeChild(s.firstChild);
        }
      }
      s.appendChild(el);
    }

    //recussion for children
    if(d.children !== undefined){
      for(var i=0; i < d.children.length; i++){
        Quas.addEl(el , d.children[i]);
      }
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
  static browser(){
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

  static on(eventsStr, sel, callback){
    let el;
    if(sel.constructor === String){
      el = Quas.getEl(sel).el;
    }
    else{
      el = sel;
    }
    let events = eventsStr.split(" ");
    for(let i in events){
      el.addEventListener(events[i], callback);
    }
  }

  /*
    convert html string to json object
    todo:
      -nested attributtes
      -spacing in attributes
      -text after nested element
      -multiple depth
  */
  static convert(html){
    let els = [];
    let reg = new RegExp(/\<.*?\>/g,"");
    let flag = true;
    let el = null;
    let depth =0;

      while(flag){
        let match = html.match(reg);
        if(match != null){
          let tagEls = match[0].substr(1,match[0].length-2).split(" ");
          //closing tag
          if(tagEls[0].charAt(0) === "/"){
            //let text = html.substr(0,match.index);
            //target == parent
            let target = el;
            for(let d=0; d<depth; d++){
              if(d == depth -1){
                let text = html.substr(0,match.index);;
                target.children[target.children.length-1].txt = text;
              }
              else{
                target = target.children[target.children.length-1];
              }
            }
            depth--;
            if(depth==0){
              els.push(el);
              el = null;
            }
          }
          else{
            if(el == null){
              el = {
                 tag : tagEls[0],
                 children : []
              };
            }
            else{
              depth++;

              //target == parent
              let target = el;
              for(let d=0; d<depth; d++){
                if(d == depth -1){
                  target.children.push({
                    tag : tagEls[0],
                    children : []
                  });
                }
              }
              target.txt = html.substr(0,match.index);
            }
            tagEls.shift();

            //find and set the attributtes of this tag
            for(let i in tagEls){
              let attr = tagEls[i].split("=");
              if(attr.length == 1){
                attr.push("");
              }
              let target = el;
              for(let d=0; d<=depth; d++){
                if(d == depth){
                  target[attr[0]] = attr[1].substr(1,attr[1].length-2);
                }
                else{
                  target = target.children[target.children.length-1];
                }
              }
            }

          }
          html = html.substr(match.index + match[0].length);
        }
        else{
          flag = false;
        }
        //console.log(html.substr(match.index + match[0].length));
        //html = html.substr(match.index + match[0].length);
      }

      console.log(JSON.stringify(els));

    //   for(let m in matches){
    //     let tagEls = match[0].substr(1,match[0].length-2).split(" ");
    //     let el = {
    //        tag : tagEls[0]
    //     };
    //     tagEls.shift();
    //
    //     //find and set the attributtes of this tag
    //     for(let i in tagEls){
    //       let attr = tagEls[i].split("=");
    //       if(attr.length == 1){
    //         attr.push("");
    //       }
    //       el[attr[0]] = attr[1].substr(1,attr[1].length-2);
    //     }
    //
    //     let index = html.indexOf(match[1]) + match[0].length;
    //     html = html.substr(index);
    //     console.log(match);
    //     console.log(el);
    //   }
    //   else{
    //     flag=false;
    //   }
    //   flag = false;
    // }
  //  console.log(res);
    return els;
  }

  /**
    For each element with a matching selector call the callback
    @param {String} sel - See Quas.sel
    @param {Function(Element)} callback
  */
  static each(sel, callback){
    let els;
    if(sel.charAt(0) === "."){
      els = document.getElementsByClassName(sel.substr(1,sel.length-1));
    }
    else{
      els = document.getElementsByTagName(sel)
    }
    if(els.length > 0){
      for(let i=0; i<els.length; i++){
        callback(new Element(els[i]));
      }
    }
  }

  /**
    Turns a string array into an array JSON list items
    @param {String[]} items
    @return {JSON[]}
  */
  static genList(items){
    let list = [];
    for(let i in items){
      if(items[i].constructor === Array){
        list.push({
          tag : "ul",
          children : Quas.genList(items[i])
        })
      }
      else{
        list.push({
          tag : "li",
          txt : items[i]
        });
      }
    }
    return list;
  }

  /**
    Generates a table from string arrays
    if headings.length == 0 there will be no heading row on the table
    @param {String[]} headings
    @param {String[][]} rows
    @return {JSON[]}
  */
  static genTable(headings, rows){
    let table = [];
    if(headings.length > 0){
      let headingData = {
        tag : "tr",
        children : []
      }
      for(let h in headings){
        headingData.children.push({
          tag : "th",
          txt : headings[h]
        });
      }
      table.push(headingData);
    }
    for(let r=0; r<rows.length; r++){
      let rowData = {
        tag : "tr",
        children : []
      };
      for(let i in rows[r]){
        rowData.children.push({
          tag : "td",
          txt : rows[r][i]
        });
      }
      table.push(rowData);
    }
    return table;
  }

  /**
    Returns the element for the selector
    @param {String} sel
    @return {Element} - undefined if not found
  */
  static getEl(sel){
    let el = Quas.sel(sel);
    if(el != null)
      return new Element(el);
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
    Finds an element in the document and returns it
    .class - returns the all the elements with a matching class
    #id - returns an element with the matching id
    html - returns the document element
    body - retruns the document body element
    Otherwise it returns the elements with a matching tag
    @return {HTMLElement}
  */
  static sel(str){
    let ch = str.charAt(0);
    if(ch === "."){
      let els =  document.getElementsByClassName(str.substr(1,str.length-1));
      if(els.length > 0)
        return els[0];
    }
    else if(ch === "#"){
      return document.getElementById(str.substr(1,str.length-1));
    }
    else if(str === "html"){
      return document.documentElement;
    }
    else if(str === "body"){
      return document.body;
    }
    else{
      let els = document.getElementsByTagName(str);
      if(els.length > 0)
        return els[0];
    }
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
