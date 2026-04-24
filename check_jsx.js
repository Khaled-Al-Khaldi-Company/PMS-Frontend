
import fs from 'fs';
import path from 'path';

const files = [
    'frontend/src/app/dashboard/boq/page.tsx',
    'frontend/src/app/dashboard/contracts/page.tsx',
    'frontend/src/app/dashboard/invoices/page.tsx',
    'frontend/src/app/dashboard/purchases/page.tsx',
    'frontend/src/app/dashboard/projects/page.tsx',
    'frontend/src/app/dashboard/quotations/page.tsx'
];

files.forEach(file => {
    const filePath = path.join('d:/OneDrive/المستندات/projects/PMS 2', file);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${file}`);
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Very naive tag balancer
    const tags = ['div', 'motion.div', 'motion.tr', 'AnimatePresence', 'table', 'tbody', 'thead', 'tr', 'td', 'th', 'form', 'section'];
    tags.forEach(tag => {
        const opening = (content.match(new RegExp(`<${tag}(\\s|>|\\/)`, 'g')) || []).length;
        const selfClosing = (content.match(new RegExp(`<${tag}[^>]*\\/>`, 'g')) || []).length;
        const closing = (content.match(new RegExp(`</${tag}>`, 'g')) || []).length;
        
        if (opening - selfClosing !== closing) {
            console.log(`[${file}] Mismatch in <${tag}>: ${opening} opening (${selfClosing} self-closing) vs ${closing} closing`);
        }
    });
    
    // Braces
    const openBraces = (content.match(/{/g) || []).length;
    const closeBraces = (content.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
        console.log(`[${file}] Mismatch in braces {}: ${openBraces} vs ${closeBraces}`);
    }

    // Parens
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        console.log(`[${file}] Mismatch in parens (): ${openParens} vs ${closeParens}`);
    }
});
