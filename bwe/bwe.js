class bwe{
  //builds a html string from the json
  static build(kv){
    var res = "<" + kv["tag"];

    for(var i in bwe.identifiers){
      var key = bwe.identifiers[i];
      if(kv[key] != undefined)
        res += " " + key + "='" + kv[key] + "'";
    }

    for(var i in bwe.idendifiersNoVal){
      var key = bwe.idendifiersNoVal[i];
      if(kv[key] != undefined)
        res += " " + key;
    }

    if(kv["data"] != undefined){
      for(var key in kv["data"]){
        res += " data-" + key + "= '" + kv["data"][key] + "'";
      }
    }

    var requiresClosingTag = $.inArray(kv["tag"], bwe.noClosingTag);

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
      res+= bwe.build(kv["children"][i]);
    }

    if(requiresClosingTag == -1){
      res += "</" + kv["tag"] + ">\n";
    }
    return res;
  }

  //builds a html string from the json and appends it to the selector's html
  static append(sel, kv){
    var res = bwe.build(kv);
    $(sel).append(res);
  }

  //generates json for a list
  static genList(kv, items){
    if(kv["children"] == undefined){
      kv["children"] = [];
    }
    if(kv["tag"] == undefined){
      kv["tag"] = "ul";
    }

    for(var i in items){
      kv["children"].push({
        tag : "li",
        con : items[i]
      });
    }
    return kv;
  }

  //generates json for a table
  static genTable(kv, rows){
    if(kv["children"] == undefined){
      kv["children"] = [];
    }
    kv["tag"] = "table";

    //headings row
    var headings = {
      tag : "tr",
      children : []
    };
    for(var c=0; c < rows[0].length; c++){
      headings["children"].push({
        tag : "th",
        con : rows[0][c]
      });
    }
    kv["children"].push(headings);

    //data rows
    for(var r=1; r < rows.length; r++){
      var row = {
        tag : "tr",
        children : []
      };
      for(var c in rows[r]){
        row["children"].push({
          tag : "td",
          con : rows[r][c]
        });
      }

      kv["children"].push(row);
    }
    return kv;
  }

  //generate json for navbar items
  static genNavItems(itemAttrs, conAttrs){
    var curPage = bwe.getCurPage();
    var navChildren = [];
    for(var i in bwe.pages){
      var cls = "";
      var pageName = bwe.pages[i]["name"];
      if(curPage == pageName )
        cls = "active";

      var item = {
        tag : "a",
        con : bwe.pages[i]["name"],
        class : cls,
        href  : bwe.pages[i]["page"]
      };

      //attributes of each item
      if(itemAttrs != undefined){
        for(var key in itemAttrs){
          item = bwe.appendAttr(item, key, itemAttrs[key]);
        }

        //attributes of content
        if(conAttrs != undefined){

          var con = {};
          for(var key in conAttrs){
            con[key] = conAttrs[key];
          }
          con["con"] = bwe.pages[i]["name"];
          item["con"] = "";
          //item["children"].push(con);
          item = bwe.appendAttr(item, "children", con);
        }
      }

      navChildren.push(item);
    }
    return navChildren;
  }

  //returns the name of the current page in bwe.pages
  static getCurPage(){
    var curPage = location.pathname;

    //if not being run on a virtual host
    if(window.location.hostname == ""){
      curPage = curPage.split("/").pop()
    }
    for(var i in bwe.pages){
      var page = bwe.pages[i]["page"];
      if(
          curPage == page ||
          curPage == "/" + page ||
          curPage == page.replace(".html", "") ||
          (curPage == "/" && (page == "/index" || page == "/index.html" || page == "index" || page == "index.html"))
        ){
        return bwe.pages[i]["name"];
      }
    }
    console.log("Current page not found");
  }

  //appends the value an attribute of an item,
  //if it doesn't exist then it adds the attribute to the item
  //returns json for the item
  static appendAttr(item, key, val){
    if(!item.hasOwnProperty(key)){
      if(key != "data" && key != "children"){
        item[key] = "";
      }
      else {
        item[key] = [];
      }
    }
    if(key == "data" || key == "children"){
      item[key].push(val);
    }
    else if(key == "class"){
      item[key] += " " + val;
    }
    else{
      item[key] += val;
    }
    return item;
  }
}



//tag elements with a value
bwe.identifiers = [
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
bwe.idendifiersNoVal = [
  "async", "autofocus", "autoplay", "checked", "controls",
  "default", "defer", "disabled", "download", "hidden", "high",
  "ismap", "loop", "multiple", "muted", "novalidate",
  "readonly", "required", "reversed", "sandbox"
];

//tags that require no closing tag
bwe.noClosingTag = ["img", "source", "br", "hr", "area", "track", "link", "col", "meta", "base", "embed", "param", "input"];


//pages that are used in the navbar
bwe.pages = [];
