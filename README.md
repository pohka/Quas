<p align="center">
  <img src="https://i.imgur.com/rHf8GOb.png" alt="logo">
</p>

Quas is a JavaScript library for building the front end of web applications.
User interfaces are component based and it comes with a multitude of features such as:

* Custom HTML attributes
* Conditional rendering
* Handling of URL parameters and cookies
* Scrolling breakpoints
* File bundling for components
* Custom events

<br>
<br>

## Basic Example
Hello world with a prop
```js
class Example extends Component{
  constructor(text){
    super();
    this.text = text;
  }

  render(){
    <quas>
      <div>
        Hello {this.text}
      </div>
    </quas>
  }
}

function startQuas(){
  Quas.render(new Example("world"), "body"),
}
```

<br>

## Custom Attributes
Creating an unordered list with use of a custom attribute
```js
class MyList extends Component{
  constructor(items){
    super();
    this.items = items;
  }

  render(){
    <quas>
      //creates an li tag around each list item
      <ul q-foreach-li=this.items></ul>
    </quas>
  }
}

function startQuas(){
  let myList = new MyList(["item 1, item 2", "item 3"]);
  Quas.render(myList, "body"),
}
```

<br>

## Event Handling and Updating Props
Update the counter on each click
```js
class Counter extends Component{
  constructor(){
    super();
    this.count = 0;
  }

  //handling of a click event
  static clicked(event, comp){
    comp.setProp("count", comp.count + 1);
  }

  render(){
    <quas>
      <div class="card" onclick=Counter.clicked>
        Click count: {this.count}
      </div>
    </quas>
  }
}

function startQuas(){
  Quas.render(new Counter(), "body"),
}
```

<br>
<br>

## Road Map
* CSS animations and classes
* More support for handling single page applications
* More documentation and website

<br>

## Browser Support
* Chrome
* Firefox
* Safari
* Opera
* Edge
