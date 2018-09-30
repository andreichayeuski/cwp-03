const net = require('net');
const fs = require('fs');
const path = require('path');
// const readLine = require('readline');

const port = 8124;

const client = new net.Socket();
let isEmptyDir = false;
client.setEncoding('utf-8');

function sendFiles(pathToDir)
{
	fs.readdir(pathToDir, function(err, listOfContents)
	{
		if (err)
		{
			console.log(err);
			console.log(pathToDir);
		}
		listOfContents.forEach(element =>
		{
			let filePath = pathToDir + "\\" + element;
			fs.stat(filePath, function(err, stats)
			{
				if (err)
				{
					console.log(err);
					console.log(pathToDir);
				}
				if (stats.isDirectory())
				{
					sendFiles(pathToDir + "\\" + element);
				}
				if (stats.isFile())
				{
					console.log("file " + filePath);
					let data = fs.readFileSync(filePath);
					let buf = data.toString('utf-8');
					var msg = [];
					msg.push(buf);
					msg.push(path.basename(filePath));
					client.write(JSON.stringify(msg));
					console.log("send");
				}
				if (listOfContents.indexOf(element) === listOfContents.length - 1)
				{
					console.log('counter');
					counter += 1;
					if (process.argv[counter] === undefined) {
						console.log("End of files.");
						client.destroy();
						// process.exit(0);
						// isConnected = false;
						// client.write('END');
					}
					else
					{
						sendFiles(process.argv[counter]);
					}
					isEmptyDir = true;
				}
				else
				{
					isEmptyDir = false;
				}
			});
		});
	})
}

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
	client.write("FILES");
});

let counter = 2;
let isConnected = false;

client.on('data', function (data) {
	console.log("Received from server: " + data);
	if (isConnected) {
		if (data === "NEXT"){
			if (process.argv[counter] === undefined) {
				console.log("End of files.");
				client.destroy();
				// process.exit(0);
				// isConnected = false;
				// client.write('END');
			}
			else
			{
				sendFiles(process.argv[counter]);
			}
		}
		else{
			console.log("err");
			// client.destroy();
		}
	}
	else {
		if (data === "ACK") {
			sendFiles(process.argv[counter]);
			isConnected = true;
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

client.on('destroy', function () {
	console.log('Connection destroyed');
});


// rl.close();
// });