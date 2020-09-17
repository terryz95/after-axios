# after-axios
配置化处理axios后续的操作。

axios可以帮助你：

1. 在请求层面响应HTTP错误和业务错误，并调用自定义配置的回调函数；统一HTTP错误的错误码定义。
2. 简化AxiosResponse数据结构。
3. 在业务接口层面响应错误，并调用自定义配置的回调函数；统一进行loading设置；返回业务结果的Promise，仍可以继续进行其他操作。

### 使用方法

#### 安装

```bash
npm install @terryz95/after-axios
```

#### 引入

```javascript
// 模块导出了三个具名方法
import { createAxios, axiosResHandler, asyncDataHandler } from '@terryz95/after-axios'
```

#### 使用

- createAxios

  createAxios是构造自定义axios实例的方法，除了可以传入axios自定义配置以外，还可以传入一个回调函数配置对象，来全局处理AxiosResponse。

```javascript
const validator = {
  http: (response) => {
    // do something with response
    switch(response.status) {
      case 401:
        // do something when 401
        break;
      case 403:
        // do something when 403
        break;
      case 404:
        // do something when 404
        break;
      // ...other situation
    }
  },
  // result是axios成功返回情况下的response.data（即业务层返回参数数据结构）
  business: (result) => {
    // 如果业务层返回参数结构是{ code: '0000', message: 'ok', success: true, data: {} }
    const { code, message, success } = result
    // do something with code, message, success
  }
}
const axiosConf = {
  // AxiosConfig 详细请参照axios文档
  baseURL: '',
  headers: {},
  // ...other config
}
const axiosInstance = createAxios(validator, axiosConf) // 创建好的自定义axios实例，可以用这个实例来请求service api啦
```

- axiosResHandler

  一个简单的处理函数，用来剥开AxiosResponse的那层data嵌套。

```javascript
// getUserInfo的结果是Promise<BusinessResponse>，而不是Promise<AxiosResponse>
const getUserInfo = () => axiosResHandler(axios.get('/api'))
```

- asyncDataHandler

  接受一个Promise，并且可以配置它的成功callback和失败callback，以及异步过程中的loading；并且再次返回一个resolve的Promise，可以交由其他流程继续处理。

  通常可以在状态库中定义异步action时使用，简化请求过程的处理。

```javascript
// 如果业务层返回参数结构是{ code: '0000', message: 'ok', success: true, data: {} }

const codeFromRes = res => res.code === '0000' // 也可以是res.success === true，只要能标识业务接口调用成功即可
const dataFromRes = res => res.data
const onSuccess = data => {
  console.log(data)
}
const onBussinessError = result => {
  console.log(result) // { code: 'xxxx', message: 'error msg', success: false }
}
const onError = error => {
  if (error instanceof Error) {
    // 这里捕获到的是语法错误或运行时出现的一些错误
    console.warn(error.toString())
  } else {
    // 这里捕获到的是createAxios方法构造的axios实例传递过来的HTTP层错误：{ code: 'HTTP状态码', msg: '错误信息' }
    console.log(error)
  }
}
const onLoadingStart = () => {
  console.log('Loading Start...')
}
const onLoadingEnd = () => {
  console.log('Loading End!')
}

const promise = getUserInfo() // api调用

const result = asyncDataHandler(promise, codeFromRes, dataFromRes, onSuccess, onBussinessError, onError, onLoadingStart, onLoadingEnd)

// 你还可以继续进行其他操作
// result.then((data) => { data可能有可能没有 })
```

### 函数签名

```javascript
/**
 * @description: axios packaging
 * @param {Object} validator - http & business validator
 * @param {HttpValidator} validator.http - http validator
 * @param {BussinessValidator} validator.business - business validator
 * @param {Object} axiosOptions - AxiosRequestConfig
 * @return {Object} AxiosInstance
 */
function createAxios(validator, axiosOptions = {}) {}

/**
 * @description: axiosResHandler
 * @param {Promise} promise - the promise from the axios request
 * @return {Promise} 
 */
function axiosResHandler(promise) {}

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
  onLoadingEnd) {}



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
```

### 导出版本

- `after-axios.cjs.js` - 默认版本，commonjs版本，结合webpack使用
- `after-axios.esm.js` - es6模块版本
- `after-axios.umd.js` - 通用版本

