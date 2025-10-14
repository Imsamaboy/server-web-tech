const http = require("http");

const host = "0.0.0.0";
const port = process.env.PORT || 8000;

const requestListener = function (req, res) {
    switch (req.url) {
        case "/login": {
            res.writeHead(200)
            res.end("sfelshtyn")
            break
        }
        case "/hour": {
            const d = new Date();
            const time = d.toLocaleTimeString("ru-RU", { timeZone: "Europe/Moscow", hour: "2-digit", minute: "2-digit", second: "2-digit" });
            res.writeHead(200);
            res.end(time);
            break;
        }
    }
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
})
