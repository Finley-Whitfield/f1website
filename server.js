const { createServer } = require("http");
const { execFileSync, spawnSync } = require("child_process");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const path = require("path");

const dev = process.env.NODE_ENV === "development";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number.parseInt(process.env.PORT || process.env.SERVER_PORT || "3000", 10);
const buildIdPath = path.join(__dirname, ".next", "BUILD_ID");
const buildRevisionPath = path.join(__dirname, ".next", "APEX_BUILD_REVISION");
function getGitRevision() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: __dirname,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function ensureProductionBuild() {
  if (dev) return;

  const revision = getGitRevision();
  const builtRevision = existsSync(buildRevisionPath) ? readFileSync(buildRevisionPath, "utf8").trim() : null;
  const needsBuild = process.env.BUILD_ON_START === "1"
    || !existsSync(buildIdPath)
    || (revision !== null && revision !== builtRevision);

  if (!needsBuild) return;

  console.log("Creating production build before starting the server...");
  const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
    cwd: __dirname,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  if (revision !== null) writeFileSync(buildRevisionPath, `${revision}\n`);
}

try {
  ensureProductionBuild();
} catch (error) {
  console.error("Failed to build Apex Racing Hub:", error);
  process.exit(1);
}

const next = require("next");
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
