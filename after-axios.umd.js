(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('axios'), require('lodash')) :
  typeof define === 'function' && define.amd ? define(['exports', 'axios', 'lodash'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.AfterAxios = {}, global.axios, global._));
}(this, (function (exports, axios, _) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
  var ___default = /*#__PURE__*/_interopDefaultLegacy(_);

  var httpRscMap = new Map([
    [200, 'OK'],
    [201, 'Created'],
    [202, 'Accepted'],
    [203, 'Non-Authoritative Information'],
    [204, 'No Content'],
    [205, 'Reset Content'],
    [206, 'Partial Content'],
    [300, 'Multiple Choices'],
    [301, 'Moved Permanently'],
    [302, 'Found'],
    [303, 'See Other'],
    [304, 'Not Modified'],
    [307, 'Temporary Redirect'],
    [308, 'Permanent Redirect'],
    [400, 'Bad Request'],
    [401, 'Unauthorized'],
    [402, 'Payment Required'],
    [403, 'Forbidden'],
    [404, 'Not Found'],
    [405, 'Method Not Allowed'],
    [406, 'Not Acceptable'],
    [407, 'Proxy Authentication Required'],
    [408, 'Request Timeout'],
    [409, 'Conflict'],
    [410, 'Gone'],
    [411, 'Length Required'],
    [412, 'Precondition Failed'],
    [413, 'Payload Too Large'],
    [414, 'URI Too Long'],
    [415, 'Unsupported Media Type'],
    [416, 'Range Not Satisfiable'],
    [417, 'Expectation Failed'],
    [418, `I'm a teapot`],
    [422, 'Unprocessable Entity'],
    [425, 'Too Early'],
    [426, 'Upgrade Required'],
    [428, 'Precondition Required'],
    [429, 'Too Many Requests'],
    [431, 'Request Header Fields Too Large'],
    [451, 'Unavailable For Legal Reasons'],
    [500, 'Internal Server Error'],
    [501, 'Not Implemented'],
    [502, 'Bad Gateway'],
    [503, 'Service Unavailabl'],
    [504, 'Gateway Timeout'],
    [505, 'HTTP Version Not Supported'],
    [506, 'Variant Also Negotiates'],
    [507, 'Insufficient Storage'],
    [508, 'Loop Detected'],
    [510, 'Not Extended'],
    [511, 'Network Authentication Required'],
  ]);

  /**
   * @description: axios packaging
   * @param {Object} validator - http & business validator
   * @param {HttpValidator} validator.http - http validator
   * @param {BussinessValidator} validator.business - business validator
   * @param {Object} axiosOptions - AxiosRequestConfig
   * @return {Object} AxiosInstance
   */
  function createAxios(validator, axiosOptions = {}) {
    let http = null;
    let business = null;
    if (___default['default'].isPlainObject(validator)) {
      http = validator.http;
      business = validator.business;
    }

    let instance = axios__default['default'].create(Object.assign({}, {
      timeout: 5000,
    }, axiosOptions));

    instance.interceptors.request.use(config => {
      return config
    }, error => {
      return Promise.reject(error)
    });
    
    instance.interceptors.response.use(res => {
      ___default['default'].isFunction(business) && business(res.data);
      return Promise.resolve(res)
    }, error => {
      const { response } = error;
      if (response && ___default['default'].isNumber(response.status)) {
        ___default['default'].isFunction(http) && http(response);
        return Promise.reject({ code: response.status, msg: httpRscMap.get(response.status) })
      }
      return Promise.reject({
        code: -1,
        msg: 'Network Error. Please try again later',
      })
    });

    return instance
  }

  /**
   * @description: axiosResHandler
   * @param {Promise} promise - the promise from the axios request
   * @return {Promise} 
   */
  const axiosResHandler = promise => promise.then(res => res.data).catch(error => Promise.reject(error));

  /**
   * @description: A handler to deal with the promise result from the axiosResHandler
   * @param {Promise<BussinessType>} asyncData - the promise result from the axiosResHandler
   * @param {codeFromRes} codeFromRes - method which can get the bussiness code from the res
   * @param {dataFromRes} dataFromRes - method which can get the bussiness data from the res
   * @param {onSuccess | false} onSuccess - callback when bussiness code is right
   * @param {onBusinessError | false} onBusinessError - callback when bussiness code is wrong (if all actions were done in the axios res interceptors, u can do nothing here)
   * @param {onError | false} onError - callback when http error or syntax error is catched (if all actions were done in the axios res interceptors, u can do nothing here)
   * @param {Function} [onLoadingStart] - loading before asyncData
   * @param {Function} [onLoadingEnd] - loading after asyncData
   * @return {Promise}
   */
  async function asyncDataHandler(
    asyncData,
    codeFromRes,
    dataFromRes,
    onSuccess,
    onBusinessError,
    onError,
    onLoadingStart,
    onLoadingEnd,
  ) {
    if (!___default['default'].isFunction(codeFromRes) || !___default['default'].isFunction(dataFromRes) ) {
      return Promise.resolve()
    }
    ___default['default'].isFunction(onLoadingStart) && onLoadingStart();
    try {
      const result = await asyncData;
      ___default['default'].isFunction(onLoadingEnd) && onLoadingEnd();
      if (___default['default'].isFunction(codeFromRes) && codeFromRes(result)) {
        const data = (___default['default'].isFunction(dataFromRes) && dataFromRes(result)) || null;
        if (onSuccess && ___default['default'].isFunction(onSuccess)) {
          onSuccess(data);
        }
        return Promise.resolve(data)
      } else {
        // business error: it means http res status code is ok but business check is not passed
        onBusinessError && ___default['default'].isFunction(onBusinessError) && onBusinessError(result);
      }
    } catch (e) {
      ___default['default'].isFunction(onLoadingEnd) && onLoadingEnd();
      // http error catch or syntax error catch
      // maybe { code: number, msg: string } or new Error()
      onError && ___default['default'].isFunction(onError) && onError(e); 
    }
    return Promise.resolve()
  }

  /**
   * @callback HttpValidator
   * @param {number} status - response status
   * @return {void} 
   */

  /**
   * @callback BussinessValidator
   * @param {*} data - response data
   * @return {void} 
   */

  /**
   * @callback codeFromRes
   * @param {Object} result - result from the axiosResHandler
   * @return {string | number} bussiness code
   */

  /**
   * @callback dataFromRes
   * @param {Object} result - result from the axiosResHandler
   * @return {*} bussiness data
   */

  /**
   * @callback onSuccess
   * @param {*} data - bussiness data
   * @return {void}
   */

  /**
   * @callback onBusinessError
   * @param {Object} result - result from the axiosResHandler
   * @return {void}
   */

  /**
   * @callback onError
   * @param {Object | Error} e - error
   * @return {void}
   */

  exports.asyncDataHandler = asyncDataHandler;
  exports.axiosResHandler = axiosResHandler;
  exports.createAxios = createAxios;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
