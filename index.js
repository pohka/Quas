window.onload = function(){
  //  builder();
  test();
  let field = Bwe.getEl("#test");
  let val = field.attr("id")
  console.log("val:" + val);
  let text = Bwe.getEl("#thisone").text();
  console.log("text:" + text);
  let json = field.elData();
  console.log(json);
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
        id : "test",
        con : "child 1",
      },
      {
        tag : "input",
        id : "myinput",
        value : "text",
        placeholder : "enter text",
      }
    ]
  });
  a.render();
//  console.log(a.attr("value"))s;
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
