import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = (import.meta as any).env.VITE_API_URL || '';

type Step = { action: 'fill' | 'click' | 'wait' | 'screenshot' | 'pause'; selector?: string; value?: string; timeout?: number };

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
  delayBetweenBots?: number;
  randomizeOrder?: boolean;
};

type VisualModeConfig = {
  enabled: boolean;
  headless: boolean;
  slowMo?: number;
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

export default function JobCreate() {
  const [name, setName] = useState('Contact form demo');
  const [url, setUrl] = useState('http://localhost:4000/sample_pages/contact.html');
  const [steps, setSteps] = useState<Step[]>([
    { action: 'fill', selector: "input[name='name']", value: 'Alec' },
    { action: 'fill', selector: "input[name='email']", value: 'alec@example.com' },
    { action: 'fill', selector: "textarea[name='message']", value: 'Hello from bot!' },
    { action: 'click', selector: "button[type='submit']" },
    { action: 'wait', selector: '#success', timeout: 5000 },
    { action: 'screenshot', selector: 'body' },
  ]);
  const [config, setConfig] = useState<JobConfig>({
    fingerprintMasking: false,
    device: {
      userAgent: '',
      viewport: { width: 1920, height: 1080 },
      isMobile: false,
      hasTouch: false,
    },
    proxy: {
      server: '',
      username: '',
      password: '',
    },
    multiBot: {
      enabled: false,
      count: 1,
      proxies: [],
      devices: [],
      delayBetweenBots: 1000,
      randomizeOrder: false,
    },
    visualMode: {
      enabled: false,
      headless: true,
      slowMo: 1000,
      showDevTools: false,
      allowManualIntervention: false,
      pauseOnError: false,
    },
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  function updateStep(i: number, s: Partial<Step>) {
    setSteps((prev) => prev.map((step, idx) => (idx === i ? { ...step, ...s } : step)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(
        `${API_URL}/jobs`,
        { name, url, steps, runImmediately: true, config },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/jobs/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create job');
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Create Job</h1>
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label className="block text-sm">Name</label>
          <input className="border rounded w-full p-2" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">URL</label>
          <input className="border rounded w-full p-2" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <div className="bg-white rounded shadow">
          <table className="w-full">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Action</th>
                <th className="p-2">Selector</th>
                <th className="p-2">Value</th>
                <th className="p-2">Timeout</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">
                    <select className="border rounded p-1" value={s.action} onChange={(e) => updateStep(i, { action: e.target.value as any })}>
                      <option value="fill">fill</option>
                      <option value="click">click</option>
                      <option value="wait">wait</option>
                      <option value="screenshot">screenshot</option>
                      <option value="pause">pause</option>
                    </select>
                  </td>
                  <td className="p-2"><input className="border rounded p-1 w-full" value={s.selector || ''} onChange={(e) => updateStep(i, { selector: e.target.value })} /></td>
                  <td className="p-2"><input className="border rounded p-1 w-full" value={s.value || ''} onChange={(e) => updateStep(i, { value: e.target.value })} /></td>
                  <td className="p-2"><input type="number" className="border rounded p-1 w-full" value={s.timeout || 0} onChange={(e) => updateStep(i, { timeout: Number(e.target.value) })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Advanced Configuration */}
        <div className="border-t pt-4">
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▼' : '▶'} Advanced Configuration
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded">
              {/* Fingerprint Masking */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.fingerprintMasking || false}
                    onChange={(e) => setConfig(prev => ({ ...prev, fingerprintMasking: e.target.checked }))}
                    className="mr-2"
                  />
                  Enable Fingerprint Masking (randomizes user agent, viewport, etc.)
                </label>
              </div>

              {/* Device Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">User Agent</label>
                  <input
                    className="border rounded w-full p-2 text-sm"
                    value={config.device?.userAgent || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      device: { ...prev.device, userAgent: e.target.value }
                    }))}
                    placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Viewport (W x H)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="border rounded p-2 text-sm w-20"
                      value={config.device?.viewport?.width || 1920}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        device: { ...prev.device, viewport: { ...prev.device?.viewport, width: Number(e.target.value) } }
                      }))}
                    />
                    <span className="self-center">x</span>
                    <input
                      type="number"
                      className="border rounded p-2 text-sm w-20"
                      value={config.device?.viewport?.height || 1080}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        device: { ...prev.device, viewport: { ...prev.device?.viewport, height: Number(e.target.value) } }
                      }))}
                    />
                  </div>
                </div>
              </div>

              {/* Device Type */}
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.device?.isMobile || false}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      device: { ...prev.device, isMobile: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  Mobile Device
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.device?.hasTouch || false}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      device: { ...prev.device, hasTouch: e.target.checked }
                    }))}
                    className="mr-2"
                  />
                  Touch Support
                </label>
              </div>

              {/* Proxy Configuration */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Proxy Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">Proxy Server</label>
                    <input
                      className="border rounded w-full p-2 text-sm"
                      value={config.proxy?.server || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        proxy: { ...prev.proxy, server: e.target.value }
                      }))}
                      placeholder="http://proxy.example.com:8080"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Username</label>
                    <input
                      className="border rounded w-full p-2 text-sm"
                      value={config.proxy?.username || ''}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        proxy: { ...prev.proxy, username: e.target.value }
                      }))}
                      placeholder="proxy_username"
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    className="border rounded w-full p-2 text-sm"
                    value={config.proxy?.password || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      proxy: { ...prev.proxy, password: e.target.value }
                    }))}
                    placeholder="proxy_password"
                  />
                </div>
              </div>

              {/* Multi-Bot Configuration */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Multi-Bot Settings</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.multiBot?.enabled || false}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        multiBot: { ...prev.multiBot, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    Enable Multi-Bot Mode (run multiple bots simultaneously)
                  </label>

                  {config.multiBot?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Number of Bots</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          className="border rounded w-full p-2 text-sm"
                          value={config.multiBot?.count || 1}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            multiBot: { ...prev.multiBot, count: Number(e.target.value) }
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Delay Between Bots (ms)</label>
                        <input
                          type="number"
                          min="0"
                          className="border rounded w-full p-2 text-sm"
                          value={config.multiBot?.delayBetweenBots || 1000}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            multiBot: { ...prev.multiBot, delayBetweenBots: Number(e.target.value) }
                          }))}
                        />
                      </div>
                    </div>
                  )}

                  {config.multiBot?.enabled && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Proxy List (one per line)</label>
                      <textarea
                        className="border rounded w-full p-2 text-sm"
                        rows={3}
                        placeholder="http://proxy1.example.com:8080&#10;http://proxy2.example.com:8080&#10;http://proxy3.example.com:8080"
                        value={config.multiBot?.proxies?.join('\n') || ''}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          multiBot: { ...prev.multiBot, proxies: e.target.value.split('\n').filter(p => p.trim()) }
                        }))}
                      />
                    </div>
                  )}

                  {config.multiBot?.enabled && (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.multiBot?.randomizeOrder || false}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          multiBot: { ...prev.multiBot, randomizeOrder: e.target.checked }
                        }))}
                        className="mr-2"
                      />
                      Randomize proxy/device assignment order
                    </label>
                  )}
                </div>
              </div>

              {/* Visual Mode Configuration */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Visual Mode Settings</h4>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.visualMode?.enabled || false}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        visualMode: { ...prev.visualMode, enabled: e.target.checked }
                      }))}
                      className="mr-2"
                    />
                    Enable Visual Mode (see browser automation in action)
                  </label>

                  {config.visualMode?.enabled && (
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={!config.visualMode?.headless}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            visualMode: { ...prev.visualMode, headless: !e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        Show Browser Window (headless: false)
                      </label>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium">Slow Motion (ms)</label>
                          <input
                            type="number"
                            min="0"
                            className="border rounded w-full p-2 text-sm"
                            value={config.visualMode?.slowMo || 1000}
                            onChange={(e) => setConfig(prev => ({
                              ...prev,
                              visualMode: { ...prev.visualMode, slowMo: Number(e.target.value) }
                            }))}
                          />
                        </div>
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={config.visualMode?.showDevTools || false}
                              onChange={(e) => setConfig(prev => ({
                                ...prev,
                                visualMode: { ...prev.visualMode, showDevTools: e.target.checked }
                              }))}
                              className="mr-2"
                            />
                            Show DevTools
                          </label>
                        </div>
                      </div>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.visualMode?.allowManualIntervention || false}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            visualMode: { ...prev.visualMode, allowManualIntervention: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        Allow Manual Intervention (pause for user interaction)
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.visualMode?.pauseOnError || false}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            visualMode: { ...prev.visualMode, pauseOnError: e.target.checked }
                          }))}
                          className="mr-2"
                        />
                        Pause on Error (keep browser open for debugging)
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Create & Run</button>
          <button type="button" className="border px-4 py-2 rounded" onClick={() => setSteps((s) => [...s, { action: 'wait', selector: '#selector', timeout: 1000 }])}>Add Step</button>
        </div>
      </form>
    </div>
  );
}


