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
        //attribute
        if(a.substr(0,2) !== "on"){
          el.setAttribute(a, attrs[a]);
        }
        //event
        else{
          let eventNames = a.substr(2).split(" on");
          for(let i in eventNames){
            el.addEventListener(eventNames[i],
              function(){
                attrs[a]();
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

  static devBuild(config){
    Quas.isDevBuild = true;
    Quas.ajax({
      url : config,
      type : "GET",
      success : function(configRes){
        var files = configRes.split("\n");

        for(let i in files){
          let file = files[i].trim();
          if(file !== ""){
            Quas.filesToBundle++;
            Quas.ajax({
              url : file,
              type : "GET",
              success : function(res){
                Quas.bundleData[i] = res;

                if(Quas.filesToBundle == 1){
                  Quas.evalDevBundle();
                }
                else{
                  Quas.filesToBundle--;
                }
              }
            });
          }
        }
      }
    });
  }

  //concatates each file and evaluates it
  static evalDevBundle(){
    let bundle = "";
    for(let i=0; i<Quas.bundleData.length; i++){
      bundle += Quas.bundleData[i];
    }
    bundle += "\nif(typeof start === 'function'){ start(); }";

    eval(Quas.parseBundle(bundle));
  }

  //returns the javascript string for the bundle with Quas DOM info
  static parseBundle(bundle){
    let lines = bundle.split("\n");
    let open = -1;
    let html = "";
    let tagName = "quas";
    for(let i=0; i<lines.length; i++){
      //open tag
      let openIndex = lines[i].indexOf("<"+tagName+">");
      if(openIndex > -1){
        html += lines[i].substr(openIndex += tagName.length + 2);
        open = i;
        lines.splice(i, 1);
        i--;
      }

      //currently open
      else if(open > -1){

        //closed tag
        let closeIndex = lines[i].indexOf("</"+tagName+">");
        if(closeIndex > -1){
          html += lines[i].substr(0, closeIndex);
          let info = Quas.convertToQuasDOMInfo(html);
          lines[i] = "\treturn " + info + ";" + lines[i].substr(closeIndex + tagName.length + 3);
          open = -1;
          html = "";
        }
        //still currently open
        else{
          html += lines[i];
          lines.splice(i, 1);
          i--;
        }
      }
    }
    bundle = lines.join("\n");
    console.log(bundle);
    return bundle;
  }

  //returns the array as a javascript valid array with indent
  static jsArr(arr, tab){
    let str = "";
    if(tab === undefined){
      tab = 1;
    }

    for(let t=0; t<tab; t++){
      str += "\t";
    }
    str += "[\n";
    tab++;
    for(let i=0; i<arr.length; i++){
      for(let t=0; t<tab; t++){
        str += "\t";
      }
      //tag
      if(i == 0){
        str += '"' + arr[i] + '",\n';
      }

      //attrs
      else if(i == 1){
        str += "{"
        for(let key in arr[i]){
          str += "\"" + key + "\":" + arr[i][key] + ",";
        }
        str = str.substr(0,str.length-1);
        str += "}, \n";
      }

      //children
      else if(i==2){
        if(arr[2].length == 0){
          str += "[]";
        }
        else{
          str += "[\n";
          tab++;
          for(let j=0; j<arr[2].length; j++){
            //child element
            if(Array.isArray(arr[2][j])){
              str += Quas.jsArr(arr[2][j], tab);

              if(j != arr[2].length-1){
                str += ",\n";
              }
            }
            else{
              for(let t=0; t<tab; t++){
                str += "\t";
              }

              //text context
              str += '"'+ arr[2][j] + '"';
              if(j != arr[2].length-1){
                str += ",\n";
              }
            }
          }

          str += "\n";
          for(let t=0; t<tab-1; t++){
            str += "\t";
          }
          str += "]";
          tab--;
        }
      }
    }
    str += "\n";
    for(let t=0; t<tab-1; t++){
      str += "\t";
    }
    str += "]";
    return str;
  }



  //convert HTML for Quas DOM info
  static convertToQuasDOMInfo(html){
    let info;
    let depth = 0;
    let tagStart = -1;
    let text = "";
    for(let i=0; i<html.length; i++){
      if(html[i] === "<"){
        tagStart = i;
        if(info!==undefined && text.trimExcess() !== ""){
          let parent = info[2];
          for(let d=1; d<depth; d++){
              parent = parent[parent.length-1][2];
          }

          if(parent !== undefined){
            parent.push(text.trimExcess());
          }
          text = "";
        }
      }
      else if(html[i] === ">"){
        let tagContent = html.substr(tagStart+1, i - 1 - tagStart);
        tagStart = -1;

        //split by space but ignore spaces in quotes
        let tagInfo = tagContent.split(/ +(?=(?:(?:[^"]*"){2})*[^"]*$)/g);

        //this is a closing tag
        if(tagInfo[0][0] === "/"){
          depth--;
        }
        //opening tag
        else{
          let attrs = {};
          let events = {};

          for(let v=1; v<tagInfo.length; v++){
            if(tagInfo[v].substr(0,2) === "on"){
              //todo: convert event
            }
            else{
              let arr = tagInfo[v].split("=");
              if(arr[1] !== undefined){
                attrs[arr[0]] = arr[1];
              }
              else{
                attrs[arr[0]] = "";
              }
            }
          }

          //adding root
          if(info === undefined){
            info = [tagInfo[0], attrs, []];
          }
          else{
            //find location to add this element
            let parent = info[2];
            for(let d=0; d<depth; d++){
              if(d == depth-1){
                  //if(parent !== undefined){
                  //  parent = parent[2];
                  //}
                  parent.push([tagInfo[0], attrs, []]);
              }
              else{
                parent = parent[parent.length-1][2];
              }
            }
          }
          depth++;
        }
      }
      //between tags
      else if(tagStart == -1){
        //console.log(html[i]);
        text += html[i];
      }
    }
  //  console.log("fin");
  //  info[2].push("hello world");
  //  console.log(info);
    console.log(Quas.jsArr(info));
    //todo: convert array to string
    return Quas.jsArr(info);
  }


}

//returns a string with the excess white spacing removed
String.prototype.trimExcess = function(){
  let end = "";
  let start = "";

  if(this.charAt(0) === " "){
    start = " ";
  }
  if(this.charAt(this.length-1) === " "){
    end = " ";
  }

  return start + this.replace(/[\n\r]+|[\s]{2,}/g, '') + end;
}

Quas.filesToBundle = 0; //count of the number of files being bundled
Quas.bundleData = []; //string data of each file
Quas.isDevBuild = false;
Quas.path;
window.onload = function(){
  Quas.path = location.pathname.substr(1);
  if(typeof start === "function" && !Quas.isDevBuild){
    start();
  }
}
