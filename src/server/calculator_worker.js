const { workerData, parentPort } = require('worker_threads');

// Fungsi untuk melakukan perhitungan
function calculateExpression(expression) {
  try {
    const result = eval(expression); // Evaluasi ekspresi matematika
    parentPort.postMessage({ "result": result });

  } catch (error) {
    console.log(error);
    parentPort.postMessage({ error: 'Terjadi kesalahan dalam perhitungan.' });
  }
}

// Menerima ekspresi perhitungan dari thread utama dan menghitung hasilnya
calculateExpression(workerData);
