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
            con : "test",
            href : "#"
          }
        ]
      }
    ]
  });
  Okr.buildAndAppend("body" ,{
    tag : "div",
    class : "body-con",
    con : "hello world"
  });
}
