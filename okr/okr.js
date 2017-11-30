class Okr{
  static build(kv){
    var res = "<" + kv["tag"];

    for(var i in Okr.identifiers){
      var key = Okr.identifiers[i];
      if(kv[key] != undefined)
        res += " " + key + "='" + kv[key] + "'";
    }

    for(var i in Okr.idendifiersNoVal){
      var key = Okr.idendifiersNoVal[i];
      if(kv[key] != undefined)
        res += " " + key;
    }

    if(kv["data"] != undefined){
      for(var key in kv["data"]){
        res += " data-" + key + "= '" + kv["data"][key] + "'";
      }
    }

    var requiresClosingTag = $.inArray(kv["tag"], Okr.noClosingTag);

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
      res+= Okr.build(kv["children"][i]);
    }

    if(requiresClosingTag == -1){
      res += "</" + kv["tag"] + ">\n";
    }
    return res;
  }

  static buildAndAppend(sel, kv){
    var res = Okr.build(kv);
    $(sel).append(res);
  }

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
}

Okr.identifiers = ["id", "class", "src", "href", "frameborder", "type", "alt"];
Okr.idendifiersNoVal = ["autoplay", "loop", "controls", "allowfullscreen"];
Okr.noClosingTag = ["img", "source"];
Okr.pages = [];
