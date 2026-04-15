// src/utils/logger.js
// Logger estruturado em JSON para produção, legível para desenvolvimento

const isProd = process.env.NODE_ENV === "production";

function log(level, message, meta = {}) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (isProd) {
    // JSON puro para fácil indexação no Render Logs / Datadog / etc
    process.stdout.write(JSON.stringify(entry) + "\n");
  } else {
    const icons = { info: "ℹ️", warn: "⚠️", error: "❌", debug: "🔍" };
    const icon = icons[level] || "📝";
    const metaStr =
      Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    console.log(`${icon}  [${level.toUpperCase()}] ${message}${metaStr}`);
  }
}

const logger = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
  debug: (message, meta) => log("debug", message, meta),
};

export default logger;
