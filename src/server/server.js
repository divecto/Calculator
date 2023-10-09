const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const path = require('node:path');
const { Worker, isMainThread } = require('worker_threads');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    address: '0.0.0.0',
    host: 'localhost',
  });

  await server.register(Inert); // Daftarkan modul Inert

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: path.join(__dirname, '../client'),
        index: ['index.html', 'default.html']
      }
    }
  });

  server.route([
    {
      method: 'POST',
      path: '/calculate',
      handler: async (request, h) => {
        try {
          var expression = request.payload;

          // Memproses ekspresi matematika menggunakan worker thread
          const worker = new Worker(path.join(__dirname, './calculator_worker.js'), {
            workerData: expression["exp"],
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
        } catch (error) {
          return h.response({ error: 'Failed to calculate' }).code(500);
        }
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
  console.log("Current directory:", __dirname);
};

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});

init();
