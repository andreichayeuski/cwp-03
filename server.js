const net = require('net');
const fs = require('fs');
const getArrayOfQA = require('./getArrayOfQA');
const port = 8124;
let questionAndAnswers = getArrayOfQA('qa.json');
const defaultDir = process.env.CWP_DIR_FOR_CLIENT;
const maxClients = process.env.CWP_MAX_CLIENTS;

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

let counterOfClients = 0;
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
    let isFiles = false;
	client.on('end', () => console.log('Client disconnected\r\n'));
	client.on('data', (data) => {
		// client.on('end', () => console.log('Client disconnected\r\n'));
        fs.appendFile(filename, data + "\r\n", (err) => {
	        if (err)
	        {
		        throw "Error found: " + err;
	        }
        });
        if (isConnected)
        {
	        if (isFiles)
	        {
	        	if (data === 'END')
		        {
			        // isFiles = false;
			        // isConnected = false;
			        client.end();
			        counterOfClients -= 1;
			        console.log("end");
		        }
		        else if (data === 'ERR')
		        {
			        console.log("err end");
			        client.end();
			        counterOfClients -= 1;
		        }
		        else
		        {
			        let filePath = defaultDir + "\\" + client.identifier + "\\" + JSON.parse(data)[1];
			        fs.appendFile(filePath, JSON.parse(data)[0] + "\r\n", (err) => {
				        if (err)
				        {
					        throw "Error found: " + err;
				        }
			        });
			        client.write("NEXT");
		        }
	        }
	        else
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

        }
        else
        {
	        let message = "";
            if (data === 'QA' || data === 'FILES')
            {
	            if (data === 'FILES') {
	            	isFiles = true;
	            	if (counterOfClients <= maxClients)
		            {
		            	counterOfClients += 1;
		            }
		            else
		            {
		            	client.end();
		            }
	            	fs.mkdir(defaultDir + "\\" + client.identifier, (err) =>
		            {
		            	console.log(err);
		            });
		        }
		        isConnected = true;
		        message = "ACK";
		        client.write(message);
	        }
	        else
	        {
	        	message = "DEC";
	        	console.log("disconnect.");
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
