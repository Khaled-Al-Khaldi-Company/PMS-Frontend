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
      const original = content;

      content = content.replace(/"Bearer \$\{([^}]+)\}`/g, '`Bearer ${$1}`');

      if (content !== original) {
        console.log("Fixed Bearer in:", fullPath);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

walk(dir);
console.log("Bearer fix applied.");
