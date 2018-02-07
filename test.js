//starting point
function start(){
  let c = new Card({text:"world"});
  let target = document.getElementById("root")
  Quas.render(c, "#root");
}

//example of creating a custom attribute
Quas.customAttrs["test"] = function(parent, params, data){
  let child = document.createElement("br");
  parent.appendChild(child);
  let text = document.createTextNode(data);
  parent.appendChild(text);
}
