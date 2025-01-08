class CustomReporter {
  onRunComplete(_, results) {
    // Sort test results: pass first, fail last
    const sortedResults = results.testResults.sort((a, b) => {
      if (a.numFailingTests === 0 && b.numFailingTests > 0) {
        return -1; // a passes, b fails
      }
      if (a.numFailingTests > 0 && b.numFailingTests === 0) {
        return 1; // a fails, b passes
      }
      return 0; // keep original order otherwise
    });

    // Display sorted results
    sortedResults.forEach((testResult) => console.log(`${testResult.numFailingTests === 0 ? "PASS" : "FAIL"}: ${testResult.testFilePath}`));
  }
}

module.exports = CustomReporter;
