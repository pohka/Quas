/*
todo:
- nested list items
- ordered list
- links [text](link)
- list items with minus sign
- images ![Alt Text](/imgs/logo.png)
- *italic*  _italic_
- **bold**
- __bold__
- _combine **them** too_
- ~~stikethrough~~
- tables
- embed youtube
- video
*/


Quas.export({
  parseToVDOM : (text)=>{
    let vdoms = [];
    let lines = text.split("\n");
    let paragraph  = "";
    let listItems = [];
    let lastLineType = "";
    let codeLang = "";
    let code = "";
    let codeBlockOpen = false;

    for(let i=0; i<lines.length; i++){
      let words = lines[i].split(/\s+/);
      let firstWord = words[0];
      let afterFirstWord = words.splice(1).join(" ");
      let firstChar = lines[i].charAt(0);
      let isLineParsed = false;
      let trimmedLine = lines[i].trim();


      if(codeBlockOpen){
        //end of code block
        if(trimmedLine == "```"){
          let attrs = {
            "q-code" : code,
            "data-type" : codeLang
          };

          vdoms.push(["pre", {}, [
            ["code", attrs, []]
          ]]);
          code = "";
          codeLang = "";
          codeBlockOpen = false;
        }
        //insdie code block
        else{
          if(code.length == 0){
            code += lines[i];
          }
          else{
            code += "\n" + lines[i];
          }
        }
        isLineParsed = true;
      }

      //new line
      if(!isLineParsed && trimmedLine == ""){
        if(paragraph.length > 0){
          vdoms.push(["p",{},[paragraph]]);
          paragraph = "";
        }

        else if(lastLineType == "ul" || lastLineType == "ol"){
          let listVDOM = [lastLineType, {}, []]
          for(let a=0; a<listItems.length; a++){
            //nested list items
            if(Array.isArray(listItems[a])){

            }
            else{
              listVDOM[2].push(["li", {}, [listItems[a]]]);
            }
          }
          vdoms.push(listVDOM);
          listItems = [];
        }

        lastLineType = "newline";
        isLineParsed = true;
      }

      //multiline quote
      else if(lastLineType == "quote" && firstChar == ">"){
        let lastItem = vdoms[vdoms.length-1];
        lastItem[2].push(["br", {}, []]);
        lastItem[2].push(afterFirstWord);
        isLineParsed = true;
      }

      //heading
      else if(!isLineParsed && firstChar == "#"){
        let validHeading = true;
        for(let a=1; a<firstWord.length; a++){
          if(firstWord.charAt(a) != "#"){
            validHeading = false;
            break;
          }
        }
        if(validHeading){
          let tag = "h" + firstWord.length;
          vdoms.push([tag, {}, [afterFirstWord]]);
          lastLineType = "heading";
          isLineParsed = true;
        }
      }

      //quote
      else if(!isLineParsed && firstChar == ">"){
        vdoms.push(["quote", {}, [afterFirstWord]]);
        lastLineType = "quote";
        isLineParsed = true;
      }

      //open code block
      else if(!isLineParsed && trimmedLine.substr(0,3) == "```"){
        codeBlockOpen = true;
        codeLang = trimmedLine.substr(3);
        isLineParsed = true;
      }

      //list items
      if(!isLineParsed){
        let index = trimmedLine.indexOf("* ");
        if(index > -1){
          listItems.push(trimmedLine.substr(index+2));
          lastLineType = "ul";
          isLineParsed = true;
        }
      }

      //append line to paragraph
      if(!isLineParsed){
        paragraph += lines[i];
        lastLineType = "paragraph";
      }

      //last line
      if(i == lines.length-1){
        if(paragraph.length > 0){
          vdoms.push(["p",{},[paragraph]]);
        }
      }
    }

    //console.log("vdoms:");
    //console.log(vdoms);

    return vdoms;
  }
})
