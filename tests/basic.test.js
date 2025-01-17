/* eslint-disable */
const fs = require('fs');

const testValuesPath = `${__dirname}/test-values.yaml`; // File where the content will end after the tool is executed
const testReadmePath = `${__dirname}/test-readme.md`; // File where the content will end after the tool is executed
const expectedReadmePath = `${__dirname}/expected-readme.md`; // File that must result from executing the tool providing the test README and values

const { runReadmeGenerator } = require('../index.js');

test('Check basic functionality', () => {
  // Run readme gnerator with the test files
  const options = {
    readme: testReadmePath,
    values: testValuesPath,
  };
  runReadmeGenerator(options);

  // Check the output is the expected one
  fs.writeFileSync('/tmp/result', fs.readFileSync(testReadmePath));
  expect(fs.readFileSync(testReadmePath)).toEqual(fs.readFileSync(expectedReadmePath));
});
