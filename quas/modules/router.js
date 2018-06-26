Quas.export(
  //handling of the mapping and changing the page
  class Router{
    //add a route
    static map(data){
      this.setFullPathToChildRoutes(data.children, data.path);
      data.fullpath = data.path;
      this.routes.push(data);
    }

    //sets the fullpath for an array of routes
    static setFullPathToChildRoutes(children, parentPath){
      if(!children){
        return;
      }

      for(let i=0; i<children.length; i++){
        children[i].fullpath = parentPath + children[i].path;
        this.setFullPathToChildRoutes(children[i].children, children[i].fullpath);
      }
    }

    //sets the 404 route
    static setRoute404(route){
      this.route404 = route;
    }

    //returns an object of url params if the paths were matching
    // docs/:page == docs/setup
    static matchingRoutePath(routeFullpath, path){
      let a = routeFullpath.split("/");
      let b = path.split("/");

      if(a.length != b.length){
        return;
      }

      let params = {};

      for(let i=0; i<a.length; i++){
        if(a[i].charAt(0) == ":"){
          let key = a[i].substr(1);
          params[key] = b[i];
        }
        else if(a[i] != b[i]){
          return;
        }
      }

      return params;
    }

    //converts a path using the params
    // ("/profile/:user", {user:"john"}) => /profile/john
    // ("/about", {}) => "/about"
    static convertToDynamicPath(path, params){
      for(let i in params){
        let exp = new RegExp(":"+i, "g");
        path = path.replace(exp, params[i]);
      }
      return path;
    }

    //loads the route based on the current url
    static load(){
      let path = window.location.pathname;

      let route = this.findRouteByPath(path);

      if(!route){
        route = this.route404;
      }

      if(route){
        if(route.title){
          document.title = route.title;
        }

        if(route.meta){
          this.setMetaData(route.meta);
        }

        this.currentRoute = route;
        if(route.comps){
          for(let i=0; i<route.comps.length; i++){
            let props = {};
            if(route.comps[i].props){
              for(let p in route.comps[i].props){
                props[p] = route.comps[i].props[p];
              }
            }
            let comp = new route.comps[i].comp(props);
            this.comps.push(comp);

            Quas.render(comp, "#app");
          }
        }
      }
    }

    //sets the document meta data, using the data from routes
    static setMetaData(data){
      let head = document.getElementsByTagName('head')[0];
      for(let i=0; i<data.length; i++){
        let meta = document.createElement("meta");
        for(let a in data[i]){
          let key;
          if(a == "prop"){
            key = "property";
          }
          else{
            key = a;
          }
          meta.setAttribute(key, data[i][a]);
        }
        head.appendChild(meta);
      }
    }

    //adds an alias, will load the to page but without changing the url
    static addAlias(alias){
      this.aliases.push(alias);
    }

    //adds a redirect, will load the to page but and changes the url
    static addRedirect(redirect){
      this.redirects.push(redirect);
    }

    //finds a mapped route by the path
    static findRouteByPath(path){
      let route;
      for(let i=0; i<this.redirects.length; i++){
        let params = this.matchingRoutePath(this.redirects[i].from, path);
        if(params){
          let nextPath = this.convertToDynamicPath(this.redirects[i].to, params);
          window.history.replaceState('','',window.origin + nextPath);
          route = this.findRouteByPath(nextPath);
        }
      }

      if(!route){
        let from;
        for(let i=0; i<this.aliases.length; i++){
          let params = this.matchingRoutePath(this.aliases[i].from, path);
          if(params){
            path = this.convertToDynamicPath(this.aliases[i].to, params);
            from = this.convertToDynamicPath(this.aliases[i].from, params);
            break;
          }
        }

        route = this.findRouteByPathLoop(path, this.routes, []);

        //alias
        if(from){
          route.fullpath = from;
        }
      }

      return route;
    }

    //recusively loops through children
    static findRouteByPathLoop(path, routes, parentComps){
      for(let i=0; i<routes.length; i++){
        //found match
        let match = this.matchingRoutePath(routes[i].fullpath, path);
        if(match){
          //clone the route so we can append the parentComps
          let clone = {};
          for(let a in routes[i]){
            if(a != "comps"){
              clone[a] = routes[i][a];
            }
          }

          //adding comps to clone
          clone.comps = parentComps;
          if(routes[i].comps){
            for(let c=0; c<routes[i].comps.length; c++){
              clone.comps.push(routes[i].comps[c]);
            }
          }

          if(Object.keys(match).length > 0){
            clone.fullpath = this.convertToDynamicPath(clone.fullpath, match);
          }
          clone.params = match;

          return clone;
        }
        //if has children and path has a matching directory
        else if(routes[i].children && path.indexOf(routes[i].fullpath) == 0){

          let nextParentComps = [];

          for(let p=0; p<parentComps.length; p++){
            nextParentComps.push(parentComps[p]);
          }

          if(routes[i].comps){
            for(let p=0; p<routes[i].comps.length; p++){
              nextParentComps.push(routes[i].comps[p]);
            }
          }


          let r = this.findRouteByPathLoop(path, routes[i].children, nextParentComps);
          if(r){
            return r;
          }
        }
      }
    }

    //clones the data from route into a lighter object
    //this will have all the route values except comps and children
    static routeToInfo(route){
      let info = {};
      for(let k in route){
        if(k != "comps" && k != "children"){
          info[k] = route[k];
        }
      }
      return info;
    }

    //finds and returns the routeInfo with the matching id
    static getRouteInfoByID(id, routes){
      if(!routes){
        routes = this.routes;
      }
      for(let i=0; i<routes.length; i++){
        if(routes[i].id == id){
          return this.routeToInfo(routes[i]);
        }
        //if has children and path has a matching directory
        else if(routes[i].children){
          let r = this.getRouteInfoByID(id, routes[i].children);
          if(r){
            return r;
          }
        }
      }
    }

    //finds and returns the routeInfo with a matching fullpath
    static getRouteInfoByPath(path, routes){
      if(!routes){
        routes = this.routes;
      }
      for(let i=0; i<routes.length; i++){
        if(routes[i].fullpath == path){
          return this.routeToInfo(routes[i]);
        }
        //if has children and path has a matching directory
        else if(routes[i].children && path.indexOf(routes[i].fullpath) == 0){
          let r = this.getRouteInfoByPath(path, routes[i].children);
          if(r){
            return r;
          }
        }
      }
    }

    //push route by id
    static pushByID(routeID, params){
      //find route
      let info = this.getRouteInfoByID(routeID);
      if(info){
        let path = this.convertToDynamicPath(info.fullpath, params);
        let route = this.findRouteByPath(path);
        this.push(route);
      }
      //no route found with a matching ID, so display 404
      else{
        this.push();
      }
    }

     //push a new route
     static push(route, isPopstate){
       //404
       if(!route){
         if(!this.route404){ //no action if 404 route is not set
           return;
         }
         route = this.route404;
         if(!route.fullpath){
           route.fullpath = "/404";
         }
       }

       if(!isPopstate){
         let newUrl = window.origin + route.fullpath;
         window.history.pushState('','',newUrl);
       }


       if(route.title){
         document.title = route.title;
       }

       //todo: move this into its own optional functionality
       document.body.scrollTop = document.documentElement.scrollTop = 0;


       this.currentRoute = route;


       let newComps = [];
       let reuseComps = [];

       //update the components
       for(let r=0; r<route.comps.length; r++){
         let instance;
         let props;
         for(let i=0; i<this.comps.length && !instance; i++){
           if(this.comps[i] instanceof route.comps[r].comp){
             instance = this.comps[i];
             props = route.comps[r].props;
             this.comps.splice(i,1);
             i -= 1;
           }
         }

         //reusing an existing component
         if(instance){
           reuseComps.push(instance);
           if(typeof instance.onPush === "function"){
             instance.onPush(route);
           }
           instance.setProps(props);
         }
         //new component
         else{
           let comp = new route.comps[r].comp(route.comps[r].props);
           newComps.push(comp);
         }
       }

       //unmount the old components
       for(let i=0; i<this.comps.length; i++){
         this.comps[i].unmount();
       }

       //render the new components
       for(let i=0; i<newComps.length; i++){
         Quas.render(newComps[i], "#app");
       }

       //set the current components
       this.comps = newComps;
       for(let i=0; i<reuseComps.length; i++){
         this.comps.push(reuseComps[i]);
       }
    }

    //initalization
    static init(){
      this.routes = [];
      this.aliases = [];
      this.redirects = [];
      this.currentRoute;
      this.comps = []; //all the current instances of components

      //handle back and forward buttons
       window.addEventListener("popstate", function(e) {
         let route = Router.findRouteByPath(e.target.location.pathname);
         Router.push(route, true);
       });
    }
  }
);
