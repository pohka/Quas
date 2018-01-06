//library
class Bwe{
  constructor(data){
    this.data=data;
  }

  //adds a child to the children of this object
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

  //deep copy of this object
  clone(){
    return new Bwe(Bwe.clone(this.data));
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

  //returns an attribute for this element
  attr(key){
    return this.el.getAttribute(key);
  }

  //returns the text content of the element
  text(){
    return this.el.textContent;
  }

  //returns the json data for this element
  elData(){
    let wrap = document.createElement('div');
    wrap.appendChild(this.el.cloneNode(true));
    return Bwe.makeData(wrap.innerHTML);
  }

  //removes this element
  del(){
    this.el.remove();
  }

  addClass(){
    console.log(this.el.className);
  }

  //appen or set the html2json
  //types: set/append/prepend (undefined=set)
  html(json, type){
    if(type === undefined)
      type = "set";
    new Bwe(json).render(this.el, type);
  }
}

//returns the element for this object
Bwe.getEl = function(str, type){
  return new Element(Bwe.sel(str));
}

//add to a dom element and all of it's children
Bwe.addEl = function(s, d, type){
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
    if( key !== "con" && key !== "data" && key !== "tag" &&
        key !== "children" && key!="on"){
        el.setAttribute(key, d[key]);
    }
    else if(key === "data"){
      for(let i in d.data){
        el.setAttribute("data-" + i, d.data[i]);
      }
    }
    else if(key === "on"){
      for(let evnt in d[key]){
        el.addEventListener(evnt, d[key][evnt]);
      }
    }
  }

  if(type === "prepend"){
    let first = s.firstElementChild;
    if(first !== undefined){
      let tmp = s.innerHTML;
      s.innerHTML = "";
      s.appendChild(el);
      s.innerHTML += tmp;
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

//return the selector for the document element
Bwe.sel = function(str){
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

//call the callback for each dom element
Bwe.each = function(str, callback){
  let els;
  if(sel.charAt(0) === "."){
    els = document.getElementsByClassName(str.substr(1,str.length-1));
  }
  else{
    els = document.getElementsByTagName(str)
  }
  if(els.length > 0){
    for(let i in els){
      callback(els[i]);
    }
  }
}

//builds a html string from the json
Bwe.build = function(tags){
  if(tags.constructor !== Array){
    var tags = [tags];
  }
  let res = "";
  for(let tag in tags){
    let kv = tags[tag];
    res += "<" + kv["tag"];

    for(var i in Bwe.identifiers){
      var key = Bwe.identifiers[i];
      if(kv[key] != undefined && key!=="data"){
        res += " " + key + "='" + kv[key] + "'";
      }
    }

    for(var i in Bwe.idendifiersNoVal){
      var key = Bwe.idendifiersNoVal[i];
      if(kv[key] != undefined){
        res += " " + key;
      }
    }

    if(kv["data"] != undefined){
      for(var key in kv["data"]){
          res += " data-" + key + "='" + kv["data"][key] + "'";
      }
    }

    var requiresClosingTag = $.inArray(kv["tag"], Bwe.noClosingTag);

    if(requiresClosingTag != -1){
      res += ">";
    }
    else{
      res += ">";
    }

    if(kv["txt"] != undefined){
      res += kv["txt"];
    }
    for(var i in kv["children"]){
      res+= Bwe.build(kv["children"][i]);
    }

    if(requiresClosingTag == -1){
      res += "</" + kv["tag"] + ">\n";
    }
  }
  return res;
}


//converts a html string to json
Bwe.makeData = function(html){
  var start = 0;
  var openQuote = false;
  var openSingleQuote = false;
  var openDoubleQuote = false;
  var isClosing = false;
  let readContent = false;
  var attr = ""; //characters of the current atttribute
  var ch; //the current character
  var attrs = []; //all the parsed attributes as strings
  var tags = []; //a list json objects for tags
  var activeParentIndex = -1;
  var childDepth = -1;
  var childIndexes = [];
  let content = "";
  for(var i=0; i<html.length; i++){
    var ch = html.charAt(i);
    if(ch === "<"){
      start = i;
      if(html.charAt(i+1) === "/"){
        isClosing = true;
        tags[tags.length-1]["txt"] = content
        content = "";
        readContent=false;
      }
    }
    else if(ch === ">"){
      if(attr !== ""){
        attrs.push(attr);
        attr = "";
      }
      var json = Bwe.makeFromAttrs(attrs);
      attrs = [];
      //opening tag
      if(!isClosing){
        readContent = true;
        childDepth += 1;
        //root tag
        if(childDepth == 0){
          tags.push(json);
          activeParentIndex += 1;
        }
        //child tag
        else{
          //add childIndex if it doesnt exist
          if(childIndexes.length <= childDepth){
            childIndexes.push(0);
          }
          else{
            childIndexes[childDepth] += 1;
          }

          var parent = tags[activeParentIndex];
          for(var c = 0; c < childDepth-1; c++){
            var index = childIndexes[c];
            if(!("children" in parent)){
              parent["children"] = [];
            }
            parent = parent["children"][index];
          }
          if(!parent.hasOwnProperty("children")){
            parent["children"] = [];
          }
         parent["children"].push(json);

         if($.inArray(json["tag"], Bwe.noClosingTag) == false){
           childIndexes[childDepth] = -1;
           childDepth -= 1;
           childIndexes[childDepth] += 1;
           isClosing=false;
         }
        }
      }
      //closing tag
      else{
        childIndexes[childDepth] = -1;
        childDepth -= 1;
        childIndexes[childDepth] += 1;
        isClosing=false;
      }
    }
    else if(readContent){
      content += ch;
    }
    else if(ch == "\'"){
      openSingleQuote = !openSingleQuote
      if(openDoubleQuote == false && openSingleQuote == true){
        openQuote = true;
      }
      else if(openSingleQuote == false){
        openQuote = false;
      }
    }
    else if(ch == "\""){
      openDoubleQuote = !openDoubleQuote;
      if(openDoubleQuote == true && openSingleQuote == false){
        openQuote = true;
      }
      else if(openDoubleQuote == false){
        openQuote = false;
      }
    }
    else if(!isClosing){
      if(openQuote == false && ((ch == ' ') || (ch == '\t') || (ch == '\n'))){
        if(attr !== ""){
          attrs.push(attr);
          attr = "";
        }
      }
      else{
        attr += ch;
      }
    }
  }
  return tags;
}

//makes a json object from attribute strings
Bwe.makeFromAttrs = function(attrs){
  var json = {
    tag : attrs[0]
  };
  for(var i=1; i<attrs.length; i++){
    if(attrs[i].indexOf("=") > -1){
      var els = attrs[i].split("=");
      if(els[0].indexOf("data-") > -1){
        let key = els[0].replace("data-", "");
        if(json["data"] === undefined){
          json["data"] = {};
        }
        json["data"][key] = els[1];
      }
      else{
        json[els[0]] = els[1].replace(/"/g , "");
      }
    }
    else if(Bwe.idendifiersNoVal.indexOf(attrs[i]) > -1){
      json[attrs[i]] = "";
    }
    else{
      if(!json.hasOwnProperty("txt")){
        json["txt"] = "";
      }
      json["txt"] += attrs[i];
    }
  }
  return json;
}

//turns a string array into json data using a default template
Bwe.genList = function(items){
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
Bwe.genTable = function(headings, rows){
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

//clones a json object
Bwe.clone = function(data){
  let json = {};
  for(let key in data){

    if(key === "children"){
      json[key] = [];
      for(let child in data[key]){
        json[key].push(Bwe.clone(data[key][child]));
      }
    }
    else if(key === "on"){
      json[key] = [];
        for(let evnt in data[key]){
          json[key].push(data[key][evnt]);
        }
    }
    else{
      json[key] = data[key];
    }
  }
  return json;
}

//toggle users ability to scroll
Bwe.scrollable = function(enabled){
  if(enabled === undefined){
    enabled = !Bwe.isScrollable;
  }
  if(enabled){
    if (window.removeEventListener)
      window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
  }
  else{
    if (window.addEventListener) // older FF
        window.addEventListener('DOMMouseScroll', preventDefault, false);
    window.onwheel = preventDefault; // modern standard
    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
    window.ontouchmove  = preventDefault; // mobile
    document.onkeydown  = preventDefaultForScrollKeys;
  }
  Bwe.isScrollable = enabled;
}
Bwe.isScrollable = true;
var keys = {37: 1, 38: 1, 39: 1, 40: 1};
function preventDefault(e) {
 e = e || window.event;
 if (e.preventDefault)
     e.preventDefault();
 e.returnValue = false;
}
function preventDefaultForScrollKeys(e) {
   if (keys[e.keyCode]) {
       preventDefault(e);
       return false;
   }
}

//tag elements with a value
Bwe.identifiers = [
  "accept", "accept-charset", "accesskey", "action", "alt", "autocomplete", "charset", "cite", "class",
  "cols", "colspan", "content", "contenteditable", "coords", "data", "dir", "dirname", "draggable",
  "enctype", "for", "form", "formaction", "headers", "height", "href", "hreflang", "http-equiv",
  "id", "kind", "label", "lang", "list", "low", "max", "maxlength", "media", "method", "min", "name",
  "onseeked", "onseeking", "onselect", "onsubmit", "ontimeupdate", "onunload", "onvolumechange", "onwaiting",
  "optimum", "pattern", "placeholder", "poster", "preload", "rel", "rows", "rowspan", "shape", "size",
  "span", "spellcheck", "src", "srcdoc", "srclang", "srcset", "start", "step", "style", "tabindex",
  "target", "title", "type", "usemap", "value", "width", "wrap"
];


//tag elements with no value
Bwe.idendifiersNoVal = [
  "async", "autofocus", "autoplay", "checked", "controls",
  "default", "defer", "disabled", "download", "hidden", "high",
  "ismap", "loop", "multiple", "muted", "novalidate",
  "readonly", "required", "reversed", "sandbox"
];

//event listeners
Bwe.events = [
  "beforeunload", "blur", "canplay", "canplaythrough", "change", "click",
  "ctextmenu", "copy", "cut", "dblclick", "drag", "dragend", "dragenter", "dragleave",
  "dragover", "dragstart", "drop", "duratichange", "ended", "error", "focus", "hashchange",
  "input", "invalid", "keydown", "keypress", "keyup", "load", "loadeddata", "loadedmetadata",
  "loadstart", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "pageshow",
  "paste", "pause", "play", "playing", "progress", "ratechange", "reset", "resize", "scroll"
];

//tags that require no closing tag
Bwe.noClosingTag = ["img", "source", "br", "hr", "area", "track", "link", "col", "meta", "base", "embed", "param", "input"];


//pages that are used in the navbar
Bwe.pages = [];
