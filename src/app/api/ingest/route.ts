import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Since the user is logged into Genspark CLI, the `gsk search` command should work.
    // We use `--output json` to easily parse the response.
    const { stdout, stderr } = await execAsync(`npx @genspark/cli search "${query}" --output json`);

    // The output might have some non-JSON CLI logs at the beginning. 
    // We try to extract the JSON part.
    let parsedData = null;
    try {
      // Find the first occurrence of '{' or '['
      const jsonStartIndex = stdout.indexOf('{');
      if (jsonStartIndex !== -1) {
        const jsonString = stdout.substring(jsonStartIndex);
        parsedData = JSON.parse(jsonString);
      } else {
        parsedData = JSON.parse(stdout);
      }
    } catch (parseError) {
      console.warn("Failed to parse JSON from stdout. Using raw output.", parseError);
      return NextResponse.json({ data: stdout, stderr }, { status: 200 });
    }

    return NextResponse.json({ data: parsedData }, { status: 200 });

  } catch (error: any) {
    console.error('Error executing Genspark CLI:', error);
    
    // Check if it's an API Key or Auth error from CLI
    if (error.stderr && error.stderr.includes('API key is required')) {
       return NextResponse.json({ error: 'API key is required. Please login via CLI or set GSK_API_KEY.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed to run data ingestion via Genspark CLI', details: error.message }, { status: 500 });
  }
}
