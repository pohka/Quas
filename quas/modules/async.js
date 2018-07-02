

/**
  # module
  ---
  Asyncronously loading files

  adds custom attribute for "q-async" which currently just loads images
  ---


  ```
  <quas>
    <div>
      <img q-async-imgsrc="/images/1.png"></img>
    </div>
  </quas>
  ```
*/
Quas.export({
  init : ()=>{
    Quas.async = {};
    Quas.customAttrs["async"] = (params, data, parentVDOM, comp, parentDOM) => {
      //async load img
      if(params[0] == "imgsrc"){
        if(!Quas.async.imgs){
          Quas.async.imgs = [];
        }

        //get the url
        let url;
        if(data.length < 4 || data.substr(0,4) != "http"){
          url = window.location.origin + data;
        }
        else{
          url = data;
        }

        //find the image if has already been loaded
        //if found upoad both the real doma and virtual dom
        let foundImage = false;
        for(let i=0; i<Quas.async.imgs.length; i++){
          if(Quas.async.imgs[i].src == url){
            foundImage = true;
            parentVDOM[1]["src"] = url;
            parentDOM.setAttribute("src", url);
          }
        }

        //load the image and render to component again once loaded
        if(!foundImage){
          let img = new Image();
          img.onload = function(){
            Quas.async.imgs.push(this);
            Quas.render(comp);
          }
          img.src = url;
        }
      }
    }
  }
});
