const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const { Worker, isMainThread, parentPort } = require('worker_threads');

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
  });

  await server.register(Inert); // Daftarkan modul Inert

  server.route([
    {
      method: 'POST',
      path: '/calculate',
      handler: async (request, h) => {
        if (isMainThread) {
          try {
            const { expression } = request.payload;

            // Membuat worker thread untuk menjalankan perhitungan
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
