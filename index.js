$(document).ready(function() {
  var curPage = location.pathname.split("/").pop();
  test();
});

function test(){
  var a = Okr.buildAndAppend("html", {
    tag : "nav",
    data : {
        type : "fast"
    },
    children : [
      {
        tag : "div",
        class : "nav-items",
        children : [
          {
            tag : "a",
            con : "Okr",
            class : "active",
            href : "#"
          },
          {
            tag : "a",
            con : "Builder",
            href : "#"
          },
          {
            tag : "a",
            con : "API",
            href : "#"
          }
        ]
      }
    ]
  });
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
