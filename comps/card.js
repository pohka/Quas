class Card extends Comp{
  constructor(props){
    super(props)
    this.name = props.text
    this.listItems = ["item 1", "item 2", "item 3"];
  }

  enter(){
    this.active = true;
    console.log("active: " + this.active);
  }

  leave(){
    this.active = false;
    console.log("active:" + this.active);
  }


  render(){
    <quas>
      <div id="card" class="abc"
        onmouseenter=this.enter onmouseleave=this.leave
        active="false">
        hello {this.name}
        <div>
          inner
          <div id="even deeper">deeper</div>
        </div>
        <div class="inner2">
          <ul q-li-foreach=this.listItems>
          </ul>
        </div>
      </div>
    </quas>
  }

}
