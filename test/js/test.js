//starting point
function start(){
  let c = new Card({text:"world"});
  let target = document.getElementById("root")
  Quas.render(c, "#root");
//  console.log("urlvals");
  let vals = Quas.getUrlValues();
  if(vals.video === undefined)
    Quas.setUrlValues({"video":"abc"})
//  console.log(vals);
//  console.log(Quas.browserInfo());

  //on enter viewport, on exit viewport
  Quas.enableScrollTracker();
  Quas.scrollSafeZone.bottom = 100;
  Quas.scrollSafeZone.top = 100;
  Quas.onScroll("enter", c, breakEnter);
  Quas.onScroll("exit", c, breakExit);
  Quas.setCookie("key", "");
  Quas.clearCookie("key");

  Quas.ajax({
    url : "/test/other/test.xml",
    type : "GET",
    return: "xml",
    success: function(res){
      console.log(res.getElementsByTagName("note")[0]);
    }
  });
}

//example of creating a custom attribute
Quas.customAttrs["test"] = function(parent, params, data){
  let child = document.createElement("br");
  parent.appendChild(child);
  let text = document.createTextNode(data);
  parent.appendChild(text);
}

function breakEnter(el){
  console.log("entered");
}

function breakExit(el){
  console.log("exited");
}
