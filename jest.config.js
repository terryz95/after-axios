module.exports = {
  testMatch: ['<rootDir>/__test__/*.(spec|test).js?(x)'],
  testEnvironment: "node",
  transform: {
    // 将.js后缀的文件使用babel-jest处理
    '^.+\\.js$': 'babel-jest',
  },
  // 下面非要从重要, 将不忽略 lodash-es, other-es-lib 这些es库, 从而使babel-jest去处理它们
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(lodash-es|http-rsc))',
  ],
}
