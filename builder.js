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

//converts json to html string
//probably not working with event listeners
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
