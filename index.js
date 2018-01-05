window.onload = function(){
    builder();
  //test();
}

function test(){
  let a = new Bwe("body",{
    tag : "div",
    id : "thisone",
    class : "myclass",
    other : "otherval",
    data : {
      url : "abc.com",
    },
    con : "content",
    children : [
      {
        tag : "div",
        con : "child 1",
      }
    ]
  });
  a.render();
}

function builder(){
  let bwe = new Bwe("body", {
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
  bwe.render();
}

$(document).on("input", "#builder-html", function(){
  Bwe.html2json($(this).val());
});
