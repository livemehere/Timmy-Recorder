import { spawn } from "child_process";
import {
  build as viteBuild,
  createServer,
  defineConfig,
  mergeConfig,
} from "vite";
import { getBaseConfig, rendererConfig } from "./config.mjs";
import chalk from "chalk";

async function serveRenderer() {
  const config = mergeConfig(
    rendererConfig,
    defineConfig({
      server: {
        port: 3000,
      },
    }),
  );
  const server = await createServer(config);
  await server.listen();
  server.printUrls();
  return server;
}

async function buildPreload(server) {
  await viteBuild(
    mergeConfig(
      getBaseConfig("preload"),
      defineConfig({
        build: {
          watch: {},
        },
        plugins: [
          {
            name: "reload-renderer-on-preload-changes",
            writeBundle() {
              server.ws.send({ type: "full-reload" });
            },
          },
        ],
      }),
    ),
  );
}

async function buildMain() {
  let app;
  await viteBuild(
    mergeConfig(
      getBaseConfig("main"),
      defineConfig({
        build: {
          watch: {},
        },
        plugins: [
          {
            name: "rebuild-app-on-main-changes",
            writeBundle() {
              if (app) {
                app.removeListener("exit", process.exit);
                app.kill("SIGINT");
                app = undefined;
              }
              app = spawn("electron", ["."], { stdio: "inherit" });
              app.addListener("exit", process.exit);
            },
          },
        ],
      }),
    ),
  );
}

async function run() {
  const server = await serveRenderer();
  await buildPreload(server);
  await buildMain();
  console.log(chalk.bgGreen("Development server started"));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
