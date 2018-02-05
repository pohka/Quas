/*
This script is used for transpiling and bundling development builds
For production use a static build and remember to remove links to this script
*/

Quas.filesToBundle = 0; //count of the number of files being bundled
Quas.bundleData = []; //string data of each file

Quas.devBuild = function(config){
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
Quas.evalDevBundle = function(){
  let bundle = "";
  for(let i=0; i<Quas.bundleData.length; i++){
    bundle += Quas.bundleData[i];
  }
  bundle += "\nif(typeof start === 'function'){ start(); }";

  eval(Quas.parseBundle(bundle));
}

//returns the javascript string for the bundle with Quas DOM info
Quas.parseBundle = function(bundle){
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
Quas.jsArr = function(arr, tab){
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
Quas.convertToQuasDOMInfo = function(html){
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
          let trimmedText = text.trimExcess();
          let parseProps = Quas.parseProps(trimmedText);
          parent.push(parseProps);
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
          //events
          if(tagInfo[v].substr(0,2) === "on"){
            let arr = tagInfo[v].split("=");
            if(arr[1] !== undefined){
              attrs[arr[0]] = arr[1].substr(1,arr[1].length-2);
            }
          }
          //attrs
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
    //text between tags
    else if(tagStart == -1){
      text += html[i];
    }
  }

  console.log(Quas.jsArr(info));
  return Quas.jsArr(info);
}

//parses props
Quas.parseProps = function(str){
  let matches =  str.match(/\{.*?\}/g);
  for(let i in matches){
  	let parsed = matches[i].replace("{", '"+');
    parsed = parsed.replace("}", '+"');
    str = str.replace(matches[i], parsed);
  }
  return str;
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
  let removedSpace = this.replace(/[\n\r]+|[\s]{2,}/g, '');
  if(removedSpace === ""){
    return "";
  }
  return start + removedSpace + end;
}
