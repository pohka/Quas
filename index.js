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

}
