/**
  # module
  ---
  Managing cookies
  ---
*/
Quas.export({
  /**
    # func
    ---
    Returns a cookie value by key
    ---
    @param {String} key

    @return {String}

    ```
    let token = Quas.getCookie("token");
    console.log(token);
    ```
  */
  get : (key) => {
    var name = key + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
  },

  /**
  # func
  ---
  Sets a cookie
  ---

  @param {String} key
  @param {String} value
  @param {Date} date - (optional) default is 12hrs from now
  @param {String} path - (optional) default is "/"
  */
  set : (k, v, date, path) => {
    if(path === undefined){
      path = "/";
    }
    //12hrs if not defined
    if(date === undefined){
      date = new Date();
      var expireTime = date.getTime() + 43200000;
      date.setTime(expireTime);
    }
     document.cookie = k + "=" + v + ";expires="+ date.toGMTString() +";path="+ path;
  },

  /**
    # func
    ---
    Removes a cookie by key
    ---

    @param {String} key
  */
  clear : (k) => {
    document.cookie = k + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
  }
})
