$(document).ready(function() {
  var curPage = location.pathname.split("/").pop();
  buildPage(curPage);
});

function buildPage(page){
  navbar();

  if(page === "index.html"){
    aboutTitle();
  }
  else if(page === "api.html"){
    api()
  }
}

function navbar(){
  var nav = new Okr("nav" , {});
  var itemsWrapper = new Okr("div", {
    class : "nav-items"
  });
  //var items = ["Okr", "Builder", "API", "Samples"];
  var pages = [
    ["Okr", "index"],
    ["Builder", "#"],
    ["API", "api"],
    ["Samples", "#"]
  ];
  var curPage = location.pathname.split("/").pop();
  for(var i in pages){
    var cls = "";
    if( curPage === pages[i][1] + ".html"){
      cls = "active";
    }
    itemsWrapper.add(new Okr("a", {
      con : pages[i][0],
      class : cls,
      href : pages[i][1] + ".html"
    }));
  }
  nav.add(itemsWrapper);
  Okr.append("html", nav);
}

function aboutTitle(){
  var hello = new Okr( "div", {
    class : "title"
  });
  hello.add(new Okr("h1", {
    con : "Okr"
  }));
  hello.add(new Okr("div", {
    con : "Html string generator with JavaScript and jQuery"
  }));
  //hello.html("body");
  Okr.append("body", hello);
}

function api(){
  console.log("api");
  var doc = new Okr("div", {
    class : "body-con"
  });
  doc.addTable({},
    [
      ["Function", "Description"],
      ["(tagName, { key : val })", "Constrcutor"],
      ["add (Okr)", "Adds a child Okr"],
      ["add ([Okr1, Okr2])", "Adds a multiple Okr children at once"],
      ["addData (key, val)", "Adds a data attribute i.e. data-key='val'"],
      ["addKV (key, val)", "Adds an attribute. If they key already exists then it appends the value."],
      ["setKV (key, val)", "Sets the attribute"],
      ["addList ('ul', { key : val }, ['item 1', 'item 2'])", "Adds a list from a string array"],
      ["addLTable (type, { key : val }, [ <br>['heading 1', 'heading 2'], <br>['col 1','col 2']<br>])", "Adds a table from a 2D string array"]
      ["get()", "returns the html string"],
      ["append ('selector', okr)", "Appends the selectors html with the passed Okr"],
      ["set ('selector', okr)", "Sets the selectors html with the passed Okr"]
    ]
  );
  Okr.append('body', doc);
}
