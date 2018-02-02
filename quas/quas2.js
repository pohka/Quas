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
    let e = document.createElement(info[0]);
    for(let a in info[1]){
      if(info[1][a].substring(0,2) === "on"){
        //add event listener
      }
      else{
        e.setAttribute(a, info[1][a]);
      }
    }
    if(info[2] !== undefined){
      e.textContent = info[2];
    }

    target.appendChild(e);
  }
}
