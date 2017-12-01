window.onload = function(){
  setPages();
  navbar();
  switch(bwe.getCurrentPageName()){
    case "Bwe" :  home();  break;
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
  bwe.buildAndAppend("html", {
    tag : "nav",
    children : [
      {
        tag : "div",
        class : "nav-items",
        children : bwe.makeNavItems()
      }
    ]
  });
}

function home(){
  bwe.buildAndAppend("body" ,{
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
  bwe.buildAndAppend("body" ,{
    tag : "div",
    class : "body-con",
    children : [
      {
        tag : "div",
        class : "content"
      }
    ]
  });
  bwe.buildAndAppend(".content",
    bwe.makeList({
      tag : "ul"
      },
      [
        "item 1",
        "item 2"
    ])
  );
  bwe.buildAndAppend(".content",
    bwe.makeTable(
      {},
      [
        ["heading 1", "heading 2"],
        ["row 1", "column 2"]
      ]
    )
  );
}

function api(){
  bwe.buildAndAppend("body", {
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
      bwe.makeTable({},
        [
          ["Function",  "Description", "Return Type"],
          ["build({ <br>&emsp; attr : val <br> });", "Converts a JSON object to a string", "string"],
          ["buildAndAppend( 'selector', { <br>&emsp; attr : val <br> });", "Converts the JSON and then appends it to the selector's HTML", ""],
          ["makeList({ <br>&emsp; attr : val <br>&emsp; }, <br>&emsp; ['item 1', 'item 2']<br>);", "Generates list items from a string array", "JSON"],
          ["makeTable( { <br>&emsp; attr : val<br>&emsp; }, <br>&emsp; [<br>&emsp;&emsp; ['Heading 1', 'Heading 2'],<br>&emsp;&emsp; ['Column 1', 'Column 2']<br>]);", "Builds a table as a JSON object", "JSON"],
          ["makeNavItems()", "Generates JSON for navbar items from bwe.pages", "JSON"],
          ["getCurrentPageName()", "Returns the name of the current page name in bwe.pages", "string"]
        ]
      ),
      {
        tag : "h2",
        con : "Variables"
      },
      bwe.makeTable({},
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
