class Comp{

  constructor(props){
    this.props = props;
  }

  render(){

  }
}


class Quas{
  //renders a component to a target HTML DOM element
  static render(comp, target){
    if(target.constructor === String){
      target  = document.querySelector(target);
    }
    let info = comp.render();
    let el = Quas.createEl(info)
    target.appendChild(el);
  }

  //creates and returns a HTML DOM Element
  static createEl(info, parent){
    //appending the text context
    if(info.constructor === String){
      parent.appendChild(document.createTextNode(info));
      return;
    }

    let tag = info[0];
    let attrs = info[1];
    let text = info[2];
    let events  = info[3];
    let children = info[4];

    let el = document.createElement(tag);

    //attributes
    for(let a in attrs){
        el.setAttribute(a, attrs[a]);
    }

    //text
    if(text !== undefined){
      el.textContent = text;
    }

    //events
    if(events !== undefined){
      for(let key in events){
        let eventNames = key.split(" ");
        for(let i in eventNames){
          el.addEventListener(eventNames[i],
            function(){
              events[key][0](events[key][1])
          });
        }
      }
    }

    //children
    if(children !== undefined){
      for(let i in children){
        let child = Quas.createEl(children[i], el);
        if(child !== undefined){
          el.appendChild(child);
        }
      }
    }

    return el;
  }
}

window.onload = function(){
  if(typeof Quas.start === "function"){
    Quas.start();
  }
}
