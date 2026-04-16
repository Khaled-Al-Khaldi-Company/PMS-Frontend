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

      // Fix specific known mismatched quotes based on what previous scripts corrupted
      content = content.replace(/`token"/g, '"token"');
      content = content.replace(/`token'/g, "'token'");
      content = content.replace(/alert\(`(.*?)("\);?)/g, 'alert("$1$2'); // alert(`hello"); -> alert("hello");
      content = content.replace(/alert\(`(.*?)('\);?)/g, 'alert(\'$1$2'); 
      content = content.replace(/\(`\n'\)/g, "('\\n')"); // split(`\n')
      content = content.replace(/`", /g, '"", '); // itemCode: `",
      content = content.replace(/`"\);/g, '"");'); // setImportText(`");
      content = content.replace(/`SUBCONTRACT'/g, "'SUBCONTRACT'");
      content = content.replace(/`SELF'/g, "'SELF'");
      content = content.replace(/`suppliers'/g, "'suppliers'");
      content = content.replace(/`clients'/g, "'clients'");
      content = content.replace(/`projects'/g, "'projects'");

      // A general fixer: find backtick starting a string but closing with double/single quote in localstorage/alert/etc
      content = content.replace(/getItem\(`(.*?)(")/g, 'getItem("$1")');
      content = content.replace(/setItem\(`(.*?)(")/g, 'setItem("$1")');
      
      // Fix alert where backtick is matched with double quote at the end
      content = content.replace(/alert\(\s*`(.*)[^\\]"\s*\)/g, match => {
          return match.replace(/`/, '"');
      });

      // Just simple generic matches for specific variable names or typical strings that got corrupted
      const badStrings = [
        ["`Authorization\"", "\"Authorization\""],
        ["`Bearer ", '"Bearer '], // wait, `Bearer ${token}` is valid template literal!
        ["`admin'", "'admin'"],
        ["`user'", "'user'"],
      ];
      
      for (const [bad, good] of badStrings) {
        content = content.split(bad).join(good);
      }

      if (content !== original) {
        console.log("Fixed quotes in:", fullPath);
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

walk(dir);
console.log("Syntax fix applied to all files.");
