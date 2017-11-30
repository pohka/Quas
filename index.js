$(document).ready(function() {
  buildPage();
});


function buildPage(){
  console.log("here");
  var hello = new Okr({
    tag : "div",
    content : "hello world"
  });
  $("body").append(hello.get());

}
