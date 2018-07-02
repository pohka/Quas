/*
This script is used for transpiling and bundling development builds
For production use a static build and remember to remove links to this script
*/

/*
  Object to help manipulate the (AST) Abstract Syntax Tree data of the vdom

structure of vdom:
 ["tag", { key, "val" }, []]
 [ tag, attrs, children]
 */
const VDOM = {
  /**
    ---
    returns the tag of the given vdom
    ---

    @param {AST} vdom

    @return {String}
  */
  tag : (vdom) => {
    return vdom[0];
  },
  /**
    ---
    returns the attributes for the given vdom
    ---

    @param {AST} vdom

    @return {Object}
  */
  attrs : (vdom) => {
    return vdom[1];
  },

  /**
    ---
    returns all the child nodes of the given vdom
    ---

    @param {AST} vdom

    @return {Array<AST|String>}
  */
  childNodes : (vdom) => {
    return vdom[2];
  },
  /**
    ---
    returns the value of an attribute
    ---

    @param {AST} vdom
    @param {String} key

    @return  {String}
  */
  getAttr : (vdom, key) => {
    return vdom[1][key];
  },
  /**
    ---
    Sets an attribute on the given vdom
    ---

    ```
    let myVDom = VDOM.createNode("div");
    VDOM.setAttr(myVDom, "class", "myclass");
    ```

    @param {AST} vdom
    @param {String} key
    @param {String} value
  */
  setAttr : (vdom, key, val) => {
    vdom[1][key] = val;
  },
  /**
    ---
    Adds a child node to the given AST
    ---

    @param {AST} vdom
    @param {AST|String} child
  */
  addChild : (vdom, childNode) => {
    vdom[2].push(childNode);
  },
  /**
    ---
    returns the last child node of the given AST
    ---

    @param {AST} vdom

    @return {AST|String}
  */
  getLastChild : (vdom) => {
    return vdom[2][vdom[2].length-1];
  },
  /**
    ---
    creates a vdom AST
    ---

    ```
    //equivilant of: <div id="myid"></div>
    VDOM.createNode("div", { id : "myid" });
    ```

    @param {String} tag
    @param {Object} attributes - (optional)
    @param {Array<Object>} children - (optional)

    @return {AST}
  */
  createNode : (tag, attrs, children) => {
    if(!attrs){
      attrs = {};
    }
    if(!children){
      children = []
    }
    return [tag, attrs, children];
  },

  /**
    ---
    returns true if the vdom node passed is a text node
    ---

    @param {AST|String} vdom

    @return {Boolean}
  */
  isTextNode : (vdom) => {
    return !Array.isArray(vdom);
  }
}


const Dev = {};

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

/*
  transpiles a javascript file into valid syntax

  @param {String} fileContents

  @return {String}
*/
Dev.transpile = (bundle) => {
  let lines = bundle.split("\n");

  let inCommentBlock = false;
  let result = "";
  let quoteRegex = /"(.*?)"|`(.*?)`|'(.*?)'/;
  let hasCommentBlockChange;
  let inHtmlBlock = false;
  let hasHtmlBlockChanged = false;
  let htmlText = "";
  let vdom;
  let depth = 0;

  let tagContent = "";
  let inMultiLineTag = false;
  let prevLine = "";


  for(let i=0; i<lines.length; i++){
    let lineContents = lines[i].split(quoteRegex).join(" ");
    let hasCommentBlockChange = false;
    let curLine = "";


    //remove comment block
    if(!inCommentBlock && lineContents.indexOf(/\/\*(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/) > -1){
      let arr = lines[i].split(/\/\*(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
      curLine += arr[0];
      inCommentBlock = true;
      hasCommentBlockChange = true;
    }
    if(inCommentBlock && lineContents.indexOf(/\*\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/) > -1){
      let arr = lines[i].split(/\*\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
      curLine += " " + arr[1];
      inCommentBlock = false;
      hasCommentBlockChange = true;
    }

    //no code blocks, so just use the raw line
    if(!hasCommentBlockChange){
      curLine = lines[i];
    }

    if(!inCommentBlock){
      //remove end of line comment
      curLine = prevLine.split(/\/\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)[0] + curLine.split(/\/\/(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)[0];
      prevLine = "";

      //find start of html parse
      if(!inHtmlBlock && curLine.indexOf("#<") > -1){
        depth = 0;
        inHtmlBlock = true;
        //add js to result
        let arr = curLine.split("#<");
        result += arr[0];
        htmlString = "";

        curLine = "<" + arr[1];
        hasHtmlBlockChanged = true;
      }

      if(inHtmlBlock){
        let curLineNoQuotes = curLine.replace(new RegExp(quoteRegex, "g"), "");
        let change = 0;

        let openBrackets = Dev.matchesForBracket(curLineNoQuotes, "<");
        change += openBrackets;
        let closeBrackets = Dev.matchesForBracket(curLineNoQuotes, ">");
        change -= closeBrackets;

        //has at least 1 full tag on this line
        if(change == 0 && openBrackets > 0 && closeBrackets > 0){
          let tags = curLineNoQuotes.match(/<.*?>/g);

          if(tags){
            for(let t=0; t<tags.length; t++){
              let tagName = tags[t].substr(1, tags[t].length-2).split(/\s/)[0];
              //dont count for when no closing tag is required
              if(Dev.requiresClosingTag(tagName)){
                //is closing
                if(tags[t].charAt(1) == "/"){
                  //if using closing tag when no required
                  if(Dev.requiresClosingTag(tagName.substr(1))){
                    depth -= 1;
                  }
                }
                //is opening
                else{
                  depth += 1;
                }
              }
            }
          }
          htmlString += curLine;
        }
        else if(change > 0){
          tagContent = Dev.getStringAfterLastOpenBraket(curLine);
          inMultiLineTag = true;
        }
        //in multiline tag
        else if(inMultiLineTag){

          //end of multiline
          if(change < 0){
            inMultiLineTag = false;
            //split curline by end of multiLine tag
            let arr = Dev.splitByEndMultiLineTag(curLine);

            //add tag content for multiline tag
            htmlString += tagContent + arr[0] + ">";

            //add the rest on the prevLine
            prevLine = arr[1];
            tagContent = "";
            depth += 1;
          }
          //within multiline tag, but not ending on this line
          else{
            tagContent += curLine;
          }
        }
        else if(!inMultiLineTag && change == 0){
          htmlString += curLine
        }

        //end of html block
        if(!inMultiLineTag && depth <= 0 && !hasHtmlBlockChanged){
          result += Dev.transpileHTMLBlock(htmlString);
          let els = lines[i].split(/\<\/.*?\>/);
          if(els.length > 1){
            result += els[1];
          }
          else{
            result += els[0];
          }
          inHtmlBlock = false;
        }
        if(hasHtmlBlockChanged){
          hasHtmlBlockChanged = false;
        }
      }

      else {
        result += curLine + "\n";
      }
    }
  }
  return result;
}

/*
  takes a string with html syntax and returns a valid js array matching the vdom AST
*/
Dev.transpileHTMLBlock = (html) => {
  let res = Dev.convertHTMLStringToVDOM(html);
  return Dev.stringifyVDOM(res, 1);
}


/*
  converts a html string to a vdom AST

  @param {String} html

  @return {AST}
*/
Dev.convertHTMLStringToVDOM = (html) =>{
  let inQuote = false;
  let quoteType;
  let char, lastChar = "";
  let tagContent = "";
  let insideTag = false;
  let hasEndedTag = false;
  let text = "";
  let parent;
  let root;
  const escapeChars = ["<", ">"];
  let changedToQuote = false;

  const states = Object.freeze({
      other : 0,
      insideTag : 1,
    });
  let state  = states.other;
  let depth = 0;

  for(let i=0; i<html.length; i++){
    hasEndedTag = false;
    changedToQuote = false;

    char = html.charAt(i);
    if(!inQuote && lastChar != "\\" && char.match(/"|'|`/)){
      inQuote = true;
      quoteType = char;
      changedToQuote = true;
    }

    //parse tags
    if(!inQuote){
      //start of tag
      if(char == "<" && lastChar != "\\"){
        state = states.insideTag;
        tagContent = "";

        //add text node before new child node
        let trimmed = text.trim();
        if(trimmed.length > 0){
          VDOM.addChild(parent, text);
        }
        text = "";
      }
      //end of tag
      else if(char == ">" && lastChar != "\\"){
        let tagVDOM = Dev.tagStringToVDOM(tagContent);
        state = states.other;
        hasEndedTag = true;

        //end of opening tag
        if(tagVDOM){

          if(Dev.requiresClosingTag(VDOM.tag(tagVDOM))){
            depth++;
            //add root tag
            if(!root){
              root = tagVDOM
              parent = root;
            }
            //add child tag and set new parent
            else{
              VDOM.addChild(parent, tagVDOM);
              parent = parent[2][parent[2].length-1];
            }
          }
          //no closing tag required
          else{
            VDOM.addChild(parent, tagVDOM);
          }
        }
        //end of closing tag
        else{
          let tagName = tagContent.substr(tagContent.indexOf("/") + 1).trim();

          //set parent to parent node
          if(Dev.requiresClosingTag(tagName)){

            //add text node before end of node
            let trimmed = text.trim();
            if(trimmed.length > 0){
              VDOM.addChild(parent, text);
            }
            text = "";

            depth -= 1;

            //end of root tag
            if(depth == 0){
              break;
            }
            else{
              parent = root;
              for(let d=1; d<depth; d++){
                parent = VDOM.getLastChild(parent); //last child
              }
            }
          }
        }
      }

      //inside tag text e.g. div id="myID"
      else if(state == states.insideTag){
        tagContent += char;
      }
    }

    //keep track of text between tags
    if(state == states.other && !hasEndedTag){
      //check if escapable character
      if(escapeChars.indexOf(char) > -1 && lastChar == "\\"){
          text = text.slice(0, -1);
      }
      text += char;
    }


    if(inQuote){
      tagContent += char;
    }

    if(inQuote && !changedToQuote && char == quoteType && lastChar != "\\"){
      inQuote =false;
    }

    lastChar = char;
  }

  return root;
}


/*
  converts a vdom to string

  @param {AST} vdom
  @param {Number} startingTabs

  @return {String}
*/
Dev.stringifyVDOM = (vdom, tabs) => {
  if(!Array.isArray(vdom)){
    let res = Dev.parseProps(vdom.trimExcess())
    return Dev.tabs(tabs) + res;
  }
  let str = "";
  str += Dev.tabs(tabs) + "[\n";
  str += Dev.tabs(tabs + 1) + "\"" + VDOM.tag(vdom) + "\",\n";

  //attributes
  str += Dev.tabs(tabs + 1) + "{\n";
  let attrs = VDOM.attrs(vdom);
  let attrCount = Object.keys(attrs).length;
  let count = 0;
  for(let a in attrs){
    let val = Dev.parseProps(attrs[a]);
    str += Dev.tabs(tabs + 2) + "\"" + a + "\":" + val;
    count++;
    if(count != attrCount){
      str += ",\n";
    }
  }
  str += "\n" + Dev.tabs(tabs + 1) + "},\n";

  //child nodes
  let children = VDOM.childNodes(vdom);
  str += Dev.tabs(tabs + 1);
  str += "[\n";
  for(let i=0; i<children.length; i++){
    str += Dev.stringifyVDOM(children[i], tabs+2);
    if(i < children.length-1){
      str +=  ",\n";
    }
  }
  str += "\n" + Dev.tabs(tabs + 1) + "]"; //close child nodes
  str += "\n" + Dev.tabs(tabs) + "]"; //close current node

  return str;
}

//helper function for stringifyVDOM() for creating tabs
Dev.tabs = (num) => {
  let s = "";
  for(let i=0; i<num; i++){
    s += "  ";
  }
  return s;
}

/*
  parses the props out a string for use with stringifyVDOM()

  @param {String} text

  @return {String}
*/
Dev.parseProps = (text) => {
  let char,
      lastChar = "",
      fullText = "",
      propText = "",
      inProp = false,
      openIndex = -1,
      startsWithProp = false,
      endsWithProp = false;
  for(let i=0; i<text.length; i++){
    let char = text.charAt(i);
    if(!inProp && char == "{"  && lastChar != "\\"){
      openIndex = i;
      inProp = true;
    }
    else if(inProp && char == "}" && lastChar != "\\"){
      inProp = false;

      if(openIndex > 1){
        fullText += "\"+"
      }
      else{
        startsWithProp = true;
      }
      fullText += propText;
      if(i != text.length-1){
        fullText += "+\"";
      }
      else{
        endsWithProp = true;
      }
      propText = "";
    }
    else if(inProp){
      propText += char;
    }
    else{
      fullText += char;
    }
    lastChar = char;
  }
  if(!startsWithProp){
    fullText = "\"" + fullText;
  }
  if(!endsWithProp){
    fullText += "\"";
  }
  return fullText;
}

/*
  returns true if the tag requires a closing tag

  @param {String} tag

  @param {Boolean}
*/
Dev.requiresClosingTag = (tagName) => {
  return (Dev.noClosingTag.indexOf(tagName) == -1);
}



/*
  converts the text between tags to a vdom AST
  e.g. div id="myid"   =>   ["div", { id : "myid" }, []]

  @param {String} str

  @return {AST}
*/
Dev.tagStringToVDOM = (str) => {
  str = str.trim();
  //return undefined if closing tag
  if(str.charAt(0) == "/"){
    return;
  }

  //split by space but no in quotes
  let arr = Dev.splitBySpaceButNotInQuotes(str);
  let tagName = arr[0];
  let vdom = [tagName, {}, []];

  //get all the attrs
  for(let i=1; i<arr.length; i++){
    let attr = arr[i].split("=");
    let key = attr[0];
    let val = "";
    if(attr[1]){
      //remove quotes
      val = attr[1].substr(1, attr[1].length-2);
    }
    VDOM.attrs(vdom)[key] = val;
  }
  return vdom;
}

/*
  splits a string by /\s+/ spaces, but not if the space(s) are in quotes

  @param {String} str

  @return {Array}
*/
Dev.splitBySpaceButNotInQuotes = (str) => {
  let inQuote = false;
  let quoteType, char, lastChar = "";
  let lastCharWasSpace = false, charIsSpace;
  let el = "";
  let arr = [];
  for(let i=0; i<str.length; i++){
    char = str.charAt(i);
    if(char.match(/"|'|`/) && lastChar != "\\"){
      inQuote = !inQuote;
    }

    charIsSpace = (!inQuote && char.match(/\s/));

    if(charIsSpace && !lastCharWasSpace){
      arr.push(el);
      el = "";
    }

    if(!charIsSpace){
      el += char;
    }

    lastChar = char;
    lastCharWasSpace = charIsSpace;
  }
  arr.push(el);
  return arr;
}

Dev.calcTagDepthChange = (line) => {
  //ignore all text in quotes
 let quoteRegex = /"(.*?)"|`(.*?)`|'(.*?)'/;
 line = line.split(quoteRegex).join("");
  let count = 0;
  let curLineWithoutQuotes = line.split(quoteRegex).join("");
  let tags = curLineWithoutQuotes.match(/<.*?>/g);


  if(tags){
    for(let t=0; t<tags.length; t++){
      let tagName = tags[t].substr(1, tags[t].length-2).split(/\s/)[0];
      //dont count for when no closing tag is required
      if(Dev.requiresClosingTag(tagName)){
        if(tags[t].charAt(1) == "/"){
          //if using closing tag when no required
          if(Dev.requiresClosingTag(tagName.substr(1))){
            count -= 1;
          }
        }
        else{
          count += 1;
        }
      }
    }
  }
  return count;
}

Dev.matchesForBracket = (str, type) =>{
  let char, lastChar = "";
  let count = 0;
  for(let i=0; i<str.length; i++){
    char = str.charAt(i);
    if(lastChar != "\\" &&  char == type){
      count++;
    }
    lastChar = char;
  }
  return count;
}


/*
  splits a line by the first occurance of >

  @param {String} line

  @return {Array}
*/
Dev.splitByEndMultiLineTag = (line) => {
  let inQuote = false;
  let quoteType, char, lastChar = "";
  for(let i=0; i<line.length; i++){
    char = line.charAt(i);
    if(lastChar != "\\"){
      if(!inQuote && char.match(/"|'|`/)){
        inQuote = true;
        quoteType = char;
      }
      else if(inQuote && char == quoteType){
        inQuote = false;
      }
      else if(char == ">" && lastChar != "\\"){
        return [line.substr(0, i), line.substr(i+1)];
      }
    }

    lastChar = char;
  }
}

/*
  returns the string after <

  @param {String} line

  @return {String}
*/
Dev.getStringAfterLastOpenBraket = (line) => {
  let indexOfLastBracket = -1;
  let inQuote = false;
  let quoteType;
  let char;
  let lastChar = "";
  let quote = /"|`|'/;

  for(let i=0; i<line.length; i++){
    char = line.charAt(i);


    if(!inQuote && char.match(quote)){
      quoteType = char;
      inQuote = true;
    }
    else if(inQuote && quoteType == char && lastChar != "\\"){
      inQuote = false;
    }
    else if(!inQuote && char == "<" && lastChar != "\\"){
      indexOfLastBracket = i;
    }

    lastChar = char;
  }

  return line.substr(indexOfLastBracket);
}




/**
  Returns a string with the excess white spacing removed, for use with text nodes

  @return {String}
*/
String.prototype.trimExcess = function(){
  let end = "";
  let start = "";

  if(this.charAt(0) == " "){
    start = " ";
  }
  if(this.charAt(this.length-1) == " "){
    end = " ";
  }
  let removedSpace = this.replace(/[\n\r]+|[\s]{2,}/g, ' ');
  if(removedSpace == ""){
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

    bundle = Dev.transpile(bundle);
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
Dev.load = function(){
  let mainFile;
  if(!Dev.main){
    mainFile = "/main.js";
  }
  else{
    mainFile = Dev.main;
  }

  Quas.ajax({
    url : mainFile,
    type : "GET",
    success : (file) => {
      let hasImport = Dev.parseImports(mainFile, file, "root");

      //if no imports just add the root
      if(!hasImport){
        Dev.addImports("js");
      }
    },
    error : (e) => {
      console.error("Root file not found: " + mainFile);
    }
  });
}

//checks a javascript file to see if it has any imports
Dev.parseImports = (filename, file, key) => {
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
Dev.build = function(filename, extention){
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

document.addEventListener("DOMContentLoaded", function(event) {
  Dev.load();
});
