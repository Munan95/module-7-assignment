require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

function sendFile(res, file, type) {
    fs.readFile(path.join(__dirname, file), (err, data) => {
        if (err) {
            res.writeHead(404);
            return res.end("File Not Found");
        }
        res.writeHead(200, {"Content-Type": type});
        res.end(data);
    });
}

async function askGroq(prompt) {

    const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        }
    );
    const data = await response.json();
    return data.choices[0].message.content;
}

const server = http.createServer((req, res) => {

    if (req.method === "GET") {
        if (req.url === "/") {
            return sendFile(res, "random.html", "text/html");
        }
        if (req.url === "/style.css") {
            return sendFile(res, "style.css", "text/css");
        }
        if (req.url === "/script.js") {
            return sendFile(res, "script.js", "application/javascript");
        }
    }

    if (req.method === "POST" && req.url === "/ai") {

        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });
        
        req.on("end", async () => {

            try {
                const { prompt } = JSON.parse(body);
                const reply = await askGroq(prompt);
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify({reply}));
            } catch (err) {
                console.log(err);
                res.writeHead(500, {"Content-Type": "application/json"});
                res.end(JSON.stringify({reply: "Something went wrong."}));
            }

        });

        return;
    }

    res.writeHead(404);
    res.end();

});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});