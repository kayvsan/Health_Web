import http from 'http';
import https from 'https';
import { URL } from 'url';

export const probeUrl = (urlString, timeoutMs = 10000) => {
  return new Promise((resolve) => {
    let timings = {
      startAt: process.hrtime.bigint(),
      dnsLookupAt: null,
      tcpConnectionAt: null,
      tlsHandshakeAt: null,
      firstByteAt: null,
      endAt: null,
    };

    let result = {
      status: 'down',
      responseTime: 0,
      dnsTime: null,
      tcpTime: null,
      tlsTime: null,
      ttfb: null,
      statusCode: null,
      errorMessage: null,
    };

    let url;
    try {
      url = new URL(urlString);
    } catch (e) {
      result.errorMessage = 'Invalid URL';
      return resolve(result);
    }

    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      method: 'GET',
      timeout: timeoutMs,
      headers: {
        'User-Agent': 'HealthMonitor-Probe/1.0',
      },
    };

    const req = client.request(url, options, (res) => {
      timings.firstByteAt = process.hrtime.bigint();
      result.statusCode = res.statusCode;

      res.on('data', () => {
        // Consume data to ensure 'end' is emitted
      });

      res.on('end', () => {
        timings.endAt = process.hrtime.bigint();
        calculateTimings(timings, result);
        result.status = (res.statusCode >= 200 && res.statusCode < 400) ? 'up' : 'down';
        if (result.status === 'down') {
          result.errorMessage = `HTTP Status: ${res.statusCode}`;
        }
        resolve(result);
      });
    });

    req.on('socket', (socket) => {
      socket.on('lookup', () => {
        timings.dnsLookupAt = process.hrtime.bigint();
      });
      socket.on('connect', () => {
        timings.tcpConnectionAt = process.hrtime.bigint();
      });
      socket.on('secureConnect', () => {
        timings.tlsHandshakeAt = process.hrtime.bigint();
      });
    });

    req.on('timeout', () => {
      req.destroy();
      result.errorMessage = `Timeout after ${timeoutMs}ms`;
      result.status = 'down';
      resolve(result);
    });

    req.on('error', (err) => {
      timings.endAt = process.hrtime.bigint();
      calculateTimings(timings, result);
      result.errorMessage = err.message;
      result.status = 'down';
      resolve(result);
    });

    req.end();
  });
};

const calculateTimings = (timings, result) => {
  const toMs = (bigIntStart, bigIntEnd) => {
    if (!bigIntStart || !bigIntEnd) return null;
    return Number((bigIntEnd - bigIntStart) / 1000000n);
  };

  result.dnsTime = toMs(timings.startAt, timings.dnsLookupAt);
  
  const tcpStart = timings.dnsLookupAt || timings.startAt;
  result.tcpTime = toMs(tcpStart, timings.tcpConnectionAt);
  
  if (timings.tlsHandshakeAt) {
    result.tlsTime = toMs(timings.tcpConnectionAt, timings.tlsHandshakeAt);
  }

  const reqEnd = timings.tlsHandshakeAt || timings.tcpConnectionAt || tcpStart;
  result.ttfb = toMs(reqEnd, timings.firstByteAt);

  result.responseTime = toMs(timings.startAt, timings.endAt) || 0;
};

export const determineStatus = (probeResult, degradedThresholdMs = 500) => {
  if (probeResult.status === 'down') return 'down';
  
  if (probeResult.responseTime >= degradedThresholdMs) {
    return 'degraded';
  }
  
  return 'up';
};
