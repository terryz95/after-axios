/**
 * @jest-environment node
 */

import { createAxios, axiosResHandler } from '../src'
const { api } = require('./constants')
const myAxios = createAxios({}, {timeout: 10000})
test('myAxios resolve', () => {
  return myAxios.get(api).then(data => {
    expect(data.statusText).toBe('OK')
  })
})
test('myAxios resolve by axiosResHandler', () => {
  return axiosResHandler(myAxios.get(api)).then(data => {
    expect(data.answer).toMatch(/yes|no/)
  })
})
test('myAxios reject by axiosResHandler which has response', () => {
  return axiosResHandler(myAxios.get(`${api}/error`)).catch(error => {
    expect(error.code).toBe(404)
  })
})
test('myAxios reject by axiosResHandler which has not response', () => {
  return axiosResHandler(myAxios.get(`no a url`)).catch(error => {
    expect(error.code).toBe(-1)
  })
})
test('myAxios2 bussiness check', () => {
  let isHttpChecked = false
  let isBussinessChecked = false
  const myAxios2 = createAxios({
    http: ({status}) => {
      switch (status) {
        case 404:
          isHttpChecked = true
      }
    },
    business: () => {
      isBussinessChecked = true
    }
  }, {
    baseURL: api.replace('/api', '')
  })
  return axiosResHandler(myAxios2.get(`/api`)).then(data => {
    expect(isBussinessChecked).toBeTruthy()
    expect(data.answer).toMatch(/yes|no/)
    expect(isHttpChecked).toBeFalsy()
  })
})
test('myAxios2 http check', () => {
  let isHttpChecked = false
  let isBussinessChecked = false
  const myAxios2 = createAxios({
    http: ({status}) => {
      switch (status) {
        case 404:
          isHttpChecked = true
      }
    },
    business: () => {
      isBussinessChecked = true
    }
  }, {
    baseURL: api.replace('/api', '')
  })
  return axiosResHandler(myAxios2.get(`/api/error`)).catch(() => {
    expect(isBussinessChecked).toBeFalsy()
    expect(isHttpChecked).toBeTruthy()
  })
})