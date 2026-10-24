const { createServer } = require("http");
const next = require("next");

const dev = process.env.NODE_ENV === "development";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || process.env.SERVER_PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((request, response) => {
      response.on("finish", () => {
        if (response.statusCode === 404) {
          console.warn(`404 ${request.method} ${request.url} (host: ${request.headers.host || "unknown"})`);
        }
      });
      handle(request, response);
    })
      .listen(port, hostname, () => {
        console.log(`Apex Racing Hub is listening on ${hostname}:${port} (${dev ? "development" : "production"})`);
        if (process.env.PUBLIC_URL) {
          console.log(`Public URL: ${process.env.PUBLIC_URL}`);
        }
      });
  })
  .catch((error) => {
    console.error("Failed to start Apex Racing Hub:", error);
    process.exit(1);
  });
