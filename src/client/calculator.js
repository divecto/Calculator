const calculator = {
    displayNumber: '0',
    operator: null,
    firstNumber: null,
    waitingForSecondNumber: false
};

function updateDisplay() {
    document.querySelector("#displayNumber").innerText = calculator.displayNumber;
}

function clearCalculator() {
    calculator.displayNumber = '0';
    calculator.operator = null;
    calculator.firstNumber = null;
    calculator.waitingForSecondNumber = false;
}

function inputDigit(digit) {
    if (digit === '.' && calculator.displayNumber.includes('.')) {
        // Jika pengguna mencoba memasukkan titik (.) lagi, abaikan.
        alert('Operator Desimal telah ditetapkan')
        return;
    }

    if (calculator.displayNumber === '0' || calculator.waitingForSecondNumber) {
        calculator.displayNumber = digit;
        calculator.waitingForSecondNumber = false;
    } else {
        calculator.displayNumber += digit;
    }
    updateDisplay();
}

function inverseNumber() {
    if (calculator.displayNumber === '0') {
        return;
    }
    calculator.displayNumber = calculator.displayNumber * -1;
}

function handleOperator(operator) {
    if (!calculator.waitingForSecondNumber) {
        calculator.operator = operator;
        calculator.waitingForSecondNumber = true;
        calculator.firstNumber = calculator.displayNumber;
        calculator.displayNumber = '0';
    } else {
        alert('Operator sudah ditetapkan')
    }
}

function performCalculation() {
    if (calculator.firstNumber == null || calculator.operator == null) {
        alert("Anda belum menetapkan operator");
        return;
    }

    let result = 0;
    if (calculator.operator === "+") {
        result = parseFloat(calculator.firstNumber) + parseFloat(calculator.displayNumber);
    } else if (calculator.operator === "-") {
        result = parseFloat(calculator.firstNumber) - parseFloat(calculator.displayNumber);
    } else if (calculator.operator === "÷") {
        if (displayNum === 0) {
            alert("Tidak bisa membagi dengan nol");
            return;
        }
        result = parseFloat(calculator.firstNumber) / parseFloat(calculator.displayNumber);
    } else {
        result = parseFloat(calculator.firstNumber) * parseFloat(calculator.displayNumber);
    }


    calculator.displayNumber = result;
}

function backspace() {
    calculator.displayNumber = calculator.displayNumber.slice(0, -1);
    if (calculator.displayNumber === '') {
        calculator.displayNumber = '0';
    }
    updateDisplay();
}

function addPercentage() {
    if (calculator.displayNumber === '0') {
        return;
    }

    // Mengkonversi nilai displayNumber menjadi float dan membaginya dengan 100
    const value = parseFloat(calculator.displayNumber) / 100;

    // Menetapkan hasil persen kembali ke displayNumber
    calculator.displayNumber = value.toString();

    // Memperbarui tampilan kalkulator
    updateDisplay();
}

// Menambahkan fungsi untuk mengirim ekspresi matematika ke server
function sendExpressionToServer(expression) {
    exp = expression.replace('×', '*').replace('÷', '/').replace('–', '-').replace(".", '.');
    console.log(exp);
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "exp": exp
        }),
    })
        .then((response) => {
            var res = response.json();
            res.then((data) => {
                console.log(data);
                if (data.result == null) {
                    calculator.displayNumber = "null";
                } else {
                    calculator.displayNumber = data.result.toString();
                }

                updateDisplay();
            })
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}


const buttons = document.querySelectorAll(".button");
for (let button of buttons) {
    button.addEventListener('click', function (event) {

        // mendapatkan objek elemen yang diklik
        const target = event.target;

        if (target.classList.contains('clear')) {
            clearCalculator();
            updateDisplay();
            return;
        }

        if (target.classList.contains('negative')) {
            inverseNumber();
            updateDisplay();
            return;
        }

        // if (target.classList.contains('equals')) {
        //     performCalculation();
        //     updateDisplay();
        //     return;
        // }

        // if (target.classList.contains('operator')) {
        //     handleOperator(target.innerText)
        //     return;
        // }

        if (target.classList.contains('backspace')) {
            backspace();
        }

        if (target.classList.contains('percentage')) {
            addPercentage();
            return;
        }

        if (target.classList.contains('equals')) {
            // Memproses dan mengirim ekspresi matematika ke server
            sendExpressionToServer(calculator.displayNumber);
            // updateDisplay();
            return;
        }

        inputDigit(target.innerText);
        updateDisplay()
    });
}
