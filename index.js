window.onload = function(){
    builder();
}

function builder(){
  let a = new Bwe("body", {
    tag : "div",
    class : "body-con",
    children : [
      {
        tag : "div",
        class : "half-width",
        children : [
          {
            tag : "textarea",
            id : "builder-html",
            placeholder : "Paste HTML here"
          }
        ]
      },
      {
        tag : "div",
        class : "half-width",
        children : [
          {
            tag : "textarea",
            id : "builder-json",
            placeholder : "JSON will be generated here"
          }
        ]
      },
      {
        tag : "div",
        class : "half-width",
        children : [
          {
            tag : "textarea",
            id : "builder-result",
            placeholder : "result"
          }
        ]
      },
    ]
  });
  a.render();
}

$(document).on("input", "#builder-html", function(){
  Bwe.convertToJSON($(this).val());
});




function getParent(root, depth){
  if(depth == 1){

  }
  else {
    if(!("children" in root)){
      root["children"] = [];
    }
    return getParent(root["children"], depth-1);
  }
  for(var c = 0; c < childDepth-1; c++){
    var index = childIndexes[activeParentIndex];
    if(!("children" in parent)){
      parent["children"] = [];
    }
    parent = parent["children"][index];
    console.log("looking");
  }
}
