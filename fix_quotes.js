const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "src/app");

function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      if (content.includes("API_BASE_URL")) {
        // Fix syntax error where closing double quotes or single quotes were left behind instead of backticks
        // E.g., `${API_BASE_URL}/v1/projects"  -> `${API_BASE_URL}/v1/projects`
        const original = content;
        content = content.replace(/`\$\{API_BASE_URL\}([^"]*?)"/g, '`${API_BASE_URL}$1`');
        content = content.replace(/`\$\{API_BASE_URL\}([^']*?)'/g, '`${API_BASE_URL}$1`');
        
        if (content !== original) {
          console.log("Fixed quotes in:", fullPath);
          fs.writeFileSync(fullPath, content);
        }
      }
    }
  }
}

walk(dir);
console.log("Syntax fix done");
