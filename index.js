window.onload = function(){
  setPages();
  navbar();
  switch(okr.getCurrentPageName()){
    case "okr" :  home();  break;
    case "API" :  api();   break;
  }
}

function navbar(){
  okr.buildAndAppend("html", {
    tag : "nav",
    children : [
      {
        tag : "div",
        class : "nav-items",
        children : okr.makeNavItems()
      }
    ]
  });
}

function setPages(){
  okr.pages = [
    {
      name : "okr",
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

function home(){
  okr.buildAndAppend("body" ,{
    tag : "div",
    class : "body-con",
    children : [
      {
        tag : "div",
        class : "title",
        children : [
          {
            tag : "h1",
            con : "okr"
          },
          {
            tag : "p",
            con : "Converts JSON to HTML"
          },
          okr.makeList({
            tag : "ul"
            },
            [
              "item 1",
              "item 2"
          ]),
          okr.makeTable(
            {},
            [
              ["heading 1", "heading 2"],
              ["row 1", "column 2"]
            ]
          )
        ]
      }
    ]
  });
}

function api(){
  okr.buildAndAppend("body", {
    tag : "div",
    class : "body-con",
    children : [
      okr.makeTable({},
        [
          ["Function",  "Description", "Return Type"],
          ["makeTable()", "Builds a table as a JSON object", "JSON"]
        ]
      )
    ]
  });
}
