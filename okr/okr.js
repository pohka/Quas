class Okr{
  constructor(kv) {
    this.kv = kv
    this.children = [];
  }

  //adds a child Okr or an array of children Okr
  add(obj){
    if(obj instanceof Array){
      for(var i in obj){
        this.children.push(obj[i]);
      }
    }
    else if(obj instanceof Obj){
      this.children.push(obj);
    }
    else{
      console.log("addChild() not an instance Okr");
    }
  }

  //adds data to this element
  addData(key, val){
    if(this.data == undefined)
      this.data = {}

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

  //returns this Obj as a html string
  get(){
    if(this.kv["tag"] == undefined){
      console.log("tag undefined");
      return;
    }
    var res = "<" + this.kv["tag"];

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

    var requiresClosingTag = $.inArray(this.kv["tag"], Okr.noClosingTag);

    if(requiresClosingTag != -1){
      res += "/>";
    }
    else{
      res += ">";
    }

    if(this.kv["content"] != undefined){
      res += this.kv["content"];
    }
    for(var i in this.children){
      res+=this.children[i].get();
    }

    if(requiresClosingTag == -1){
      res += "</"+this.kv["tag"]+">\n";
    }
    return res;
  }
}

Okr.identifiers = ["id", "class", "src", "href", "frameborder", "type", "alt"];
Okr.idendifiersNoVal = ["autoplay", "loop", "controls", "allowfullscreen"];
Okr.noClosingTag = ["img", "source"];
