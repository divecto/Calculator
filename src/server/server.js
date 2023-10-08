const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const { Worker, isMainThread } = require('worker_threads');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  await server.register(Inert); // Daftarkan modul Inert

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '../client',
      },
    },
  });

  server.route([
    {
      method: 'POST',
      path: '/calculate',
      handler: async (request, h) => {
        try {
          const { expression } = request.payload;
  
          if (!isMainThread) {
            // Memproses ekspresi matematika menggunakan worker thread
            const worker = new Worker('./calculator_worker.js', {
              workerData: expression,
            });
  
            return new Promise((resolve, reject) => {
              worker.on('message', (message) => {
                // Terima hasil dari worker thread dan kirimkan sebagai respons
                resolve({ result: message.result, error: message.error });
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
          } else {
            return h.response({ error: 'Cannot process calculation on the main thread' }).code(500);
          }
        } catch (error) {
          return h.response({ error: 'Failed to calculate' }).code(500);
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
