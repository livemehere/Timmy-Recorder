import { build as viteBuild } from "vite";
import { getBaseConfig, rendererConfig } from "./config.mjs";
import builder, { Arch } from "electron-builder";
const Platform = builder.Platform;

const BUILD_TARGET = process.env.BUILD_TARGET;
const onlyBuildFile = process.env.NO_PACK === '1';
async function buildRenderer() {
  await viteBuild(rendererConfig);
}

async function buildPreload() {
  await viteBuild(getBaseConfig("preload"));
}

async function buildMain() {
  await viteBuild(getBaseConfig("main"));
}

async function buildApp() {
  if (BUILD_TARGET === "mac-arm64") {
    await builder.build({
      targets: Platform.MAC.createTarget(["dmg"], Arch.arm64),
    });
    return;
  }
  if (BUILD_TARGET === "mac-x64") {
    await builder.build({
      targets: Platform.MAC.createTarget(["dmg"], Arch.x64),
    });
    return;
  }

  if (BUILD_TARGET === "win-x64") {
    await builder.build({
      targets: Platform.WINDOWS.createTarget(["nsis"], Arch.x64),
    });
    return;
  }
  console.log("Only Build Code, not packaging", BUILD_TARGET);
}

async function run() {
  await buildRenderer();
  await buildPreload();
  await buildMain();
  if(!onlyBuildFile){
    await buildApp();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
