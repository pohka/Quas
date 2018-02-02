class Card extends Comp{
  constructor(props){
    super(props)
    this.name = props.text
    //div hello world


  }

  eventTest(str){
    console.log("triggered by event: " + str);
  }

  render(){
    return [
      "div", //tag
      {id:"test"}, //attributes
      this.name, //text
      {"click mouseover" : [this.eventTest, "im a param"] }, //events
      [] //children
    ];
  }
}

window.onload = function(){
  let c = new Card({text:"hello world"});
  let target = document.getElementById("root")
  Quas.render(c, target);
}
