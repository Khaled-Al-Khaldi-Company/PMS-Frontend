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
      if (content.includes("http://localhost:4000")) {
        console.log("Fixing:", fullPath);
        
        let newContent = content.replace(/"http:\/\/localhost:4000/g, '`${API_BASE_URL}');
        newContent = newContent.replace(/`http:\/\/localhost:4000/g, '`${API_BASE_URL}');
        
        // Ensure import exists
        if (!newContent.includes('API_BASE_URL')) {
          // Should add it wait, no, the replace added it. So it definitely includes it.
          // We need to add the import line if it's missing the actual import statement
        }
        if (!newContent.includes('from "@/lib/api"') && !newContent.includes('from \'@/lib/api\'')) {
          // Add import at the top after other imports
          newContent = newContent.replace(/(import .*?;?\n)/, '$1import { API_BASE_URL } from "@/lib/api";\n');
        }
        
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

walk(dir);
console.log("Done");
