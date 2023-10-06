const Hapi = require('@hapi/hapi');
const { Worker, isMainThread, parentPort } = require('worker_threads');

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
  });

  server.route([
    {
      method: 'POST',
      path: '/calculate',
      handler: async (request, h) => {
        if (isMainThread) {
          try {
            // Membuat worker thread untuk menjalankan perhitungan
            const worker = new Worker('./calculator.js', {
              workerData: request.payload.expression,
            });

            return new Promise((resolve, reject) => {
              worker.on('message', (message) => {
                // Terima hasil dari worker thread
                resolve({ result: message.result });
              });

              worker.on('error', (error) => {
                reject(error);
              });

              worker.on('exit', (code) => {
                if (code !== 0) {
                  reject(new Error(`Worker stopped with exit code ${code}`));
                }
              });
            });
          } catch (error) {
            return h.response({ error: 'Failed to calculate' }).code(500);
          }
        }
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();