window.onload = function(){
  setPages();
  navbar();
  switch(bwe.getCurPage()){
    case "Bwe" :  home();  break;
    case "Builder" : builder(); break;
    case "API" :  api();   break;
  }
}

function setPages(){
  bwe.pages = [
    {
      name : "Bwe",
      page : "index.html"
    },
    {
      name : "Builder",
      page : "builder.html"
    },
    {
      name : "API",
      page : "api.html"
    }
  ];
}

function navbar(){
  bwe.append("html", {
    tag : "nav",
    children : [
      {
        tag : "div",
        class : "nav-items",
        children : bwe.genNavItems()
      }
    ]
  });
}

function home(){
  bwe.append("body" ,{
    tag : "div",
    class : "title",
    children : [
      {
        tag : "h1",
        con : "Bwe.js"
      },
      {
        tag : "p",
        con : "Generates JSON and converts it to HTML"
      }
    ]
  });
  bwe.append("body" ,{
    tag : "div",
    class : "body-con",
    children : [
      {
        tag : "div",
        class : "content"
      }
    ]
  });
  bwe.append(".content",
    bwe.genList({
      tag : "ul"
      },
      [
        "item 1",
        "item 2"
    ])
  );
  bwe.append(".content",
    bwe.genTable(
      {},
      [
        ["heading 1", "heading 2"],
        ["row 1", "column 2"]
      ]
    )
  );
}

function api(){
  bwe.append("body", {
    tag : "div",
    class : "body-con",
    children : [
      {
        tag : "h1",
        con : "Bwe"
      },
      {
        tag : "h2",
        con : "Functions"
      },
      bwe.genTable({},
        [
          ["Function",  "Description", "Return Type"],
          ["build({ <br>&emsp; attr : val <br> });", "Builds a html string from the json", "string"],
          ["append( 'selector', { <br>&emsp; attr : val <br> });", "Builds a html string from the JSON and appends it to the selector's html", ""],
          ["genList({ <br>&emsp; attr : val <br>&emsp; }, <br>&emsp; ['item 1', 'item 2']<br>);", "Generates list items from a string array", "JSON"],
          ["genTable( { <br>&emsp; attr : val<br>&emsp; }, <br>&emsp; [<br>&emsp;&emsp; ['Heading 1', 'Heading 2'],<br>&emsp;&emsp; ['Column 1', 'Column 2']<br>]);", "Builds a table as a JSON object", "JSON"],
          ["genNavItems()", "Generates JSON for navbar items from bwe.pages", "JSON"],
          ["getCurPage()", "Returns the name of the current page name in bwe.pages", "string"]
        ]
      ),
      {
        tag : "h2",
        con : "Variables"
      },
      bwe.genTable({},
        [
          ["Variable", "Description"],
          ["identifiers", "Tag elements with a value"],
          ["idendifiersNoVal", "Tag elements with no value"],
          ["noClosingTag", "Tags that require no closing tag"],
          ["pages", "Pages that are used in the navbar"]
        ]
      )
    ]
  });
}

function builder(){
  bwe.append("body", {
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
      {
        tag : "div",
        con : "<h2>Know Issues with Builder</h2>",
        children : [
          bwe.genList({ tag : "ul" }, [
            "Content tag doesn't convert",
            "Data tags don't convert correctly"
          ])
        ]
      }
    ]
  });
}

$(document).on("input", "#builder-html", function(){
  convertToJSON($(this).val());
});

function convertToJSON(html){
  var start = 0;
  var openQuote = false;
  var openSingleQuote = false;
  var openDoubleQuote = false;
  var isClosing = false;
  var attr = "";
  var ch;
  var attrs = [];
  var tags = [];
  var activeParentIndex = -1;
  var childDepth = -1;
  var childIndexes = [];
  for(var i=0; i<html.length; i++){
    var ch = html.charAt(i);
    if(ch === "<"){
      start = i;
      if(html.charAt(i+1) === "/"){
        isClosing = true;
      }
    }
    else if(ch === ">"){
    //  var end = i;
      if(attr !== ""){
        attrs.push(attr);
        attr = "";
      }
      var json = genFromAttrs(attrs);
      attrs = [];
      //opening tag
      if(!isClosing){
        childDepth += 1;
        //root tag
        if(childDepth == 0){
          tags.push(json);
          activeParentIndex += 1;
        }
        //child tag
        else{
          //add childIndex if it doesnt exist
          if(childIndexes.length <= childDepth){
            childIndexes.push(0);
      //      console.log("adding");
          }
          else{
            childIndexes[childDepth] += 1;
          }

          var parent = tags[activeParentIndex];
          for(var c = 0; c < childDepth-1; c++){
            var index = childIndexes[c];
            if(!("children" in parent)){
              parent["children"] = [];
            }
            parent = parent["children"][index];
        //    console.log(childIndexes);
          }
          if(!parent.hasOwnProperty("children")){
            parent["children"] = [];
          }
         //console.log("id:" + parent["id"]);
         parent["children"].push(json);



         if($.inArray(json["tag"], bwe.noClosingTag) == false){
           //console.log("no closing: " + json["tag"]);
           childIndexes[childDepth] = -1;
           childDepth -= 1;
           childIndexes[childDepth] += 1;
           isClosing=false;
         }

        }
      }
      //closing tag
      else{
      //  console.log("depth:" + childDepth);
       console.log(attrs);


        childIndexes[childDepth] = -1;
        childDepth -= 1;
        childIndexes[childDepth] += 1;
        isClosing=false;

        //get content
      }
    }

    else if(ch == "\'"){
      openSingleQuote = !openSingleQuote
      if(openDoubleQuote == false && openSingleQuote == true){
        openQuote = true;
      }
      else if(openSingleQuote == false){
        openQuote = false;
      }
    }
    else if(ch == "\""){
      openDoubleQuote = !openDoubleQuote;
      if(openDoubleQuote == true && openSingleQuote == false){
        openQuote = true;
      }
      else if(openDoubleQuote == false){
        openQuote = false;
      }
    }
    else if(!isClosing){
      if(openQuote == false && ((ch == ' ') || (ch == '\t') || (ch == '\n'))){
        //console.log("attr:" + attr);
        if(attr !== ""){
          attrs.push(attr);
          attr = "";
        }
      }
      else{
        attr += ch;
      }
      //console.log("attr:" + attr);
    }
  }
  $("#builder-json").val(JSON.stringify(tags[0]));
  $("#builder-result").val(bwe.build(tags[0]));
}


function genFromAttrs(attrs){
  var json = {
    tag : attrs[0]
  };
  for(var i=1; i<attrs.length; i++){
    if(attrs[i].indexOf("=") >= 0){
      var els = attrs[i].split("=");
      json[els[0]] = els[1].replace(/"/g , "");
    }
    else if(bwe.idendifiersNoVal.indexOf(attrs[i]) != -1){
      json[attrs[i]] = "";
    }
    else{
      if(!json.hasOwnProperty("con")){
        json["con"] = "";
      }
      json["con"] += attrs[i];
    }
  }
  return json;
}


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
