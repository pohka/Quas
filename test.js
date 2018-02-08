//starting point
function start(){
  let c = new Card({text:"world"});
  let target = document.getElementById("root")
  Quas.render(c, "#root");
  console.log("urlvals");
  let vals = Quas.getUrlValues();
  if(vals.video === undefined)
    Quas.setUrlValues({"video":"abc"})
  console.log(vals);
  console.log(Quas.browserInfo());
  Quas.scrollable(false);
}

//example of creating a custom attribute
Quas.customAttrs["test"] = function(parent, params, data){
  let child = document.createElement("br");
  parent.appendChild(child);
  let text = document.createTextNode(data);
  parent.appendChild(text);
}
