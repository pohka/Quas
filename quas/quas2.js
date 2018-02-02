class Comp{

  constructor(props){
    this.props = props;
  }

  render(){

  }
}


class Quas{
  static render(comp, target){
    let info = comp.render();
    let tag = info[0];
    let attrs = info[1];
    let text = info[2];
    let events  = info[3];
    let children = info[4];
    let el = document.createElement(tag);
    for(let a in attrs){
        el.setAttribute(a, attrs[a]);
    }
    if(text !== undefined){
      el.textContent = text;
    }
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

    target.appendChild(el);
  }
}
