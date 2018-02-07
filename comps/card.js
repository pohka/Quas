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
    this.count = 0;
    this.active = false;

    let a = ["item 1", Card.test()];
    console.log(a);
  }

  click(e, comp){
    comp.active = true;
    comp.count++;
    //let child = comp.findChild("#deeper");
    //child.textContent = "deeper " + comp.count;

  //  let inner = comp.findChild("#inner");
    //comp.eachChild(".inner2 li", function(el){
    //  el.textContent = "test";
    //});

    Quas.rerender(comp);
  }

  leave(e, comp){
    //this.active = false;
    //console.log("active:" + this.active);
    comp.name = "goodbye";
    Quas.rerender(comp);
    console.log(comp.el);
  }

  static test(str){
    <quas>
      <div>testing {str}</div>
    </quas>
  }


  render(){
    let a = this.test;
    <quas>
      <div id="card" class="abc"
        onclick=this.click onmouseleave=this.leave
        active=this.active>
        hello {this.name}, count: {this.count}
        <div>
          inner
          <div id="deeper">deeper</div>
        </div>
        <div class="inner2">
          <ul q-foreach-li=this.listItems>
          </ul>
        </div>
        <table q-foreach-tr-td=this.data>
          <tr q-foreach-th=this.headings></tr>
        </table>
        {Card.test("123")}
      </div>
    </quas>
  }

}
