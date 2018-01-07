class Comp{
  constructor(data){
    this.data=data;
  }

  //adds a child to the children of this component
  //if the selector is defined then it will insert it after that child
  //if before is true then it will insert it before the selector
  //sel = key:val; will add after child with matching data type
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

  //render the html
  render(sel, type){
    let el;
    if(sel.constructor !== String)
      el = sel;
    else
      el = Bwe.sel(sel);
    Bwe.addEl(el, this.data, type);
  }
}



//wrapper class for a dom element
class Element{
  constructor(el){
    this.el = el;
  }

  //set or toggle the active class of this element
  //if state is undefined it will toggle the state
  active(state){
    let a = "active";
    if(state === undefined){
      state = !this.hasCls(a);
    }

    if(state) this.addCls(a);
    else      this.delCls(a);
  }

  //creates and renders a new component
  //types: set/append/prepend (undefined=set)
  addChild(json, type){
    if(type === undefined)
      type = "append";
    let c = new Comp(json);
    c.render(this.el, type);
  }

  //adds a class to this element
  addCls(cls){
    this.el.className += " " + cls;
  }

  //returns an attribute for this element
  //if a value is defined it sets the attr
  //returns null if the attribute doesn't exist
  attr(key, val){
    if(val !== undefined){
      this.el.setAttribute(key, val);
      return undefined;
    }
    else
      return this.el.getAttribute(key);
  }

  //sets/returns a data attribute
  data(key, val){
    let data = this.attr("data-"+key, val);
    if(data != null)
      return data;
  }

  //removes this element
  del(){
    this.el.remove();
  }

  //removes a class from this element
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

  //returns true/false if this element has the class
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

  //returns or sets a property of the element
  prop(key, val){
    if(val === undefined){
      return this.el[key];
    }
    else this.el[key] = val;
  }

  //vertical scrolls to the top of this element
  scrollTo(){
    window.scrollTo(0,this.el.offsetTop);
  }

  //returns the text content of the element
  text(){
    return this.el.textContent;
  }

  //returns or set the visibility of an element
  visible(show){
    let v = this.el.style.visibility;
    //return value
    if(show === undefined){
      return (v === "" || v === "visible");
    }
    //set value
    else{
      if(show){
        this.el.style.visibility = "visible";
      }
      else{
        this.el.style.visibility = "hidden";
      }
    }
  }
}

class Bwe{
  //recussive function to a dom element and all of it's children
  //json,selector,before/after
  static addEl(s, d, type){
    //s is the parent element
    if(s === undefined){
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
      console.log(s);
      if(first !== undefined){
        s.insertBefore(el, s.childNodes[0]);
      }
      else {
        s.appendChild(el);
      }
    }
    else{
      if(type === "set"){
        s.innerHTML = "";
      }
      s.appendChild(el);
    }

    //recussion for children
    if(d.children !== undefined){
      for(var i=0; i < d.children.length; i++){
        Bwe.addEl(el , d.children[i]);
      }
    }
  }

  //ajax requests
  static ajax(req){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          if(req.success!==undefined)
            req.success(this.responseText);
        }
        else if(this.readyState == 4){
          if(req.error !== undefined){
            req.error(this.statusText, this.status);
          }
        }
    };
    let str = req.url + "?";
    let i = 0;
    for(let key in req.data){
      str += key + "=" + req.data[key] + "&"
    }
    xmlhttp.open(req.type, str.slice(0,-1), true);
    xmlhttp.send();
  }

  //returns a json object with the browser name and version
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

  //call the callback for each dom element
  static each(str, callback){
    let els;
    if(str.charAt(0) === "."){
      els = document.getElementsByClassName(str.substr(1,str.length-1));
    }
    else{
      els = document.getElementsByTagName(str)
    }
    if(els.length > 0){
      for(let i=0; i<els.length; i++){
        callback(new Element(els[i]));
      }
    }
  }

  //turns a string array into json data using a default template
  static genList(items){
    let list = [];
    for(let i in items){
      list.push({
        tag : "li",
        txt : items[i]
      });
    }
    return list;
  }

  //generates a table from string arrays
  //if headings.length == 0 there will be no heading row on the table
  //rowss is 2D array
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

  //returns the element for this object
  //returns undefined if not found
  static getEl(str){
    let el = Bwe.sel(str);
    if(el != null)
      return new Element(el);
  }

  //returns the data from the url in as a json object
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

  static preventDefault(e) {
   e = e || window.event;
   if (e.preventDefault)
       e.preventDefault();
   e.returnValue = false;
  }
  static preventDefaultForScrollKeys(e) {
     if (Bwe.scrollKeys[e.keyCode]) {
         preventDefault(e);
         return false;
     }
  }

  //toggle users ability to scroll
  static scrollable(enabled){
    if(enabled === undefined){
      enabled = !Bwe.isScrollable;
    }
    if(enabled){
      if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', Bwe.preventDefault, false);
      window.onmousewheel = document.onmousewheel = null;
      window.onwheel = null;
      window.ontouchmove = null;
      document.onkeydown = null;
    }
    else{
      if (window.addEventListener) // older FF
          window.addEventListener('DOMMouseScroll', Bwe.preventDefault, false);
      window.onwheel = Bwe.preventDefault; // modern standard
      window.onmousewheel = document.onmousewheel = Bwe.preventDefault; // older browsers, IE
      window.ontouchmove  = Bwe.preventDefault; // mobile
      document.onkeydown  = Bwe.preventDefaultForScrollKeys;
    }
    Bwe.isScrollable = enabled;
  }

  //return the selector for the document element
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

  //reloads the page and set or change variables in the url
  //if the value === "" then the value is removed form the url
  //values will be encoded
  static setUrlValues(newVals){
    let data = Bwe.getUrlValues();
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
}
Bwe.isScrollable = true;
Bwe.scrollKeys = {37: 1, 38: 1, 39: 1, 40: 1};
