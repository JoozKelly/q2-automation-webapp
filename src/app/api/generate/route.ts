import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { data, sections } = await request.json();

    if (!data) {
      return NextResponse.json({ error: 'Economic data is required' }, { status: 400 });
    }

    // Construct a prompt for Claude CLI
    const prompt = `You are an expert economic analyst writing a quarterly report for Batam tenants.
Based on the following JSON data, synthesize a professional, markdown-formatted report storyline.
Include the following sections: ${sections.join(', ')}.

Data:
${JSON.stringify(data, null, 2)}

Do not include any introductory or concluding conversational text. Only return the markdown report.`;

    // To pass the prompt safely to the CLI, we can echo it into claude (since claude accepts stdin or can be invoked with arguments if short).
    // Actually, `claude "prompt"` is the syntax for the CLI. But for a large JSON payload, it's safer to write to a temp file and use `claude "$(cat temp.txt)"` or similar.
    // However, Node's child_process.exec allows large commands if escaped properly.
    // Let's use `claude -p "..."` wait, earlier we found out it doesn't have `-p`. It's `claude "prompt text"`.
    
    // We will use a safe base64 encoding to pass the prompt, or just write it to a temp file.
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    
    const tempFile = path.join(os.tmpdir(), `prompt-${Date.now()}.txt`);
    fs.writeFileSync(tempFile, prompt);

    // Assuming we are on Windows (Powershell/CMD), we can use Get-Content if PowerShell, or type. 
    // Wait, the exec environment is typically CMD on Windows.
    // Let's use Node's exec with `claude -p` -- no, claude accepts positional args: `claude [prompt...]`.
    // Actually, if we use Node's `execFile` or `spawn`, we can pass it as a direct argument.
    
    // Let's just use `claude` and pass the temp file content.
    // In CMD: `claude < temp.txt` wait, claude CLI might be an interactive TTY that breaks with stdin redirection.
    // We can just try `claude "Please read the prompt from ${tempFile}"`.
    
    const command = `claude "Read the prompt from the absolute file path: ${tempFile}. Follow its instructions exactly and print ONLY the resulting markdown report to the console. Do not format it inside a code block, just raw markdown."`;
    
    const { stdout, stderr } = await execAsync(command);
    
    // Clean up
    try { fs.unlinkSync(tempFile); } catch (e) {}

    return NextResponse.json({ result: stdout }, { status: 200 });

  } catch (error: any) {
    console.error('Error executing Claude CLI:', error);
    return NextResponse.json({ error: 'Failed to generate storyline via Claude CLI', details: error.message }, { status: 500 });
  }
}
