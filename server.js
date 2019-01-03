const crypto = require('crypto');
const fs = require("fs");
const path = require("path");
const http = require("http");
const url = require("url");

// Configurables
const SERVER_PORT = 9000;
const INDEX_FILE = "index.html";
const TXT_DIR = path.join(__dirname,  "tmp");
const WORD_COUNT_PY_SCRIPT = path.join(__dirname,  "wordCount.py");
const DELETE_TEMP_FILES = true;
const CONTENT_TYPES = {
    html: { "Content-Type": "text/html"              },
    text: { "Content-Type": "plain/text"             },
    css : { "Content-Type": "text/css"               },
    js  : { "Content-Type": "application/javascript" },
};

// Before launching the server, create the folder to store the uploaded .txt files in
if (!fs.existsSync(TXT_DIR)){
    fs.mkdirSync(TXT_DIR);
}

// Create the HTTP server and start it
http.createServer((req, res) => {

    // Response sending boilerplate function
    const sendResponse = (status, contentType, data) => {
        try{
            res.writeHead(status, contentType);
            res.write(data);
            res.end();
        }
        catch(e) {
            console.log(e);
            sendResponse(500, CONTENT_TYPES.text, "Something went wrong!");
        }
    };

    // Send a file back to the client
    const returnFile = (fileArg, contentType) => {
        fs.readFile(path.join(__dirname, fileArg), (err, data) => {
            sendResponse(200, contentType, data);
        });
    };

    // Clean up for after response is sent
    const cleanup = (tmpFile) => {
        if (DELETE_TEMP_FILES) {
            fs.unlink(tmpFile, (err) => {
                if (err) console.log(err);
            });
        }
    };

    // URL suffix (used for path matching)
    const purl = url.parse(req.url,true);

    // Regexes for detecting requests for various file types
    const fileTypeRegex = /^\/([A-Za-z0-9]*\.(css|js))$/;

    try {
        /* File serving routes */
        if(purl.pathname === "/") {
            returnFile(INDEX_FILE, CONTENT_TYPES.html);
        }
        else if (otherFile = purl.pathname.match(fileTypeRegex)) {
            // Get file extension of requested file
            const fileExt = otherFile[1].split(".").pop();
            returnFile(path.join(fileExt, otherFile[1]), CONTENT_TYPES[fileExt]);
        }
        /* Logic route */
        else if(purl.pathname === "/upload") {
            let body = '';
            req.on('data', (data) => {
                body += data;
            });
            req.on('end', () => {
                // Create unique name based on file content and time uploaded
                const bodyHash = crypto.createHash('md5').update(body+((new Date).getTime())).digest('hex');
                // Path to temp file
                const tmpFile = `${TXT_DIR}/${bodyHash}.txt`;

                // Write the text file into the TXT_DIR
                fs.writeFile(tmpFile, body, (err) => {
                    if(err) {
                        sendResponse(500, CONTENT_TYPES.text, "Error writing the .txt file to the server");
                    }
                    else {
                        // Pass file path to word count Python script
                        const spawn = require("child_process").spawn;
                        const pythonProcess = spawn('python3',[WORD_COUNT_PY_SCRIPT, tmpFile]);
                        
                        // Create event handlers for picking up stdout/stderr of Python script
                        pythonProcess.stdout.on('data', (data) => {
                            sendResponse(200, CONTENT_TYPES.text, data);
                            cleanup(tmpFile);
                        });
                        pythonProcess.stderr.on('data', (data) => {
                            sendResponse(500, CONTENT_TYPES.text, data);
                            cleanup(tmpFile);
                        });
                    }
                });
            });
        }
        /* Catch-all route */
        else {
            sendResponse(404, CONTENT_TYPES.text, "Whatever you're requesting, it ain't here");
        }
    }
    catch(e) {
        console.log(e);
        sendResponse(500, CONTENT_TYPES.text, "Something went wrong!");
    }

}).listen(SERVER_PORT, () => { console.log(`Server running at localhost:${SERVER_PORT}...`); });