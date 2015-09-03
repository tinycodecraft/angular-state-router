'use strict';

module.exports = ['$q', '$injector', '$state', '$rootScope', function($q, $injector, $state, $rootScope) {

  // Instance
  var _self = {};

  /**
   * Resolve
   * 
   * @param  {Object}  resolve A hash Object of items to resolve
   * @return {Promise}         A promise fulfilled when templates retireved
   */
  var _resolve = function(resolve) {
    var resolvesPromises = {};

    angular.forEach(resolve, function(value, key) {
      var resolution = angular.isString(value) ? $injector.get(value) : $injector.invoke(value, null, null, key);
      resolvesPromises[key] = $q.when(resolution);
    });

    return $q.all(resolvesPromises);
  };
  _self.resolve = _resolve;

  /**
   * Middleware
   * 
   * @param  {Object}   request A data Object
   * @param  {Function} next    A callback, function(err)
   */
  var _handle = function(request, next) {
    var current = $state.current();

    if(!current) {
      return next();
    }

    $rootScope.$broadcast('$stateResolveBegin');

    _resolve(current.resolve || {}).then(function(locals) {
      angular.extend(request.locals, locals);
      $rootScope.$broadcast('$stateResolveEnd');
      next();

    }, function(err) {
      $rootScope.$broadcast('$stateResolveError', err);
      next(new Error('Error resolving state'));
    });
  };

  // Register middleware layer
  $state.$use(_handle, 101);

  return _self;
}];
