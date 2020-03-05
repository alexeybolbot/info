const { workerData, parentPort } = require('worker_threads')

let i = 0;

while(i < 2000000000) i++;

parentPort.postMessage({ i });