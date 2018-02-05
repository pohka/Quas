class Card extends Comp{
  constructor(props){
    super(props)
    this.name = props.text
  }

  eventTest(str){
    if(str === undefined) str = "";
    console.log("triggered by event: " +str);
  }


  render(){
    <quas>
      <div id="card" class="abc" onclick-onmouseover="this.eventTest">
        hello {this.name}
        <div class="inner">
          inner
          <div id="even deeper">deeper</div>
        </div>
        <div class="inner2">other</div>
      </div>
    </quas>
  }

}
