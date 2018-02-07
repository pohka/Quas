class Card extends Comp{
  constructor(props){
    super(props)
    this.name = props.text
    this.listItems = ["item 1", "item 2", "item 3"];
    this.data = [
      ["row 1 col 1", "row 1 col 2"],
      ["row 2 col 1", "row 2 col 2"],
      ["row 3 col 1", "row 3 col 2"]
    ];
    this.headings = ["heading 1", "heading 2"];
  }

  enter(e, comp){
    this.active = true;
    console.log("active: " + this.active);
    console.log(e);
    console.log(comp);
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
          <ul q-foreach-li=this.listItems>
          </ul>
        </div>
        <table q-foreach-tr-td=this.data>
          <tr q-foreach-th=this.headings></tr>
        </table>
      </div>
    </quas>
  }

}
