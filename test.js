class Card extends Comp{
  constructor(props){
    super(props)
    this.name = props.text
    //div hello world


  }

  render(){
    return [
      "div",
      {id:"test"},
      this.name,
      []
    ];
  }
}

window.onload = function(){
  let c = new Card({text:"hello world"});
  let target = document.getElementById("root")
  Quas.render(c, target);
}
