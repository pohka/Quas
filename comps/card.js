class Card extends Comp{
  constructor(props){
    super(props)
    this.name = props.text
  }

  eventTest(){
    console.log("triggered by event: ");
  }

/*
  render(){
    return [
      "div", //tag
      {
        id:"test",
        "onclick onmouseover" : this.eventTest //events
      },
      [
        this.name,
        [
          "div",
          {},
          [
            "im a child ",
            [
              "a",
              {href: "#"},
              ["link"]
            ],
            " text after",
            [
              "br"
            ],
            " more after"
          ]
        ]
      ] //children
    ];
  }
*/

  render(){
/*
      <div id="test" onclick-onmouseover="{this.eventTest, 'im a param'}">
        hello world
        <div>im a child
          <a href="#">link</a>
          text after <br>
          more after
        </div>
      </div>
*/
    <quas>
      <div id="root">
        hello world 
        <div class="inner">
          inner
          <div id="even deeper">deeper</div>
        </div>
        <div class="inner2">other</div>
      </div>
    </quas>
  }

}
