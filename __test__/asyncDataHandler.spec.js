/**
 * @jest-environment node
 */

import axios from 'axios'
import { asyncDataHandler, axiosResHandler } from '../src'
const { api } = require('./constants')
test('full args and resolve', () => {
  const promise = axiosResHandler(axios.get(api))
  const codeFromRes = result => result.answer !== undefined
  const dataFromRes = result => result
  const onSuccess = data => console.log('data is', data)
  const onBusinessError = result => console.log('result is', result)
  const onError = error => console.log('error is', error.toString())
  const onLoadingStart = () => console.log('Loading Start at ' + Date.now())
  const onLoadingEnd = () => console.log('Loading End at ' + Date.now())
  return asyncDataHandler(promise, codeFromRes, dataFromRes, onSuccess, onBusinessError, onError, onLoadingStart, onLoadingEnd).then(data => {
    expect(data.answer).toMatch(/yes|no/)
  })
})
test('business reject', () => {
  let isBusinessChecked = false
  const promise = axiosResHandler(axios.get(api))
  const codeFromRes = result => result.forced !== false
  const onBusinessError = result => {
    isBusinessChecked = true
    console.warn('business reject')
  }
  const onError = error => console.log('error is', error.toString())
  return asyncDataHandler(promise, codeFromRes, () => {}, false, onBusinessError, onError).then(() => {
    expect(isBusinessChecked).toBeTruthy()
  })
})
test('http reject', async () => {
  let isHttpChecked = false
  const promise = axiosResHandler(axios.get(`${api}/error`))
  const codeFromRes = result => result.answer !== undefined
  const onBusinessError = result => {
    console.warn('business reject')
  }
  const onError = error => {
    isHttpChecked = true
    console.warn('http reject and error is', error.toString())
  }
  await asyncDataHandler(promise, codeFromRes, () => {}, false, onBusinessError, onError)
  expect(isHttpChecked).toBeTruthy()
})
