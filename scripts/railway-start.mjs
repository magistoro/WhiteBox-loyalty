import { spawn } from "node:child_process";

const serviceName = process.env.RAILWAY_SERVICE_NAME ?? "";
const isApiService = serviceName.toLowerCase().includes("api");

const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";

function npmRun(args, env = process.env) {
  const command = npmCommand;
  const finalArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npm", ...args] : args;
  const child = spawn(command, finalArgs, {
    env,
    stdio: "inherit",
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
  child.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
}

if (isApiService) {
  const env = {
    ...process.env,
    API_PORT: process.env.PORT ?? process.env.API_PORT ?? "3001",
  };
  console.log(`Starting API service on port ${env.API_PORT}.`);
  npmRun(["run", "api:start"], env);
} else {
  console.log(serviceName ? `Starting web service "${serviceName}".` : "Starting local Next.js app.");
  npmRun(["run", "start:web"]);
}
