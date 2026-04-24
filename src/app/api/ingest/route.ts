import { spawn } from 'child_process';

// We disable caching for streaming
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { query } = await request.json();

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query is required' }), { status: 400 });
  }

  const encoder = new TextEncoder();

  // Create a ReadableStream to stream the child process output
  const stream = new ReadableStream({
    start(controller) {
      // Run the CLI
      const child = spawn('npx', ['@genspark/cli', 'search', query, '--output', 'json'], {
        shell: true,
      });

      // Stream stdout
      child.stdout.on('data', (data) => {
        controller.enqueue(encoder.encode(data.toString()));
      });

      // Stream stderr (which contains Genspark CLI process info like [INFO])
      child.stderr.on('data', (data) => {
        // Prefix stderr with [LOG] so the client knows it's a progress update
        const lines = data.toString().split('\n').filter((l: string) => l.trim() !== '');
        lines.forEach((line: string) => {
          controller.enqueue(encoder.encode(`[LOG] ${line}\n`));
        });
      });

      child.on('error', (error) => {
        controller.enqueue(encoder.encode(`[ERROR] ${error.message}\n`));
        controller.close();
      });

      child.on('close', (code) => {
        controller.enqueue(encoder.encode(`\n[DONE] Process exited with code ${code}\n`));
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
