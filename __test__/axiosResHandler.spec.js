/**
 * @jest-environment node
 */

import axios from 'axios'
import { axiosResHandler } from '../src'
const { api } = require('./constants')
test('axiosResHandler resolve bussiness data directly', () => {
  return axiosResHandler(axios.get(api)).then(data => {
    expect(data.answer).toMatch(/yes|no/)
  })
});
test('axiosResHandler reject', () => {
  return axiosResHandler(axios.get(`${api}/error`)).catch(error => {
    const errorStr = Object.prototype.toString.call(error)
    expect(errorStr).toMatch(/Error/)
  })
});