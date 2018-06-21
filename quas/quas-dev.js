/*
This script is used for transpiling and bundling development builds
For production use a static build and remember to remove links to this script
*/

Quas.comps = [];

var Dev = {};

//tags that require no closing tag
Dev.noClosingTag = ["img", "source", "br", "hr", "area", "track", "link", "col", "meta", "base", "embed", "param", "input"];



//all he imported files
Dev.imports = {
  "js" : {
    content : [],
    importsLeft : 0,
  }
};

Dev.bundle = {};

/**
  Returns the bundle as as javascript valid code
  The returned string will have all the HTML syntax transpiled to a render info array
  which is valid JavaScript syntax

  @param {Array} bundle

  @return {String}
*/
Dev.parseBundle = function(bundle){
  let lines = bundle.split("\n");
  let open = -1;
  let html = "";
  let tagName = "quas";
  let inRender = false;
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
        let info = Dev.convertHTMLToVDOM(html);
        lines[i] = info + lines[i].substr(closeIndex + tagName.length + 3);
        open = -1;
        html = "";
      }
      //still currently open
      else{
        //split by "//" out side of quotes
        let match = lines[i].split(/(?=(?:[^"]*"[^"]*")*[^"]*$)\/\//g);
        html += match[0];
        lines.splice(i, 1);
        i--;
      }
    }
  }
  bundle = lines.join("\n");
  return bundle;
}

/**
  Returns an array as a javascript valid styntax for the array with indentation

  @param {Array} array
  @param {Number} indentCount

  @return {String}
*/
Dev.jsArr = function(arr, tab){
  let str = "";
  if(tab === undefined){
    tab = 1;
  }

  for(let t=0; t<tab; t++){
    str += "  ";
  }
  str += "[\n";
  tab++;
  for(let i=0; i<arr.length; i++){
    for(let t=0; t<tab; t++){
      str += "  ";
    }
    //tag
    if(i == 0){
      str += '"' + arr[i] + '",\n';
    }

    //attrs
    else if(i == 1){
      str += "{"
      for(let key in arr[i]){
        if(arr[i][key] === ""){
          arr[i][key] = "\"\"";
        }
        str += "\"" + key + "\":" + Dev.parseProps(arr[i][key]) + ",";
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
            str += Dev.jsArr(arr[2][j], tab);

            if(j != arr[2].length-1){
              str += ",\n";
            }
          }
          else{
            for(let t=0; t<tab; t++){
              str += "  ";
            }

            //function call prop
            if(arr[2][j].match(/\(.*?\)/g)){
              str += arr[2][j];
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
          str += "  ";
        }
        str += "]";
        tab--;
      }
    }
  }
  str += "\n";
  for(let t=0; t<tab-1; t++){
    str += "  ";
  }
  str += "]";
  return str;
}

/**
  Convert HTML syntax to render info as a string
  with JavaScript valid syntax for an array

  @param {String} htmlString

  @return {Sting}
*/
Dev.convertHTMLToVDOM = function(html){
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
          //console.log(text);
          let trimmedText = text.trimExcess();

          //escaping round brackets
          let matches =  trimmedText.match(/\\\)/g);
          for(let i in matches){
            let newStr = "--/(";
            trimmedText = trimmedText.replace(matches[i], newStr);
          }

          let parseProps = Dev.parseProps(trimmedText);
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
                parent.push([tagInfo[0], attrs, []]);
            }
            else{
              parent = parent[parent.length-1][2];
            }
          }
        }
        if(Dev.noClosingTag.indexOf(tagInfo[0]) == -1){
          depth++;
        }
      }
    }
    //text between tags
    else if(tagStart == -1){
      text += html[i];
    }
  }

  return Dev.jsArr(info);
}

/**
  Parses the props in the HTML syntax

  @param {String} htmlString

  @param {String}
*/
Dev.parseProps = function(str){
  let matches =  str.match(/\{.*?\}/g);
  let hasFunc = false;
  for(let i in matches){

  	let parsed = matches[i].replace("{", '"+');
    parsed = parsed.replace("}", '+"');
    let res = matches[i].substr(1,matches[i].length-2);

    //ignore is using \}
    let char = matches[i].charAt(matches[i].length-2);
    if(char !== "\\"){
      //function
      if(res.match(/\(.*?\)/g)){
        hasFunc=true;
        return res;
      }
      else{
      //text component
        str = str.replace(matches[i], parsed);
      }
    }
  }

  if((str.indexOf("\"+") == 0 && str.indexOf("+\"") == str.length-3) || hasFunc){
    return "\"" + str + "\"";
  }

  return str;
}

/**
  Returns a string with the excess white spacing removed

  @return {String}
*/
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


/**
  Exports file(s) for a static build

  @param {String[]} content
  @param {String} filename
*/
Dev.exportToFile = function(content, filename){
  let text = "";
  for(let i in content){
    text += content[i] + "\n";
  }

  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + text);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

//imports a file
Dev.import = function(path, type, key){
  if(Dev.imports[type] === undefined){
    Dev.imports[type] = {
      content : {},
      importsLeft : 1
    };
  }
  else{
    Dev.imports[type].importsLeft += 1;
  }
  Quas.ajax({
    url : path,
    type : "GET",
    success : (file) => {
      if(type == "js"){
        Dev.parseImports(path, file, key);
      }
      else if(type == "css"){
        cssContent = Dev.imports[type].content;
        if(!cssContent[path]){
          cssContent[path] = file;
        }
      }

      Dev.imports[type].importsLeft -= 1;

      //check if all the files loaded of this type have been completed
      if(Dev.imports[type].importsLeft == 0){
        Dev.addImports(type);
      }
    },
    error : (e) => {
      Dev.imports[type].importsLeft -= 1;
    }
  });
}

//concatanate and add the current imports
Dev.addImports = function(type){
  let bundle = "";
  if(type == "js"){
    let jsContent = Dev.imports.js.content;
    let keys = "";
    for(let i=0; i<jsContent.length; i++){
      //root file is not a module
      if(jsContent[i].key == "root"){
        bundle +=
          "/*---------- " + jsContent[i].path + " ----------*/\n" +
          jsContent[i].file.trim() + "\n\n";
      }
      else{
        bundle += "/*---------- " + jsContent[i].path + " ----------*/\n";

        //replace all "Quas.export(" with "Quas.modules[key] = ("
        let exportMatch = jsContent[i].file.match(/Quas\.export\(/);

        if(exportMatch){
          let setModule = "Quas.modules['" + jsContent[i].key + "'] = (";
          jsContent[i].file = jsContent[i].file.replace(exportMatch[0], setModule);
        }

        bundle += jsContent[i].file + "\n";
        keys +="const " + jsContent[i].key + " = Quas.modules['" + jsContent[i].key + "'];\n" +
          "if(typeof Quas.modules['" + jsContent[i].key + "'].init =='function'){\n" +
          "  Quas.modules['" + jsContent[i].key + "'].init('" + jsContent[i].key + "');\n}\n";

      }
    }

    //add all the references to modules to the end
    //e.g. const Card = Quas.modules["Card"];
    bundle += keys;

    bundle = Dev.parseBundle(bundle);
    Dev.bundle.js = bundle;
    bundle += "\nif(typeof ready==='function'){ready();}";

    console.log(bundle);
    var script = document.createElement("script");
    script.type = 'text/javascript';
    script.textContent = bundle;
    document.getElementsByTagName('head')[0].appendChild(script);
  }
  else if(type == "css"){
    for(let i in Dev.imports.css.content){
      bundle +=
        "/*---------- " + i + " ----------*/\n\n" +
        Dev.imports.css.content[i].trim() + "\n\n";
    }
    Dev.bundle.css = bundle;
    var style = document.createElement("style");
    style.textContent = bundle;
    document.getElementsByTagName("head")[0].appendChild(style);
  }
}

//for development builds
Quas.main = function(rootFile){
  Quas.isDevBuild = true;
  Quas.ajax({
    url : rootFile,
    type : "GET",
    success : (file) => {
      let hasImport = Dev.parseImports(rootFile, file, "root");

      //if no imports just add the root
      if(!hasImport){
        Dev.addImports("js");
      }
    },
    error : (e) => {
      console.error("Root file not found: " + rootFile);
    }
  });
}

//checks a javascript file to see if it has any imports
Dev.parseImports = (filename, file, key) => {
//  if(key === undefined){
//  }

  //check if this file key has already been imported
  for(let i=0; i<Dev.imports.js.content.length; i++){
    if(Dev.imports.js.content[i].key == key){
      return false;
    }
  }

  let lines = file.split("\n");
  let importModuleRegex = /import+\s.*?\sfrom+\s".*"|import+\s.*?\sfrom+\s'.*'|import+\s.*?\sfrom+\s`.*`/;
  let importCssRegex = /import+\s".*"|import+\s'.*'|import+\s`.*`/;
  let multiLineCommentOpen = false;
  let parsedFile = "";
  let hasImport = false;

  for(let i=0; i<lines.length; i++){
    let validLine = "";
    if(lines[i].indexOf("/*") > -1){
      multiLineCommentOpen = true;
      validLine += lines[i].split("/*")[0];
    }

    if(lines[i].indexOf("*/") > -1){
      multiLineCommentOpen = false;
      validLine += lines[i].split("*/")[1];
    }

    if(!multiLineCommentOpen && validLine == ""){
      validLine = lines[i].split("//")[0];
    }
    else if(!multiLineCommentOpen && validLine != ""){
      validLine = validLine.split("//")[0];
    }

    let importModuleMatch = validLine.match(importModuleRegex);
    let importCssMatch = validLine.match(importCssRegex);
    if(importModuleMatch){
      hasImport = true;
      let key = importModuleMatch[0].split(/\s/)[1];
      let path = importModuleMatch[0].match(/".*?"|'.*?'|`.*?`/)[0];
      path = path.substr(1,path.length-2); //remove quotes

      let arr = path.split(".");
      let extention = arr[arr.length-1];

      if(extention == "js"){
        Dev.import(path, extention, key);
      }
    }
    else if(importCssMatch){
      hasImport = true;
      let path = importCssMatch[0].match(/".*?"|'.*?'|`.*?`/)[0];
      path = path.substr(1,path.length-2); //remove quotes
      let arr = path.split(".");
      let extention = arr[arr.length-1];
      Dev.import(path, extention);
    }
    else{
      parsedFile += lines[i] + "\n";
    }
  }

  //add file
  Dev.imports.js.content.push({
    path : filename,
    key : key,
    file : parsedFile
  });

  return hasImport;
}

//export the bundle
Quas.build = function(filename, extention){
  if(!filename){
    var filename = "bundle";
  }
  let types = Dev.bundle;
  if(extention !== undefined){
    types = [extention];
  }

  for(let i in types){
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + Dev.bundle[types[i]]);
    element.setAttribute('download', filename+"."+types[i]);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
