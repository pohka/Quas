class Bwe{
  constructor(sel, data){
    this.sel = sel;
    if(data.constructor !== Array)
      this.data = [data];
    else this.data = data;
  }

  //render the html
  render(){
    for(let i in this.data){
      Bwe.addEl(Bwe.sel(this.sel), this.data[i]);
    }
  }
}

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
}

//returns the element for this object
Bwe.getEl = function(str){
  return new Element(Bwe.sel(str));
}

//add to a dom element and all of it's children
Bwe.addEl = function(s, d){
  if(s === undefined){
    return;
  }

  let el = document.createElement(d.tag);
  if(d.con !== undefined){
    let c = document.createTextNode(d["con"]);
    el.appendChild(c);
  }
  for(let key in d){
    if(key !== "con" && key !== "data" && key !== "tag" && key !== "children"){
      el.setAttribute(key, d[key]);
    }
    else if(key === "data"){
      for(let i in d.data){
        el.setAttribute("data-" + i, d.data[i]);
      }
    }
  }
  s.appendChild(el);

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

    if(kv["con"] != undefined){
      res += kv["con"];
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
  var attrs = []; //all the parsed attributes
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
        tags[tags.length-1]["con"] = content
        content = "";
        readContent=false;
      }
    }
    else if(ch === ">"){
      if(attr !== ""){
        attrs.push(attr);
        attr = "";
      }
      var json = Bwe.genFromAttrs(attrs);
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


Bwe.genFromAttrs = function(attrs){
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
      if(!json.hasOwnProperty("con")){
        json["con"] = "";
      }
      json["con"] += attrs[i];
    }
  }
  return json;
}



//tag elements with a value
Bwe.identifiers = [
  "accept", "accept-charset", "accesskey", "action", "alt", "autocomplete", "charset", "cite", "class",
  "cols", "colspan", "content", "contenteditable", "coords", "data", "dir", "dirname", "draggable",
  "enctype", "for", "form", "formaction", "headers", "height", "href", "hreflang", "http-equiv",
  "id", "kind", "label", "lang", "list", "low", "max", "maxlength", "media", "method", "min", "name",
  "onabort", "onbeforeunload", "onblur", "oncanplay", "oncanplaythrough", "onchange", "onclick",
  "oncontextmenu", "oncopy", "oncut", "ondblclick", "ondrag", "ondragend", "ondragenter", "ondragleave",
  "ondragover", "ondragstart", "ondrop", "ondurationchange", "onended", "onerror", "onfocus", "onhashchange",
  "oninput", "oninvalid", "onkeydown", "onkeypress", "onkeyup", "onload", "onloadeddata", "onloadedmetadata",
  "onloadstart", "onmousedown", "onmousemove", "onmouseout", "onmouseover", "onmouseup", "onpageshow",
  "onpaste", "onpause", "onplay", "onplaying", "onprogress", "onratechange", "onreset", "onresize", "onscroll",
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

//tags that require no closing tag
Bwe.noClosingTag = ["img", "source", "br", "hr", "area", "track", "link", "col", "meta", "base", "embed", "param", "input"];


//pages that are used in the navbar
Bwe.pages = [];
