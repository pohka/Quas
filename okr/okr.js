class Okr{
  constructor(tag, kv) {
    this.tag = tag;
    this.children = [];
    if(kv == undefined || kv == null)
      this.kv = {};
    else
      this.kv = kv;
  }

  //adds a child Okr or an array of children Okr objects
  add(okr){
    if(okr instanceof Array){
      for(var i in okr){
        this.children.push(okr[i]);
      }
    }
    else if(okr instanceof Okr){
      this.children.push(okr);
    }
    else{
      error.log("Not an instance Okr");
    }
  }

  //adds data to this element
  addData(key, val){
    if(this.data == undefined)
      this.data = {};

    this.data[key] = val;
  }

  //adds a KV to this Okr
  addKV(key, val){
    if(this.kv[key] == undefined){
      this.kv[key] = "";
    }
    if(this.kv[key] === "class"){
      this.kv[key] += ", ";
    }
    this.kv[key] += val;
  }

  //sets a KV
  setKV(key, val){
    this.kv[key] += val;
  }

  //ads a list
  addList(type, kv, items){
    var list = new Okr(type, kv);
    for(var i in items){
      list.add(new Okr("li", {
        con : items[i]
      }));
    }
    this.add(list);
  }

  addTable(kv, rows){
    var table = new Okr("table", kv);
    var html = ""
    for(var i in rows){
      html += "<tr>";
      for(var j in rows[i]){
        if(i==0){
          html += "<th>" + rows[i][j] + "</th>";
        }
        else {
          html += "<td>" + rows[i][j] + "</td>";
        }
      }
      html += "</tr>";
    }
    table.addKV("con", html);

    this.add(table);
  }

  //appends the html of the given selector
  static append(sel, okr){
    $(sel).append(okr.get());
  }

  //sets the html of the given selector
  static set(sel, okr){
    $(sel).html(okr.get());
  }

  //returns this Obj as a html string
  get(){
    var res = "<" + this.tag;

    for(var i in Okr.identifiers){
      var key = Okr.identifiers[i];
      if(this.kv[key] != undefined)
        res += " " + key + "='" + this.kv[key] + "'";
    }

    for(var i in Okr.idendifiersNoVal){
      var key = Okr.idendifiersNoVal[i];
      if(this.kv[key] != undefined)
        res += " " + key;
    }

    if(this.data != undefined){
      for(var key in this.data){
        res += " data-" + key + "= '" + this.data[key] + "'";
      }
    }

    var requiresClosingTag = $.inArray(this.tag, Okr.noClosingTag);

    if(requiresClosingTag != -1){
      res += "/>";
    }
    else{
      res += ">";
    }

    if(this.kv["con"] != undefined){
      res += this.kv["con"];
    }
    for(var i in this.children){
      res+=this.children[i].get();
    }

    if(requiresClosingTag == -1){
      res += "</"+this.tag+">\n";
    }
    return res;
  }
}

Okr.identifiers = ["id", "class", "src", "href", "frameborder", "type", "alt"];
Okr.idendifiersNoVal = ["autoplay", "loop", "controls", "allowfullscreen"];
Okr.noClosingTag = ["img", "source"];
