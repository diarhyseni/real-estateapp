const fs = require('fs');
const path = require('path');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update import statement
  if (content.includes('import { NextResponse }')) {
    content = content.replace(
      'import { NextResponse }',
      'import { NextRequest, NextResponse }'
    );
  } else if (!content.includes('import { NextRequest')) {
    content = content.replace(
      'import {',
      'import { NextRequest, '
    );
  }
  
  // Update request parameter type
  content = content.replace(
    /request: Request/g,
    'request: NextRequest'
  );
  content = content.replace(
    /req: Request/g,
    'req: NextRequest'
  );
  content = content.replace(
    /_req: Request/g,
    '_req: NextRequest'
  );
  
  fs.writeFileSync(filePath, content);
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') && filePath.includes('/api/')) {
      updateFile(filePath);
    }
  }
}

processDirectory('app'); 