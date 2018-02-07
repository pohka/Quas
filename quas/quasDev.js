/*
This script is used for transpiling and bundling development builds
For production use a static build and remember to remove links to this script
*/

Quas.filesToBundle = 0; //count of the number of files being bundled
Quas.bundleData = []; //string data of each file
Quas.bundle = "";

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

  bundle = Quas.parseBundle(bundle);
  Quas.bundle = bundle;
  bundle += "\nif(typeof start==='function'){start();}";
  eval(bundle);
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
      //remove last comma, only if this element has attributes
      if(Object.keys(arr[i]).length>0){
        str = str.substr(0,str.length-1);
      }
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

            //function call prop
            if(arr[2][j].match(/\(.*?\)/g)){
              str += arr[2][j] + ",";
            }
            //text context
            else{
              str += '"'+ arr[2][j] + '"';
            }
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
              attrs[arr[0]] = arr[1];
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
    let res = matches[i].substr(1,matches[i].length-2);
    //function
    if(res.match(/\(.*?\)/g)){
      return res;
    }
    //text component
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

//downloads the bundle, set minify to true to use minify, default filename is bundle
Quas.build = function(minify, filename){
  var element = document.createElement('a');
  var text = Quas.bundle;
  if(filename === undefined){
    filename = "bundle";
  }
  if(minify){
    text = Quas.minify(text);
    filename+=".min";
  }
  filename += ".js";

 element.setAttribute('href', 'data:text/plain;charset=utf-8,' + text);
 element.setAttribute('download', filename);
 element.style.display = 'none';
 document.body.appendChild(element);

 element.click();

 document.body.removeChild(element);
}

Quas.minify = function(str){
  let lines = str.split("\n");

  //remove comments
  let openCommentIndex = -1;
  for(let i=0; i<lines.length; i++){
    lines[i] = lines[i].trim();
    let commentIndex = lines[i].indexOf("//");
    if(lines[i].indexOf("//") > -1){
      lines[i] = lines[i].substr(0, lines[i].indexOf("//"));
    }

    //opening of multi line comment
    if(openCommentIndex == -1){
      if(lines[i].indexOf("/*") > -1){
        openCommentIndex = i;
      }
    }

    //closing of multi line comment
    if(openCommentIndex > -1 && lines[i].indexOf("*/") > -1){
      //same line comment
      if(openCommentIndex == i){
        let start = lines[i].indexOf("/*");
        let end = lines[i].indexOf("*/")+2;
        lines[i].replace(lines[i].slice(start, end), "");
      }
      else{
        //remove first line
        lines[openCommentIndex] = lines[openCommentIndex].substr(0, lines[openCommentIndex].indexOf("/*"));
        for(let c=openCommentIndex+1; c<i-1; c++){
          lines[i]="";
        }
        //remove last lines
        lines[i] = lines[i].substr(lines[i].indexOf("*/")+2);
      }

      openCommentIndex = -1;
    }
  }
  str = lines.join("\n");
  str = str.replace(/\n\n/g, "");
  str = str.replace(/(,\s)(?=(?:[^"]|"[^"]*")*$)/g,',');
  str = str.replace(/(;\s)(?=(?:[^"]|"[^"]*")*$)/g,';');
  str = str.replace(/({\s)(?=(?:[^"]|"[^"]*")*$)/g,'{');
  str = str.replace(/(}\s)(?=(?:[^"]|"[^"]*")*$)/g,'}');
  str = str.replace(/(\[\s)(?=(?:[^"]|"[^"]*")*$)/g,'[');
  str = str.replace(/(]\s)(?=(?:[^"]|"[^"]*")*$)/g,']');
  str = str.replace(/(\s=\s)(?=(?:[^"]|"[^"]*")*$)/g,'=');
  str+="\nif(typeof start==='function'){start();}";

  return str;
}
