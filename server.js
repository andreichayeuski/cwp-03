const net = require('net');
const fs = require('fs');
const getArrayOfQA = require('./getArrayOfQA');
const port = 8124;
let questionAndAnswers = getArrayOfQA('qa.json');

if (!fs.existsSync("log"))
{
	fs.mkdir("log", (err) =>
	{
		if (err)
		{
			throw "Error founded: " + err;
		}
	});
}

const server = net.createServer((client) => {
    let seed = 0;
    console.log('Client connected');
	client.identifier = Date.now() + seed++; // unique id
	let filename = `log/client_${client.identifier}.log`;
	fs.writeFile(filename, "", (err) => {
		if (err)
		{
			throw "Error found: " + err;
		}
	});

    client.setEncoding('utf8');
    let isConnected = false;
	client.on('end', () => console.log('Client disconnected\r\n'));
	client.on('data', (data) => {
        console.log("Received from client: " + data);
        fs.appendFile(filename, data + "\r\n", (err) => {
	        if (err)
	        {
		        throw "Error found: " + err;
	        }
        });
        if (isConnected)
        {
	        let max = questionAndAnswers.length;

	        let rand = max * Math.random();
	        rand = Math.floor(rand);

	        console.log(data + " " + questionAndAnswers[rand].answer + "\r\n");
	        let message = '' + questionAndAnswers[rand].answer;
	        client.write(message);
	        fs.appendFile(filename, message + "\r\n", (err) => {
		        if (err)
		        {
			        throw "Error found: " + err;
		        }
	        });
        }
        else
        {
	        let message = "";
            if (data === 'QA' || data === 'FILES')
	        {
	        	isConnected = true;
	        	message = "ACK";
	        	client.write(message);
	        }
	        else
	        {
	        	message = "DEC";
		        client.write(message);
		        client.end();
	        }
	        fs.appendFile(filename, message + "\r\n",  (err) => {
		        if (err)
		        {
			        throw "Error found: " + err;
		        }
	        });
        }
    });


});

server.listen(port, () => {
    console.log(`Server listening on localhost:${port}`);
});
