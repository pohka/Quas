//starting point
function start(){
  let c = new Card({text:"hello world"});
  let target = document.getElementById("root")
  Quas.render(c, "#root");
}
