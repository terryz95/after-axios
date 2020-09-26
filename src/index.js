import axios from 'axios'
import _ from 'lodash'
import { httpRscMap } from 'http-rsc'

/**
 * @description: axios packaging
 * @param {Object} validator - http & business validator
 * @param {HttpValidator} validator.http - http validator
 * @param {BussinessValidator} validator.business - business validator
 * @param {Object} axiosOptions - AxiosRequestConfig
 * @return {Object} AxiosInstance
 */
export function createAxios(validator, axiosOptions = {}) {
  let http = null
  let business = null
  if (_.isPlainObject(validator)) {
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
    _.isFunction(business) && business(res.data)
    return Promise.resolve(res)
  }, error => {
    const { response } = error
    if (response && _.isNumber(response.status)) {
      _.isFunction(http) && http(response)
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
 * @param {onError | false} onError - callback when http error or syntax error is catched (if all actions were done in the axios res interceptors, u can do nothing here)
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
  onError,
  onLoadingStart,
  onLoadingEnd,
) {
  if (!_.isFunction(codeFromRes) || !_.isFunction(dataFromRes) ) {
    console.warn(`Arguments 'codeFromRes' and 'dataFromRes' must be functions`)
    return Promise.resolve()
  }
  _.isFunction(onLoadingStart) && onLoadingStart()
  try {
    const result = await asyncData
    _.isFunction(onLoadingEnd) && onLoadingEnd()
    if (_.isFunction(codeFromRes) && codeFromRes(result)) {
      const data = (_.isFunction(dataFromRes) && dataFromRes(result)) || null
      if (onSuccess && _.isFunction(onSuccess)) {
        onSuccess(data)
      }
      return Promise.resolve(data)
    } else {
      // business error: it means http res status code is ok but business check is not passed
      onBusinessError && _.isFunction(onBusinessError) && onBusinessError(result)
      return Promise.reject({ error: result, type: 'business' })
    }
  } catch (e) {
    _.isFunction(onLoadingEnd) && onLoadingEnd()
    // http error catch or syntax error catch
    // maybe { code: number, msg: string } or new Error()
    onError && _.isFunction(onError) && onError(e) 
    return Promise.resolve({ error: e, type: e instanceof Error ? 'syntax' : 'http' })
  }
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