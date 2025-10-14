const http = require("http");

const host = "localhost";
const port = 8000;

const requestListener = function (req, res) {
    switch (req.url) {
        case "/login": {
            res.writeHead(200)
            res.end("sfelshtyn")
            break
        }
        case "/hour": {
            const d = new Date()
            let time = d.getHours()
            res.writeHead(200)
            res.end(`${time}`)
            break
        }
    }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
})
