// Global screenshot API - use object to avoid reference capture issues
const screenshotAPI = {
  captureScreenshot: (label) => {
    // Silently ignore if not initialized
  }
};

// Conditional export
let useScreenshotLogger;

if (process.env.NODE_ENV !== 'production') {
  useScreenshotLogger = require('./useScreenshotLogger').useScreenshotLogger;
} else {
  useScreenshotLogger = () => {};
}

// Export global function for components to use
function setCaptureFunction(captureFunction) {
  screenshotAPI.captureScreenshot = captureFunction;
}

// Export the function from the object
const captureScreenshot = (...args) => screenshotAPI.captureScreenshot(...args);

module.exports = { useScreenshotLogger, captureScreenshot, setCaptureFunction };
exports.useScreenshotLogger = useScreenshotLogger;
exports.captureScreenshot = captureScreenshot;
exports.setCaptureFunction = setCaptureFunction;