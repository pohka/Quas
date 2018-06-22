import "/css/code-highlighter.css";

Quas.export(
  class CodeHighlighter{
    static init(key){
      this.jsKeyWords = [
        "arguments",
        "await",
        "break",
        "case",
        "catch",
        "class",
        "const",
        "continue",
        "debugger",
        "default",
        "delete",
        "do",
        "else",
        "enum",
        "eval",
        "export",
        "extends",
        "false",
        "finally",
        "for",
        "function",
        "if",
        "implements",
        "import",
        "in",
        "instanceof",
        "interface",
        "let",
        "new",
        "null",
        "package",
        "private",
        "protected",
        "public",
        "return",
        "static",
        "super",
        "switch",
        "this",
        "throw",
        "true",
        "try",
        "typeof",
        "var",
        "void",
        "while",
        "with",
        "yield"
      ];

      this.jsKeyWordEnd = [
        "{",
        "}",
        "(",
        ")",
        ";",
        ":",
        "."
      ];

      this.isHTML = false;



    Quas.customAttrs["code"] = this.handler;
  }

  static handler(params, data, parentVDOM, comp){
    //console.log(this);
    let lastCharWasSpace = false;
    let quoteException = false;
    let word = "";
    let char = "";
    let isSpace = false;
    let isNewLine = false;
    let isQuote = false;
    let quoteOpen = false;
    let quoteType; // ' or " or `
    let lastChar = "";
    let isKeyWordEnd = false;
    let isComment = false;
    let isMultilineComment = false;
    let last2Chars;
    CodeHighlighter.isHTML = false;

    for(let i=0; i<data.length; i++){
      quoteException = false;
      char = data.charAt(i);
      isSpace = char.match(/ +s?/);
      isNewLine = char.match("\n");
      isKeyWordEnd = (CodeHighlighter.jsKeyWordEnd.indexOf(char) > -1);

      //matches a quote but not an escaped quote
      isQuote = char.match(/"|'|`/) && !lastChar.match(/\\"|'|`/);

      last2Chars = lastChar + char;

      //javascript
      if(!CodeHighlighter.isHTML){
        if(isComment){
          if((isNewLine && !isMultilineComment) || (last2Chars == "*/" && isMultilineComment)){
            let text = "";

            if(isMultilineComment){
              text = word + char;
              word = "";
            }
            else{
              text = word;
              word = char;
            }
            parentVDOM[2].push(["span", {"class":"code-comment"}, [text]]);
            isComment = false;
            isMultilineComment = false;

          }
          else{
            word += char;
          }
        }
        //html not in comment
        else{
          //detect comment
          if(!quoteOpen){
            if(last2Chars == "//" || last2Chars == "/*"){
              word = word.substr(0,word.length-1); //remove /
              CodeHighlighter.highlightWord(parentVDOM, word, ""); //handle current word
              word = "/";
              isComment = true;
              if(last2Chars == "/*"){
                isMultilineComment = true;
              }
            }
            else if((isNewLine && !isMultilineComment) || (last2Chars == "*/" && isMultilineComment)){
              isComment = false;
            }
          }

          //opening quote
          if(isQuote && !quoteOpen){
            quoteOpen = true;
            quoteType = char;
            CodeHighlighter.highlightWord(parentVDOM, word, ""); //handle current word
            word = char;
          }

          //end of quote
          else if(isQuote && quoteOpen && char == quoteType){
            word += char;
            quoteOpen = false;
            parentVDOM[2].push(["span", {"class":"code-quote"}, [word]]);

            quoteException = true;

            word = "";
          }
          //inside quote
          else if(quoteOpen){
            word += char;
          }

          //end of word
          if(!quoteOpen && !quoteException){
            if(!lastCharWasSpace && (isNewLine || isSpace)){
              CodeHighlighter.highlightWord(parentVDOM, word, char);
              word = "";
              lastCharWasSpace = true;
            }
            //ending a keyword with a symbol
            else if(isKeyWordEnd && CodeHighlighter.jsKeyWords.indexOf(word.trim()) > -1){
              console.log("here");
              CodeHighlighter.highlightWord(parentVDOM, word, "");
              word = char;
              lastCharWasSpace = false;
            }
            //append character to word
            else if(!isSpace){
              word += char;
              lastCharWasSpace = false;
            }
            //convert double spaces to tabs
            else if(lastCharWasSpace && isSpace){
              word += "\t";
              lastCharWasSpace = false;
            }
          }
        }

        //add last word
        if(i == data.length-1){
          CodeHighlighter.highlightWord(parentVDOM, word, "");
        }
        else{
          lastChar = char;
        }
      }

      //html
      else{
        word += char;

        if(isNewLine || i == data.length-1){
          CodeHighlighter.highlightHTMLLine(parentVDOM, word);
          word = "";
        }
      }
    }
  }

  static highlightWord(parentVDOM, word, char){
    let text = word + char;
    let isChange = false;
    if(!CodeHighlighter.isHTML && text.indexOf("\<quas\>") > -1){
      CodeHighlighter.isHTML = true;
      isChange = true;
    }

    if(isChange){
      let arr = text.split("<");
      let pre = arr[0] + "<";
      let next = arr[1];
      arr = next.split(">");
      let mid = arr[0];
      let after = ">" + arr[1];

      //html tag
      parentVDOM[2].push(["span", {}, [pre]]);
      parentVDOM[2].push(["span", {"class":"code-htmltag"}, [mid]]);
      parentVDOM[2].push(["span", {}, [after]]);
    }
    else{
      //javascript
      if(!CodeHighlighter.isHTML){
        let vdom = ["span", {}, [text]];
        if(CodeHighlighter.jsKeyWords.indexOf(word.trim()) > -1){
          vdom[1]["class"] = "code-keyword";
        }
        parentVDOM[2].push(vdom);
      }
    }
  }

  static highlightHTMLLine(parentVDOM, word){
    let strs = word.split(/<(.*?)>/g);
    let tags = word.match(/<(.*?)>/g);

  //  console.log(strs);
    let isTag = false;
    for(let i=0; i<strs.length; i++){

      if(isTag){
        let openVDOM = ["span", {}, ["<"]];
        let closeVDOM = ["span", {}, [">"]];

        //let midSpans = [];
        let midVDOMs = [];

        let attrs = strs[i].match(/"[^"]*"|\S+/g);

        for(let i=0; i<attrs.length; i++){
          if(i != 0){
            attrs[i] = " " + attrs[i];
          }

          //html tag
          if(i == 0){
            midVDOMs.push(["span", {"class":"code-htmltag"}, [attrs[i]]]);
          }
          //html attribute
          else{
            let kv = attrs[i].split("=");
            midVDOMs.push(["span", {"class":"code-htmlkey"}, [kv[0]]]);

            if(kv.length > 1){
              midVDOMs.push(["span", {}, ["="]]);
              midVDOMs.push(["span", {"class":"code-htmlval"}, [kv[1]]]);
            }
          }
        }
        parentVDOM[2].push(openVDOM);
        for(let i=0; i<midVDOMs.length; i++){
          parentVDOM[2].push(midVDOMs[i]);
        }
        parentVDOM[2].push(closeVDOM);


      }
      else{
        parentVDOM[2].push(["span", {}, [strs[i]]]);
      }
      isTag = !isTag;
    }


    if(word.indexOf("\</quas\>") > -1){
      CodeHighlighter.isHTML = false;
    }
  }
});
