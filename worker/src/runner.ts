import { chromium, Page, BrowserContext } from 'playwright';
import fs from 'fs';
import path from 'path';
import { RESULTS_DIR } from './config';

type Step = {
  action: 'fill' | 'click' | 'wait' | 'screenshot' | 'pause';
  selector?: string;
  value?: string;
  timeout?: number;
};

type ProxyConfig = {
  server?: string;
  username?: string;
  password?: string;
  bypass?: string;
};

type DeviceConfig = {
  userAgent?: string;
  viewport?: { width: number; height: number };
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  locale?: string;
  timezoneId?: string;
  geolocation?: { latitude: number; longitude: number };
  permissions?: string[];
};

type MultiBotConfig = {
  enabled: boolean;
  count: number;
  proxies?: string[];
  devices?: DeviceConfig[];
  delayBetweenBots?: number; // milliseconds
  randomizeOrder?: boolean;
};

// Lightweight logger for multi-bot scope (single-bot defines its own scoped logger)
function log(message: string) {
  // eslint-disable-next-line no-console
  console.log(`[runner] ${message}`);
}

type VisualModeConfig = {
  enabled: boolean;
  headless: boolean;
  slowMo?: number; // milliseconds between actions
  showDevTools?: boolean;
  allowManualIntervention?: boolean;
  pauseOnError?: boolean;
};

type JobConfig = {
  proxy?: ProxyConfig;
  device?: DeviceConfig;
  fingerprintMasking?: boolean;
  multiBot?: MultiBotConfig;
  visualMode?: VisualModeConfig;
};

// Predefined device configurations
const DEVICE_PRESETS = {
  'desktop-chrome': {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  'mobile-iphone': {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  'mobile-android': {
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 2.75,
    isMobile: true,
    hasTouch: true,
  },
  'tablet-ipad': {
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 768, height: 1024 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
};

// Random user agents for fingerprint masking
const RANDOM_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

function getRandomUserAgent(): string {
  return RANDOM_USER_AGENTS[Math.floor(Math.random() * RANDOM_USER_AGENTS.length)];
}

function getRandomViewport(): { width: number; height: number } {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1536, height: 864 },
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
  ];
  return viewports[Math.floor(Math.random() * viewports.length)];
}

// Multi-bot execution function
async function runMultiBotJob(job: { id: string; url: string; steps: Step[]; runId: string; config?: JobConfig }) {
  const multiBot = job.config?.multiBot;
  if (!multiBot?.enabled) {
    return await runSingleBot(job);
  }

  const results = [];
  const proxies = multiBot.proxies || [];
  const devices = multiBot.devices || [];
  const count = multiBot.count || 1;

  log(`Starting multi-bot execution with ${count} bots`);

  for (let i = 0; i < count; i++) {
    const botConfig = { ...job.config };
    
    // Assign proxy if available
    if (proxies.length > 0) {
      const proxyIndex = multiBot.randomizeOrder ? Math.floor(Math.random() * proxies.length) : i % proxies.length;
      botConfig.proxy = { server: proxies[proxyIndex] };
    }

    // Assign device if available
    if (devices.length > 0) {
      const deviceIndex = multiBot.randomizeOrder ? Math.floor(Math.random() * devices.length) : i % devices.length;
      botConfig.device = devices[deviceIndex];
    }

    const botJob = {
      ...job,
      config: botConfig,
      runId: `${job.runId}-bot-${i + 1}`
    };

    log(`Starting bot ${i + 1}/${count}`);
    const result = await runSingleBot(botJob);
    results.push({ botIndex: i + 1, result });

    // Delay between bots if specified
    if (multiBot.delayBetweenBots && i < count - 1) {
      log(`Waiting ${multiBot.delayBetweenBots}ms before next bot`);
      await new Promise(resolve => setTimeout(resolve, multiBot.delayBetweenBots));
    }
  }

  return {
    ok: results.every(r => r.result.ok),
    logs: results.map(r => `Bot ${r.botIndex}: ${r.result.logs}`).join('\n'),
    results
  };
}

// Single bot execution function
async function runSingleBot(job: { id: string; url: string; steps: Step[]; runId: string; config?: JobConfig }) {
  const visualMode = job.config?.visualMode;
  const isHeadless = visualMode?.enabled ? !visualMode.headless : true;
  
  const browser = await chromium.launch({ 
    headless: isHeadless,
    slowMo: visualMode?.slowMo || 0,
    devtools: visualMode?.showDevTools || false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      ...(isHeadless ? ['--disable-gpu'] : []),
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
    ]
  });

  // Configure proxy if provided
  const contextOptions: any = {};
  if (job.config?.proxy?.server) {
    contextOptions.proxy = {
      server: job.config.proxy.server,
      username: job.config.proxy.username,
      password: job.config.proxy.password,
      bypass: job.config.proxy.bypass,
    };
  }

  // Configure device settings
  const device = job.config?.device;
  if (device) {
    if (device.userAgent) {
      contextOptions.userAgent = device.userAgent;
    }
    if (device.viewport) {
      contextOptions.viewport = device.viewport;
    }
    if (device.deviceScaleFactor) {
      contextOptions.deviceScaleFactor = device.deviceScaleFactor;
    }
    if (device.isMobile !== undefined) {
      contextOptions.isMobile = device.isMobile;
    }
    if (device.hasTouch !== undefined) {
      contextOptions.hasTouch = device.hasTouch;
    }
    if (device.locale) {
      contextOptions.locale = device.locale;
    }
    if (device.timezoneId) {
      contextOptions.timezoneId = device.timezoneId;
    }
    if (device.geolocation) {
      contextOptions.geolocation = device.geolocation;
    }
    if (device.permissions) {
      contextOptions.permissions = device.permissions;
    }
  }

  // Apply fingerprint masking if enabled
  if (job.config?.fingerprintMasking) {
    contextOptions.userAgent = getRandomUserAgent();
    contextOptions.viewport = getRandomViewport();
    contextOptions.deviceScaleFactor = Math.random() * 2 + 1; // 1-3
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const logs: string[] = [];

  function log(line: string) {
    const ts = new Date().toISOString();
    const entry = `[${ts}] ${line}`;
    logs.push(entry);
    console.log(entry); // Also log to console for visual mode
  }

  // Visual mode setup
  if (visualMode?.enabled && !isHeadless) {
    log('Visual mode enabled - browser window will be visible');
    
    if (visualMode.allowManualIntervention) {
      log('Manual intervention enabled - you can interact with the browser');
      
      // Add a pause before starting automation
      await page.evaluate(() => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.8); color: white; z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          font-family: Arial, sans-serif; font-size: 18px;
        `;
        overlay.innerHTML = `
          <div style="text-align: center;">
            <h2>🤖 Bot Ready for Manual Control</h2>
            <p>You can now interact with the page manually</p>
            <p>Press any key to continue with automation</p>
          </div>
        `;
        document.body.appendChild(overlay);
      });

      // Wait for user interaction
      await page.waitForFunction(() => {
        const overlay = document.querySelector('div[style*="position: fixed"]');
        // Cast to any/HTMLElement to avoid Element.style type error in Node build context
        return !overlay || (overlay as any).style?.display === 'none';
      }, { timeout: 0 }); // No timeout - wait indefinitely
    }
  }

  try {
    // Apply additional fingerprint masking techniques
    if (job.config?.fingerprintMasking) {
      // Randomize screen resolution
      await page.evaluate(() => {
        Object.defineProperty(screen, 'width', { value: Math.floor(Math.random() * 1000) + 1000 });
        Object.defineProperty(screen, 'height', { value: Math.floor(Math.random() * 500) + 500 });
      });

      // Randomize timezone
      await page.evaluate(() => {
        const timezones = ['America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];
        const randomTz = timezones[Math.floor(Math.random() * timezones.length)];
        Object.defineProperty(Intl, 'DateTimeFormat', {
          value: function(...args: any[]) {
            if (args[0] === undefined) args[0] = randomTz;
            return new (Intl.DateTimeFormat as any)(...args);
          }
        });
      });

      // Randomize language
      await page.evaluate(() => {
        const languages = ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'];
        const randomLang = languages[Math.floor(Math.random() * languages.length)];
        Object.defineProperty(navigator, 'language', { value: randomLang });
        Object.defineProperty(navigator, 'languages', { value: [randomLang] });
      });
    }

    await page.goto(job.url, { waitUntil: 'load', timeout: 30000 });
    log(`Navigated to ${job.url}`);
    
    // Log device/proxy info
    if (job.config?.proxy?.server) {
      log(`Using proxy: ${job.config.proxy.server}`);
    }
    if (job.config?.device?.userAgent) {
      log(`Using user agent: ${job.config.device.userAgent}`);
    }
    if (job.config?.fingerprintMasking) {
      log(`Fingerprint masking enabled`);
    }

    for (const [idx, step] of job.steps.entries()) {
      const label = `${idx + 1}/${job.steps.length} ${step.action}`;
      
      // Visual mode: highlight current step
      if (visualMode?.enabled && !isHeadless) {
        await page.evaluate(({ selector, action }) => {
          // Remove previous highlights
          document.querySelectorAll('.bot-highlight').forEach(el => el.remove());
          
          if (selector) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const highlight = document.createElement('div');
              highlight.className = 'bot-highlight';
              highlight.style.cssText = `
                position: absolute; border: 3px solid #ff6b6b; background: rgba(255,107,107,0.2);
                pointer-events: none; z-index: 9998; border-radius: 4px;
              `;
              const rect = el.getBoundingClientRect();
              highlight.style.left = rect.left + 'px';
              highlight.style.top = rect.top + 'px';
              highlight.style.width = rect.width + 'px';
              highlight.style.height = rect.height + 'px';
              document.body.appendChild(highlight);
            });
          }
        }, { selector: step.selector, action: step.action });
      }

      switch (step.action) {
        case 'fill': {
          if (!step.selector) throw new Error('Missing selector for fill');
          await page.fill(step.selector, step.value ?? '');
          await page.waitForTimeout(200);
          log(`${label} fill ${step.selector}`);
          break;
        }
        case 'click': {
          if (!step.selector) throw new Error('Missing selector for click');
          const [nav] = await Promise.all([
            page.waitForNavigation({ waitUntil: 'load' }).catch(() => null),
            page.click(step.selector),
          ]);
          if (nav) log(`${label} click ${step.selector} (navigated)`);
          else log(`${label} click ${step.selector}`);
          break;
        }
        case 'wait': {
          if (!step.selector) throw new Error('Missing selector for wait');
          await page.waitForSelector(step.selector, { timeout: step.timeout ?? 5000 });
          log(`${label} wait for ${step.selector}`);
          break;
        }
        case 'screenshot': {
          const file = await saveScreenshot(page, job.id, job.runId);
          log(`${label} saved ${file}`);
          break;
        }
        case 'pause': {
          // Manual pause for visual mode
          if (visualMode?.enabled && !isHeadless) {
            log(`${label} - Manual pause (click anywhere to continue)`);
            await page.waitForFunction(() => {
              return document.querySelector('.bot-pause-overlay') === null;
            }, { timeout: 0 });
          }
          break;
        }
        default:
          throw new Error(`Unknown action: ${(step as any).action}`);
      }

      // Visual mode: add delay between steps
      if (visualMode?.enabled && visualMode.slowMo && idx < job.steps.length - 1) {
        await page.waitForTimeout(visualMode.slowMo);
      }
    }

    await context.close();
    await browser.close();
    return { ok: true, logs: logs.join('\n') as string };
  } catch (err: any) {
    const screenshotPath = await saveScreenshot(page, job.id, job.runId).catch(() => undefined);
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    return { ok: false, error: String(err?.message || err), logs: logs.join('\n'), screenshot: screenshotPath };
  }
}

// Main job execution function
export async function runJob(job: { id: string; url: string; steps: Step[]; runId: string; config?: JobConfig }) {
  // Check if multi-bot is enabled
  if (job.config?.multiBot?.enabled) {
    return await runMultiBotJob(job);
  } else {
    return await runSingleBot(job);
  }
}

async function saveScreenshot(page: Page, jobId: string, runId: string) {
  const ts = Date.now();
  const file = `${jobId}-${runId}-${ts}.png`;
  const full = path.join(RESULTS_DIR, file);
  await fs.promises.mkdir(RESULTS_DIR, { recursive: true });
  await page.screenshot({ path: full, fullPage: true });
  return `/results/${file}`;
}


