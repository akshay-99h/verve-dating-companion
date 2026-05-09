#!/usr/bin/env node

const { spawn } = require('node:child_process');
const process = require('node:process');

const expoCli = require.resolve('expo/bin/cli');
const userArgs = process.argv.slice(2);
const recentNgrokLogs = [];

function addRecentNgrokLog(source, line) {
  const text = String(line).trim();
  if (!text) {
    return;
  }
  recentNgrokLogs.push(`[${source}] ${text}`);
  if (recentNgrokLogs.length > 25) {
    recentNgrokLogs.shift();
  }
}

function extractTunnelUrl(source, line) {
  addRecentNgrokLog(source, line);

  try {
    const parsed = JSON.parse(line);
    for (const candidate of [
      parsed.url,
      parsed.public_url,
      parsed.msg,
      parsed.err,
      parsed.addr,
      parsed.details && parsed.details.url,
      parsed.details && parsed.details.public_url,
    ]) {
      if (typeof candidate !== 'string') {
        continue;
      }
      const match = candidate.match(/https:\/\/[^\s"]+/);
      if (match) {
        return match[0];
      }
    }
  } catch {
    // Ignore non-JSON lines and fall back to a plain URL match.
  }

  const match = String(line).match(/https:\/\/[^\s"]+/);
  return match ? match[0] : null;
}

function normalizeExpoArgs(args) {
  const expoArgs = ['start'];
  let port = '8081';
  let hasPortArg = false;
  let hasHostArg = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--tunnel') {
      continue;
    }

    if (arg === '--host') {
      const value = args[index + 1];
      if (value === undefined) {
        throw new Error('Missing value for --host');
      }
      index += 1;
      if (value === 'tunnel') {
        continue;
      }
      hasHostArg = true;
      expoArgs.push('--host', value);
      continue;
    }

    if (arg === '--localhost' || arg === '--lan') {
      hasHostArg = true;
      expoArgs.push(arg);
      continue;
    }

    if (arg === '--port' || arg === '-p') {
      const value = args[index + 1];
      if (value === undefined) {
        throw new Error(`Missing value for ${arg}`);
      }
      index += 1;
      hasPortArg = true;
      port = value;
      expoArgs.push(arg, value);
      continue;
    }

    expoArgs.push(arg);
  }

  if (!hasHostArg) {
    expoArgs.push('--localhost');
  }

  if (!hasPortArg) {
    expoArgs.push('--port', port);
  }

  return { expoArgs, port };
}

function pipeForTunnelUrl(stream, source, onUrl) {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += chunk.toString();

    while (buffer.includes('\n')) {
      const newlineIndex = buffer.indexOf('\n');
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (!line) {
        continue;
      }

      const url = extractTunnelUrl(source, line);
      if (url) {
        onUrl(url);
      }
    }
  });

  stream.on('end', () => {
    const line = buffer.trim();
    if (!line) {
      return;
    }
    const url = extractTunnelUrl(source, line);
    if (url) {
      onUrl(url);
    }
  });
}

function waitForTunnelUrl(ngrokProcess, timeoutMs) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let apiPollInFlight = false;

    const finish = (callback) => (value) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      clearInterval(apiPollId);
      ngrokProcess.stdout.removeAllListeners('data');
      ngrokProcess.stdout.removeAllListeners('end');
      ngrokProcess.stderr.removeAllListeners('data');
      ngrokProcess.stderr.removeAllListeners('end');
      ngrokProcess.removeListener('error', handleError);
      ngrokProcess.removeListener('exit', handleExit);
      callback(value);
    };

    const resolveOnce = finish(resolve);
    const rejectOnce = finish(reject);

    const handleError = (error) => {
      rejectOnce(error);
    };

    const handleExit = (code, signal) => {
      const suffix = recentNgrokLogs.length
        ? `\n\nRecent ngrok logs:\n${recentNgrokLogs.join('\n')}`
        : '';
      rejectOnce(
        new Error(
          `ngrok exited before publishing a tunnel URL (code=${code}, signal=${signal ?? 'none'}).${suffix}`
        )
      );
    };

    const timeoutId = setTimeout(() => {
      const suffix = recentNgrokLogs.length
        ? `\n\nRecent ngrok logs:\n${recentNgrokLogs.join('\n')}`
        : '';
      rejectOnce(new Error(`Timed out waiting for ngrok to publish a tunnel URL.${suffix}`));
    }, timeoutMs);

    if (typeof timeoutId.unref === 'function') {
      timeoutId.unref();
    }

    const apiPollId = setInterval(async () => {
      if (settled || apiPollInFlight) {
        return;
      }
      apiPollInFlight = true;
      try {
        const response = await fetch('http://127.0.0.1:4040/api/tunnels');
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        const publicUrl = Array.isArray(data.tunnels)
          ? data.tunnels.find(
              (tunnel) =>
                typeof tunnel.public_url === 'string' && tunnel.public_url.startsWith('https://')
            )?.public_url
          : null;
        if (publicUrl) {
          resolveOnce(publicUrl);
        }
      } catch {
        // The local ngrok API is not ready yet or is unavailable.
      } finally {
        apiPollInFlight = false;
      }
    }, 500);

    if (typeof apiPollId.unref === 'function') {
      apiPollId.unref();
    }

    ngrokProcess.once('error', handleError);
    ngrokProcess.once('exit', handleExit);

    pipeForTunnelUrl(ngrokProcess.stdout, 'stdout', resolveOnce);
    pipeForTunnelUrl(ngrokProcess.stderr, 'stderr', resolveOnce);
  });
}

function waitForExit(childProcess) {
  return new Promise((resolve) => {
    if (!childProcess || childProcess.exitCode !== null || childProcess.signalCode !== null) {
      resolve();
      return;
    }
    childProcess.once('exit', () => resolve());
  });
}

async function stopProcess(childProcess, signal = 'SIGTERM') {
  if (!childProcess || childProcess.exitCode !== null || childProcess.signalCode !== null) {
    return;
  }
  childProcess.kill(signal);
  await waitForExit(childProcess);
}

async function main() {
  const { expoArgs, port } = normalizeExpoArgs(userArgs);
  const ngrokBinary = process.env.NGROK_BIN || 'ngrok';

  console.log(`Starting ngrok for Expo on local port ${port}...`);

  const ngrokProcess = spawn(
    ngrokBinary,
    ['http', port, '--log=stdout', '--log-format=json'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    }
  );

  let expoProcess = null;
  let shuttingDown = false;

  async function shutdown(exitCode = 0) {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    await stopProcess(expoProcess);
    await stopProcess(ngrokProcess);
    process.exit(exitCode);
  }

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(signal, () => {
      shutdown(0).catch((error) => {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      });
    });
  }

  const publicUrl = await waitForTunnelUrl(ngrokProcess, 30_000);
  console.log(`Using ngrok URL ${publicUrl}`);

  expoProcess = spawn(process.execPath, [expoCli, ...expoArgs], {
    stdio: 'inherit',
    env: {
      ...process.env,
      EXPO_PACKAGER_PROXY_URL: publicUrl,
    },
    windowsHide: true,
  });

  expoProcess.once('exit', (code, signal) => {
    const exitCode = code ?? (signal ? 1 : 0);
    shutdown(exitCode).catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(exitCode || 1);
    });
  });

  ngrokProcess.once('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }
    console.error(
      `ngrok stopped unexpectedly (code=${code}, signal=${signal ?? 'none'}). ` +
        'Stopping Expo because the public tunnel is no longer available.'
    );
    shutdown(1).catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    });
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
