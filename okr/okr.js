class okr{
  //converts json to html string
  static build(kv){
    var res = "<" + kv["tag"];

    for(var i in okr.identifiers){
      var key = okr.identifiers[i];
      if(kv[key] != undefined)
        res += " " + key + "='" + kv[key] + "'";
    }

    for(var i in okr.idendifiersNoVal){
      var key = okr.idendifiersNoVal[i];
      if(kv[key] != undefined)
        res += " " + key;
    }

    if(kv["data"] != undefined){
      for(var key in kv["data"]){
        res += " data-" + key + "= '" + kv["data"][key] + "'";
      }
    }

    var requiresClosingTag = $.inArray(kv["tag"], okr.noClosingTag);

    if(requiresClosingTag != -1){
      res += "/>";
    }
    else{
      res += ">";
    }

    if(kv["con"] != undefined){
      res += kv["con"];
    }
    for(var i in kv["children"]){
      res+= okr.build(kv["children"][i]);
    }

    if(requiresClosingTag == -1){
      res += "</" + kv["tag"] + ">\n";
    }
    return res;
  }

  //converts the json to a html string and then appends it to the selectors html
  static buildAndAppend(sel, kv){
    var res = okr.build(kv);
    $(sel).append(res);
  }

  //generates json for a list
  static makeList(kv, items){
    if(kv["children"] == undefined){
      kv["children"] = [];
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
  static makeTable(kv, rows){
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
  static makeNavItems(){
    var curPage = okr.getCurrentPageName();
    var navChildren = [];
    for(var i in okr.pages){
      var cls = "";
      var pageName = okr.pages[i]["name"];
      if(curPage == pageName )
        cls = "active";

      navChildren.push({
        tag : "a",
        con : okr.pages[i]["name"],
        class : cls,
        href  : okr.pages[i]["page"]
      });
    }
    return navChildren;
  }

  //returns the name of the current page in okr.pages
  static getCurrentPageName(){
    var curPage = location.pathname;

    //if not being run on a virtual host
    if(window.location.hostname == ""){
      curPage = curPage.split("/").pop()
    }
    for(var i in okr.pages){
      var page = okr.pages[i]["page"];
      if(
          curPage == page ||
          curPage == "/" + page ||
          curPage == page.replace(".html", "") ||
          (curPage == "/" && (page == "/index" || page == "/index.html" || page == "index" || page == "index.html"))
        ){
        return okr.pages[i]["name"];
      }
    }
    console.log("Current page not found");
  }
}

//tag elements with a value
okr.identifiers = ["id", "class", "src", "href", "frameborder", "type", "alt"];

//tag elements with no value
okr.idendifiersNoVal = ["autoplay", "loop", "controls", "allowfullscreen"];

//tags that require no closing tag
okr.noClosingTag = ["img", "source"];


//pages that are used in the navbar
okr.pages = [];
