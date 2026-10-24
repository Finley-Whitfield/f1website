const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((request, response) => handle(request, response))
      .listen(port, hostname, () => {
        console.log(`Apex Racing Hub is running at http://${hostname}:${port}`);
      });
  })
  .catch((error) => {
    console.error("Failed to start Apex Racing Hub:", error);
    process.exit(1);
  });
