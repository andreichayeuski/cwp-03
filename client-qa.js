const net = require('net');
const getArrayOfQA = require('./getArrayOfQA');
// const readLine = require('readline');

const port = 8124;

const client = new net.Socket();
let questionAndAnswers = getArrayOfQA('qa.json');

client.setEncoding('utf8');

// const rl = readLine.createInterface({
// input: process.stdin,
// output: process.stdout
// });

// rl.question('Input a command\r\n', (answer) => {
	client.connect(port, function (err) {
		if (err) {
			throw err;
		}
		console.log('Connected');
		client.write("QA");
	});

	let counter = 0;
	let isConnected = false;
	client.on('data', function (data) {
		console.log("Received from server: " + data);
		if (isConnected) {
			console.log(`Question: ${questionAndAnswers[counter - 1].question}\r\nAnswer: ${data}\r\nRight: ${questionAndAnswers[counter - 1].answer === data ? "yes" : "no"}\r\n`);
			if (counter === questionAndAnswers.length) {
				client.destroy();
				process.exit(0);
			}
			else {
				client.write(`Question: ${questionAndAnswers[counter++].question}`);
			}
		}
		else {
			if (data === "ACK") {
				isConnected = true;
				client.write(`Question: ${questionAndAnswers[counter++].question}`);
			}
			else {
				client.destroy();
				process.exit(0);
			}
		}

	});

	client.on('close', function () {
		console.log('Connection closed');
	});



// rl.close();
// });