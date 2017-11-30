$(document).ready(function() {
  //var curPage = location.pathname;//.split("/").pop();
  //console.log("curpage:" + curPage);
  setPages();
  navbar();
  test();
});

function setPages(){
  Okr.pages = [
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

function test(){
  Okr.buildAndAppend("body" ,{
    tag : "div",
    class : "body-con",
    children : [
      {
        tag : "div",
        class : "title",
        children : [
          {
            tag : "h1",
            con : "Okr"
          },
          {
            tag : "p",
            con : "Converts JSON to HTML"
          },
          Okr.makeList({
            tag : "ul"
            },
            [
              "item 1",
              "item 2"
          ]),
          Okr.makeTable(
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

function navbar(){
  Okr.buildAndAppend("html", {
    tag : "nav",
    children : [
      {
        tag : "div",
        class : "nav-items",
        children : Okr.makeNavItems()
      }
    ]
  });
}
