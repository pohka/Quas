window.onload = function(){
  //  builder();
  test();


  let field = Bwe.getEl("#myinput");
  let val = field.attr("id")
  console.log("val:" + val);
  let text = Bwe.getEl("#thisone").text();
  console.log("text:" + text);
  let json = field.elData();
  console.log(json);
  field.del();

  Bwe.getEl("#thisone").html({
    tag : "div",
    con : "i was added"
  }, "append");
}

function test(){
  let a = new Bwe({
    tag : "div",
    id : "thisone",
    class : "myclass",
    data : {
      url : "abc.com",
    },
    con : "content is here",
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
  a.render("body");
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
