const { Worker, workerData } = require('worker_threads');

function runService(timeName) {
  return new Promise((resolve, reject) => {
    console.log(timeName, new Date());
	
    const worker = new Worker('./service.js', { workerData: null });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
	    reject(new Error(`Worker stopped with exit code ${code}`));  
	  }
    });
  });
};

for (let i =0; i < 2; i++) {
  runService(i).then(msg => {
	console.log(i + ' ' + new Date());
	console.log(msg);
  });
};
