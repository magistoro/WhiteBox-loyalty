import { spawn } from "node:child_process";

const serviceName = process.env.RAILWAY_SERVICE_NAME ?? "";
const isApiService = serviceName.toLowerCase().includes("api");

const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";

function npmRun(args) {
  const command = npmCommand;
  const finalArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...args] : args;
  return new Promise((resolve, reject) => {
    const child = spawn(command, finalArgs, {
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${finalArgs.join(" ")} exited with code ${code}`));
      }
    });
    child.on("error", reject);
  });
}

if (isApiService) {
  console.log(`Building API service for Railway service "${serviceName}".`);
  await npmRun(["run", "db:generate"]);
  await npmRun(["run", "api:build"]);
} else {
  console.log(serviceName ? `Building web service "${serviceName}".` : "Building local Next.js app.");
  await npmRun(["run", "build:web"]);
}
