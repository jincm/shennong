function HttpInjector($q) {
  var httpInjector = {
    // 请求发出之前，可以用于添加各种身份验证信息
    request: function(config){
      if(localStorage.token) {
        config.headers.token = localStorage.token;
      }
      console.log("http come here and name is " + localStorage.name);
      console.log(config);

      return config;
    },
    // 请求发出时出错
    requestError: function(err){
      if(-1 === err.status) {
        // 远程服务器无响应
      } else if(401 === err.status) {
        // 401 错误一般是用于身份验证失败，具体要看后端对身份验证失败时抛出的错误
      } else if(404 === err.status) {
        // 服务器返回了 404
      }

      return $q.reject(err);
    },
    // 成功返回了响应
    response: function(res){
      console.log("response in httpinjector " + JSON.stringify(res));
      return res;
    },
    // 返回的响应出错，包括后端返回响应时，设置了非 200 的 http 状态码
    responseError: function(err){
      return $q.reject(err);
    }
  };
  return httpInjector;
}

angular
  .module('cbtNgCssApp')
  .factory('HttpInjector', ['$q', HttpInjector]);

angular
  .module('cbtNgCssApp')
  .config(['$httpProvider', function($httpProvider){
    $httpProvider.interceptors.push(HttpInjector);
  }]);

