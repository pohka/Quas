window.onload = function(){
  //  builder();
  test();

  // let field = Bwe.getEl("#myinput");
  // let val = field.attr("id")
  // console.log("val:" + val);
  // let text = Bwe.getEl("#thisone").text();
  // console.log("text:" + text);
  // let json = field.elData();
  // console.log(json);
  //field.del();

  // Bwe.getEl("#thisone").html({
  //   tag : "div",
  //   txt : "i was added"
  // }, "append");
}

function test(){
  let a = new Comp({
    tag : "div",
    id : "thisone",
    class : "myclass",
    data : {
      url : "abc.com",
    },
    txt : "content is here",
    children : [
      {
        tag : "div",
        id : "test",
        txt : "test",
        style : "height:1000px",
      },
      {
        tag : "button",
        txt : "toggle scroll",
        on : {
          click : function(){
            console.log("scrollable:" + !Bwe.isScrollable);
            Bwe.scrollable();
          },
          mouseover : function(){
            //console.log("GOOD scrolling");
          },
        },
      },
      {
        tag : "input",
        id : "myinput",
        class : "myclass",
        value : "text",
        placeholder : "enter text",
        data : {
          url : "cdf.com"
        }
      },
      {
        tag : "ul",
        children : Bwe.genList([
          "item 1",
          "item 2",
          "item 3"
        ])
      },
      {
        tag : "table",
        children : Bwe.genTable(
          ["heading 1", "heading 2"],
          [
            ["row 1 item 1", "row 1 item 2"],
            ["row 2 item 1", "row 2 item 2"],
          ]
        )
      },
      {
        tag : "div",
        style : "height:1000px;"
      },
      {
        tag : "button",
        txt : "scroll up",
        id : "jog",
        on : {
          click : function(){
            Bwe.getEl("#myinput").scrollTo();
          }
        }
      }
    ]
  });

  a.addChild({
    tag : "div",
    txt : "i am from addChild",
  }, "url:cdf.com", false);

  a.render("body");
  Bwe.each(".myclass", function(el){
    let url = el.data("url");
    if(url!==null)
      console.log(el.visible());
  });

  let c = Bwe.getEl("#myinput");
  //c.visible(false);
  let offset = c.prop("offsetTop");

  let b = a.clone();
  b.data = { tag : "div", txt : "meme"};
  //b.render("body", "set");
}

function builder(){
  let bwe = new Comp("body", {
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
