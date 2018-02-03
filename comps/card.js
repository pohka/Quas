class Card extends Comp{
  constructor(props){
    super(props)
    this.name = props.text
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
      [
        [
          "div",
          {},
          "im a child ",
          {},
          [
            [
              "a",
              {href: "#"},
              "link",
              []
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

/*
  render(){

      <div id="test" onclick-onmouseover="{this.eventTest, 'im a param'}">
        hello world
        <div>im a child
          <a href="#">link</a>
          text after <br>
          more after
        </div>
      </div>

    <quas>
    <div id="test">
      <div class="inner"><div id="even deeper"></div></div>
      <div class="inner2"></div>
    </div>
    </quas>
  }
*/
}
