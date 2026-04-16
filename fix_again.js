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

      // Fix `string' -> 'string'
      content = content.replace(/`([^\{\}`\n]*?)'/g, "'$1'");
      
      // Fix `string" -> "string"
      content = content.replace(/`([^\{\}`\n]*?)"/g, '"$1"');

      // The `\n' case
      content = content.replace(/`\\n'/g, "'\\n'");

      // Fix alert where backtick is matched with double quote at the end
      content = content.replace(/alert\(`([^`]*?)"\);/g, 'alert("$1");');

      // Fix `object' in alert explicitly
      content = content.replace(/`object'/g, "'object'");


      if (content !== original) {
        console.log("Fixed quotes again in:", fullPath);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

walk(dir);
console.log("Fix quotes again applied.");
