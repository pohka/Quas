/**
  # module
  ---
  Handling of the mapping and changes on the page for a single page web app
  ---

  @prop {Array<Object>} routes - all of the mapped routes
  @prop {Array<Object>} aliases - all of the aliases
  @prop {Array<Object>} redirects - all of the redirects
  @prop {Array<Object>} comps - all of the current instances of component
  @prop {Object} currentRoute - the current route being displayed
*/
Quas.export({
  /**
    ---
    maps a route and sets the fullpath key for all the child routes
    ---

    @param {Object} routeData - data for this route

    ```
    Router.map({
      path : "/home",
      id : "home", //(optional) must be unique
      title : "Home", //(optional)

      //(optional) all of the components this route uses
      comps : [
        {
          comp : Navbar, //name of class
          props : {
            options : ["item 1, item 2"]
          }
        }
      ],
      children : [], //(optional) child routes
      meta : [ //(optional) meta data
        {
          name : "title",
          content : "My Title"
        },
        {
          name : "description",
          content : "my description"
        },
      ]
    });
    ```
  */
  map : (data) => {
    Router.setFullPathToChildRoutes(data.children, data.path);
    data.fullpath = data.path;
    Router.routes.push(data);
  },

  /*
    Sets the fullpath for an array of routes
    This is used with Router.map() to set the fullpath key in the route data

    @param {Array<Object>} children - child nodes of the route
    @param {String} parentPath - path of the parent node
  */
  setFullPathToChildRoutes : (children, parentPath) => {
    if(!children){
      return;
    }

    for(let i=0; i<children.length; i++){
      children[i].fullpath = parentPath + children[i].path;
      Router.setFullPathToChildRoutes(children[i].children, children[i].fullpath);
    }
  },

  /**
    ---
    Assigns the route for when a page is not found, known as a 404 error
    ---

    @param {Object} route - 404 route data
  */
  setRoute404 : (route) => {
    Router.route404 = route;
  },

  /*
    ---
    Returns an object of url params if the paths were matching.
    Router will take into account dynamic paths for the routeFullpath

    Example:
    /docs/:page == /docs/setup
    returns {page : "setup"}
    ---

    @param {String} routeFullpath - the fullpath key of the route
    @param {String} path - the other path for comparisions

    @return {Object|undefined}


  */
  matchingRoutePath : (routeFullpath, path) => {
    let a = routeFullpath.split("/");
    let bInfo = path.split("#");
    let b = bInfo[0].split("/");
    if(a.length != b.length){
      return;
    }

    let params = {};
    if(bInfo.length > 1){
      params.hash = bInfo[1];
    }

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
  },

  /**
    ---
    Converts a path using the params
    ---

    @param {String} path - A static or dynamic path
    @param {Object} params - The parameters to pass to the path

    @return {Object}

    ```
    //returns: /profile/john
    Router.convertToDynamicPath("/profile/:user", {user:"john"});

    //returns: /about
    Router.convertToDynamicPath("/about", {user:"john"});

    //returns: /about
    Router.convertToDynamicPath("/about", {});
    ```
  */
  convertToDynamicPath : (path, params) => {
    for(let i in params){
      let exp = new RegExp(":"+i, "g");
      path = path.replace(exp, params[i]);
    }
    if(params.hash){
      path += "#" + params.hash;
    }
    return path;
  },

  /**
    ---
    loads the route based on the current url
    ---
  */
  load : () => {
    let path = window.location.pathname;

    let route = Router.findRouteByPath(path);

    if(!route){
      route = Router.route404;
    }

    if(route){
      if(route.title){
        document.title = route.title;
      }

      if(route.meta){
        Router.setMetaData(route.meta);
      }

      Router.currentRoute = route;
      if(route.comps){
        for(let i=0; i<route.comps.length; i++){
          let props = {};
          if(route.comps[i].props){
            for(let p in route.comps[i].props){
              props[p] = route.comps[i].props[p];
            }
          }
          let comp = new route.comps[i].comp(props);
          Router.comps.push(comp);

          Quas.render(comp, "#app");
        }
      }
    }
  },

  /**
    ---
    Sets the document meta data, using the data from routes
    ---

    @param {Array<Object>} metaData - The data to set

    ```
    Router.setMetaData([
      {
        name : "title",
        content : "My Title"
      },
      {
        prop : "og:title",
        content : "My Title"
      }
    ]);

    //results in:
    // <meta name="title" content="My Title">
    // <meta property="og:title" content="My Title">
    ```
  */
  setMetaData : (data) =>{
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
  },

  /**
    ---
    Adds a route alias, which will load the "to" page but without changing the url
    ---

    @param {Object} alias - the to and from data

    ```
    // "/other" will load "/home"
    Router.addAlias({
      from : "/other",
      to : "/home"
    });

    // "/p/1234" will load "/post/1234"
    Router.addAlias({
      from : "/p/:id",
      to : "/post/:id"
    });
    ```
  */
  addAlias : (alias) => {
    Router.aliases.push(alias);
  },

  /**
    ---
    Adds a route redirect, which will load the "to" page and changes the url
    ---

    @param {String} redirect - the to and from data

    ```
    // "/oldPage" sets the url to "/home"
    // and also loads "/home"
    Router.addRedirect({
      from : "/oldPage",
      to : "/home"
    });

    // "/p/1234" sets the url to "/post/1234"
    // and also loads "/post/1234"
    Router.addAlias({
      from : "/p/:id",
      to : "/post/:id"
    });
    ```
  */
  addRedirect : (redirect) => {
    Router.redirects.push(redirect);
  },

  /*
    ---
    Finds a mapped route by the path and returns it
    ---

    @param {String} path

    @return {Object|undefined}

    ```
    Router.findRouteByPath("/home");
    ```
  */
  findRouteByPath : (path) => {
    let route;
    for(let i=0; i<Router.redirects.length; i++){
      let params = Router.matchingRoutePath(Router.redirects[i].from, path);
      if(params){
        let nextPath = Router.convertToDynamicPath(Router.redirects[i].to, params);
        window.history.replaceState('','',window.origin + nextPath);
        route = Router.findRouteByPath(nextPath);
      }
    }

    if(!route){
      let from;
      for(let i=0; i<Router.aliases.length; i++){
        let params = Router.matchingRoutePath(Router.aliases[i].from, path);
        if(params){
          path = Router.convertToDynamicPath(Router.aliases[i].to, params);
          from = Router.convertToDynamicPath(Router.aliases[i].from, params);
          break;
        }
      }

      route = Router.findRouteByPathLoop(path, Router.routes, []);

      //alias
      if(from){
        route.fullpath = from;
      }
    }

    return route;
  },

  /*
    ---
    Recusively loops through children, Router is used by Router.findRouteByPath()
    ---

    @param {String} path
    @param {Array<Object>} routes - the routes the search through
    @param {Array<Object>} parentComps - the components the parent route uses

    @return {Object|undefined}
  */
  findRouteByPathLoop : (path, routes, parentComps) => {
    for(let i=0; i<routes.length; i++){
      //found match
      let match = Router.matchingRoutePath(routes[i].fullpath, path);
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
          clone.fullpath = Router.convertToDynamicPath(clone.fullpath, match);
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


        let r = Router.findRouteByPathLoop(path, routes[i].children, nextParentComps);
        if(r){
          return r;
        }
      }
    }
  },

  /*
    ---
    clones the data from a route into a lighter object which will be read only
    the returned object will have all the route values except comps and children
    ---

    @param {Object} route

    @return {Object}
  */
  routeToInfo : (route) => {
    let info = {};
    for(let k in route){
      if(k != "comps" && k != "children"){
        info[k] = route[k];
      }
    }
    return info;
  },

  /**
    ---
    Finds and returns the routeInfo with the matching id. The routeInfo is a read only verison of the route data with every key except children and comps
    ---

    @param {String} id - route id
    @param {Array<Object>} routes - (exclude) all of the routes

    @return {Object|undefined}

    ```
    let homeRouteInfo = Router.getRouteInfoByID("home");
    console.log(homeRouteInfo.fullpath);
    ```
  */
  getRouteInfoByID : (id, routes) => {
    if(!routes){
      routes = Router.routes;
    }
    for(let i=0; i<routes.length; i++){
      if(routes[i].id == id){
        return Router.routeToInfo(routes[i]);
      }
      //if has children and path has a matching directory
      else if(routes[i].children){
        let r = Router.getRouteInfoByID(id, routes[i].children);
        if(r){
          return r;
        }
      }
    }
  },

  /**
    ---
    Finds and returns the routeInfo with the matching id. The routeInfo is a read only verison of the route data with every key except children and comps
    ---

    ```
    let homeRouteInfo = Router.getRouteInfoByPath("/home");
    ```
  */
  getRouteInfoByPath : (path, routes) => {
    if(!routes){
      routes = Router.routes;
    }
    for(let i=0; i<routes.length; i++){
      if(routes[i].fullpath == path){
        return Router.routeToInfo(routes[i]);
      }
      //if has children and path has a matching directory
      else if(routes[i].children && path.indexOf(routes[i].fullpath) == 0){
        let r = Router.getRouteInfoByPath(path, routes[i].children);
        if(r){
          return r;
        }
      }
    }
  },

  /**
    ---
    Push a route by id. By pushing it will load Router matching route
    ---

    @param {String} routeID - Route ID
    @param {Object} params - Route parameters
  */
  pushByID : (routeID, params) => {
    //find route
    let info = Router.getRouteInfoByID(routeID);
    if(info){
      let path = Router.convertToDynamicPath(info.fullpath, params);
      let route = Router.findRouteByPath(path);
      Router.push(route);
    }
    //no route found with a matching ID, so display 404
    else{
      Router.push();
    }
  },

   /*
    ---
    Push a new route, loads 404 if route param is undefined
    ---

    @param {Object} route - a route object
    @param {Boolean} isPopstate - (optional) set to  true if pushing from a history popstate

  */
   push : (route, isPopstate) => {
     //404
     if(!route){
       if(!Router.route404){ //no action if 404 route is not set
         return;
       }
       route = Router.route404;
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


     Router.currentRoute = route;


     let newComps = [];
     let reuseComps = [];

     //update the components
     for(let r=0; r<route.comps.length; r++){
       let instance;
       let props;
       for(let i=0; i<Router.comps.length && !instance; i++){
         if(Router.comps[i] instanceof route.comps[r].comp){
           instance = Router.comps[i];
           props = route.comps[r].props;
           Router.comps.splice(i,1);
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
     for(let i=0; i<Router.comps.length; i++){
       Router.comps[i].unmount();
     }

     //render the new components
     for(let i=0; i<newComps.length; i++){
       Quas.render(newComps[i], "#app");
     }

     //set the current components
     Router.comps = newComps;
     for(let i=0; i<reuseComps.length; i++){
       Router.comps.push(reuseComps[i]);
     }

     for(let r=0; r<Router.comps.length; r++){
       if(typeof Router.comps[r].onAfterPush === "function"){
         Router.comps[r].onAfterPush();
       }
     }
  },

  //initalization
  init : () => {
    Router.routes = [];
    Router.aliases = [];
    Router.redirects = [];
    Router.currentRoute;
    Router.comps = []; //all the current instances of components

    //handle back and forward buttons
     window.addEventListener("popstate", function(e) {
       let route = Router.findRouteByPath(e.target.location.pathname);
       Router.push(route, true);
     });
  }
});
