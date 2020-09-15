import axios from 'axios'
import { isPlainObject, isNumber, isFunction } from 'lodash-es'
import { httpRscMap } from 'http-rsc'

/**
 * @description: axios packaging
 * @param {Object} validator - http & business validator
 * @param {HttpValidator} validator.http - http validator
 * @param {BussinessValidator} validator.business - business validator
 * @param {Object} axiosOptions - AxiosRequestConfig
 * @return {Object} AxiosInstance
 */
export default function (validator, axiosOptions = {}) {
  let http = null
  let business = null
  if (isPlainObject(validator)) {
    http = validator.http
    business = validator.business
  }

  let instance = axios.create(Object.assign({}, {
    timeout: 5000,
  }, axiosOptions))

  instance.interceptors.request.use(config => {
    return config
  }, error => {
    return Promise.reject(error)
  })
  
  instance.interceptors.response.use(res => {
    isFunction(business) && business(res.data)
    return Promise.resolve(res)
  }, error => {
    const { response } = error
    if (response && isNumber(response.status)) {
      isFunction(http) && http(response)
      return Promise.reject({ code: response.status, msg: httpRscMap.get(response.status) })
    }
    return Promise.reject({
      code: -1,
      msg: 'Network Error. Please try again later',
    })
  })

  return instance
}

/**
 * @description: axiosResHandler
 * @param {Promise} promise - the promise from the axios request
 * @return {Promise} 
 */
export const axiosResHandler = promise => promise.then(res => res.data).catch(error => Promise.reject(error))

/**
 * @description: A handler to deal with the promise result from the axiosResHandler
 * @param {Promise<BussinessType>} asyncData - the promise result from the axiosResHandler
 * @param {codeFromRes} codeFromRes - method which can get the bussiness code from the res
 * @param {dataFromRes} dataFromRes - method which can get the bussiness data from the res
 * @param {onSuccess | false} onSuccess - callback when bussiness code is right
 * @param {onBusinessError | false} onBusinessError - callback when bussiness code is wrong (if all actions were done in the axios res interceptors, u can do nothing here)
 * @param {onHTTPError | false} onHTTPError - callback when http error or syntax error is catched (if all actions were done in the axios res interceptors, u can do nothing here)
 * @param {Function} [onLoadingStart] - loading before asyncData
 * @param {Function} [onLoadingEnd] - loading after asyncData
 * @return {Promise}
 */
export async function asyncDataHandler(
  asyncData,
  codeFromRes,
  dataFromRes,
  onSuccess,
  onBusinessError,
  onHTTPError,
  onLoadingStart,
  onLoadingEnd,
) {
  if (!isFunction(codeFromRes) || !isFunction(dataFromRes) ) {
    console.warn(`Arguments 'codeFromRes' and 'dataFromRes' must be functions`)
    return Promise.resolve()
  }
  isFunction(onLoadingStart) && onLoadingStart()
  try {
    const result = await asyncData
    isFunction(onLoadingEnd) && onLoadingEnd()
    if (isFunction(codeFromRes) && codeFromRes(result)) {
      const data = (isFunction(dataFromRes) && dataFromRes(result)) || null
      if (onSuccess && isFunction(onSuccess)) {
        onSuccess(data)
      }
      return Promise.resolve(data)
    } else {
      // business error: it means http res status code is ok but business check is not passed
      onBusinessError && isFunction(onBusinessError) && onBusinessError(result)
    }
  } catch (e) {
    isFunction(onLoadingEnd) && onLoadingEnd()
    // http error catch or syntax error catch
    // maybe { code: number, msg: string } or new Error()
    onHTTPError && isFunction(onHTTPError) && onHTTPError(e) 
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
 * @callback onHTTPError
 * @param {Object | Error} e - error
 * @return {void}
 */