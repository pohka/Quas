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
    let el = Quas.createEl(info);
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
    let children = info[2];

    let el = document.createElement(tag);

    //attributes
    for(let a in attrs){
      let prefix = a.substr(0,2);
      //custom attribute
      if(prefix === "q-"){
        Quas.evalCustomAttr(el, a, attrs[a]);
      }
      //event
      if(prefix === "on"){
        let eventNames = a.substr(2).split("-on");
        for(let i in eventNames){
          el.addEventListener(eventNames[i],
            function(){
              attrs[a]();
          });
        }
      }
      //attr
      else{
        el.setAttribute(a, attrs[a]);
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

  /**
    Ajax request
    @param {JSON} req - request data
    Layout of req:
    {
      url : "login.php",
      type : "POST",
      data : {
        key : "value"
      },
      return : "json",
      success : function(result){},
      error : function(errorMsg, errorCode){}
    }
  */
  static ajax(req){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          if(req.success!==undefined){
            let result;
            if(req.return === undefined){
              result = this.responseText;
            }
            else{
              let returnType = req.return.toLowerCase();
              switch(returnType){
                case "json" :
                  try {
                    result = JSON.parse(this.responseText);
                  } catch(e){
                    result = "Failed to parse return text to JSON:\n" + this.responseText;
                  }
                  break;
              }
            }

            req.success(result);
          }
        }
        else if(this.readyState == 4){
          if(req.error !== undefined){
            req.error(this.statusText, this.status);
          }
        }
    };
    let str = req.url + "?";
    let i = 0;
    if(req.data!==undefined){
      for(let key in req.data){
        str += key + "=" + encodeURIComponent(req.data[key]) + "&"
      }
    }
    xhr.open(req.type, str.slice(0,-1), true);
    //xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    //var contentType = "multipart/form-data; boundary=" + boundary;
    //xhr.setRequestHeader("Content-Type", contentType);

    //file uploading
    if(req.data !== undefined && req.data.constructor === FormData){
      xhr.send(req.data);
    }
    else{
      xhr.send();
    }
  }

  //evaluates a custom attribute
  static evalCustomAttr(parent, key, val){
    let info = key.split("-");
    let type = info[1];
    let command = info[2];
    let children = [];

    if(command === "foreach"){
      for(let i in val){
        let el = document.createElement(type);
        el.textContent = val[i];
        parent.appendChild(el);
      }
    }
  }
}




Quas.isDevBuild = false;
Quas.path;
window.onload = function(){
  Quas.path = location.pathname.substr(1);
  if(typeof start === "function" && !Quas.isDevBuild){
    start();
  }
}
