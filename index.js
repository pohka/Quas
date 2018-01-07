window.onload = function(){
  test(false);
}

class MyComp extends Comp{
  constructor(data){
    super({
      tag : "div",
      txt : "hello " + data.text,
      data : {
        url : data.url
      },
      on : {
        click : function(){
          console.log("i was clicked");
        }
      }
    });
  }
}

//testing each function
function test(testSetURLvals){
  //basic component
  let a = new Comp({
    tag : "div",
    txt : "hello",
  });
  a.render("body");

  //extened component
  let b = new MyComp({
    text : "world",
    url : "abc.com",
  });

  //add a child
  b.addChild({
    tag : "div",
    id : "achild1",
    txt : "addChild 1"
  });

  //add a child before the selector
  b.addChild({
    tag : "div",
    id : "achild2",
    class : "class1",
    css : {
      "padding-top" : "100px"
    },
    txt : "addChild 2"
  }, "#achild", true);

  //render into body
  b.render("body");

  //foreach element
  //get and set data values
  Quas.each("div", function(el){
    let val = el.data("url");
    if(val !== undefined){
      el.data("url", "/"+val);
    }
  });

  //editing componenet data and rendering before
  b.data.txt = "inserted at the start";
  b.data.children = [];
  b.render("body", "prepend"); //options: append/prepend/set

  //get an element and log the text
  //this returns a wrapper class around the HTML DOM element
  let el = Quas.getEl("#achild2")
  console.log("text: " +el.text());

  //add, remove and check for classes and toggling active class
  el.addCls("class2");
  el.delCls('class1')
  el.active(); //toggle active
  console.log("class list: " +  el.attr("class"));
  console.log("has class2: " + el.hasCls('class2'));
  el.active(false);

  //returns the HTML DOM element
  let domEl = Quas.sel(".class2");
  console.log(domEl.id);

  //add a list
  el.addChild({
    tag : "ul",
    children : Quas.genList([
      "item 1",
      "item 2",
      "item 2"
    ])
  });

  //add a table with an event listener
  el.addChild({
    tag : "table",
    on : {
      mousemove : function(){
        console.log("cursor moving within the table");
      }
    },
    children : Quas.genTable(
      ["heading 1", "heading 2"],
      [
        ["row 1 item 1", "row 1 item 2"],
        ["row 2 item 1", "row 2 item 2"],
        ["row 3 item 1", "row 3 item 2"],
      ]
    )
  }, "prepend");

  //toggle or set the ability to scroll
  //also get current scrollable state
  Quas.scrollable(true);
  if(Quas.isScrollable){
      console.log("you can scroll");
  }

  //ajax request with succes and error callback functions
  Quas.ajax({
    url : "php/test.php",
    type : "POST",
    data : {
      key : "value",
      print_me : "two"
    },
    success : function(result){
      console.log("success - " + result);
    },
    error : function(msg, errorCode){
      console.log(errorCode +" : " + msg);
    }
  });

  //returns kv values from the url as json
  let urlVals = Quas.getUrlValues();
  let page = urlVals.page;
  if(page === undefined){
    page = 0;
  }
  page = Number(page);
  console.log({urlValues : urlVals});

  //set the kv values in the url with json
  if(testSetURLvals !== undefined && testSetURLvals == true){
    Quas.setUrlValues({
      page : page += 1,
      id : "someID",
    });
  }

  //add and remove an element
  let temp  = new Comp({
    tag : "div",
    id : "achild3",
    txt : "i am temporary"
  });
  temp.render("body");
  Quas.getEl("#achild3").del();


  //get or set a HTML DOM property
  let ch2 = Quas.getEl("#achild2");
  let offset = ch2.prop("offsetTop");
  console.log("offset: " + offset);

  //browser name and version
  let info = Quas.browser();
  console.log("browser: " + info.name + " v." + info.version + " - " + info.isMobile);

  //toggle scrolling
  let body = Quas.getEl("body");
  body.addChild({
    tag : "button",
    txt : "Toggle Scroll",
    on : {
      click : function(){
        Quas.scrollable();
        console.log("Scrolling enabled: " + Quas.isScrollable);
      }
    }
  });

  //add a button that scrolls to the top of an element
  body.addChild({
    tag : "button",
    txt : "Scroll Up",
    on : {
      click : function(){
        console.log("clicked");
        Quas.getEl("#myid").scrollTo();
      }
    }
  });
}
