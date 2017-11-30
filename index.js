window.onload = function(){
  setPages();
  navbar();
  switch(okr.getCurrentPageName()){
    case "Okr" :  home();  break;
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
      name : "Okr",
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
    class : "title",
    children : [
      {
        tag : "h1",
        con : "Okr"
      },
      {
        tag : "p",
        con : "Generates JSON and converts it to HTML"
      }
    ]
  });
  okr.buildAndAppend("body" ,{
    tag : "div",
    class : "body-con",
    children : [
      {
        tag : "div",
        class : "content"
      }
    ]
  });
  okr.buildAndAppend(".content",
    okr.makeList({
      tag : "ul"
      },
      [
        "item 1",
        "item 2"
    ])
  );
  okr.buildAndAppend(".content",
    okr.makeTable(
      {},
      [
        ["heading 1", "heading 2"],
        ["row 1", "column 2"]
      ]
    )
  );
}

function api(){
  okr.buildAndAppend("body", {
    tag : "div",
    class : "body-con",
    children : [
      {
        tag : "h2",
        con : "Okr"
      },
      okr.makeTable({},
        [
          ["Function",  "Description", "Return Type"],
          ["makeTable()", "Builds a table as a JSON object", "JSON"]
        ]
      )
    ]
  });
}
