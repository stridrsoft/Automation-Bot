# Advanced Features: IP Spoofing & Device Simulation

## Overview

The web automation app now includes advanced features for IP address spoofing and device simulation to help with testing, data collection, and automation tasks that require different network identities or device characteristics.

## Features Added

### 🔄 IP Address Spoofing (Proxy Support)
- **Proxy Server Configuration**: Route traffic through proxy servers
- **Authentication**: Support for username/password proxy authentication
- **Bypass Rules**: Configure which URLs to bypass proxy
- **Multiple Proxy Types**: HTTP, HTTPS, SOCKS proxy support

### 📱 Device Simulation
- **User Agent Spoofing**: Mimic different browsers and devices
- **Viewport Simulation**: Set custom screen resolutions
- **Device Characteristics**: Mobile/desktop, touch support, device scale
- **Geolocation**: Set custom geographic coordinates
- **Timezone**: Configure timezone for consistent behavior
- **Locale**: Set language and region preferences

### 🎭 Fingerprint Masking
- **Random User Agents**: Automatically rotate between realistic user agents
- **Random Viewports**: Vary screen resolutions to avoid detection
- **Randomized Properties**: Screen resolution, timezone, language randomization
- **Anti-Detection**: Advanced techniques to avoid bot detection

## Usage Examples

### Basic Proxy Configuration
```json
{
  "config": {
    "proxy": {
      "server": "http://proxy.example.com:8080",
      "username": "proxy_user",
      "password": "proxy_pass"
    }
  }
}
```

### Device Simulation
```json
{
  "config": {
    "device": {
      "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      "viewport": { "width": 375, "height": 812 },
      "isMobile": true,
      "hasTouch": true,
      "locale": "en-US",
      "timezoneId": "America/New_York",
      "geolocation": { "latitude": 40.7128, "longitude": -74.0060 }
    }
  }
}
```

### Fingerprint Masking
```json
{
  "config": {
    "fingerprintMasking": true
  }
}
```

## Predefined Device Presets

The system includes several device presets for common scenarios:

### Desktop Chrome
- **User Agent**: Latest Chrome on Windows
- **Viewport**: 1920x1080
- **Device**: Desktop, no touch

### Mobile iPhone
- **User Agent**: iPhone Safari
- **Viewport**: 375x812 (iPhone 13)
- **Device**: Mobile, touch enabled

### Mobile Android
- **User Agent**: Chrome on Android
- **Viewport**: 360x800
- **Device**: Mobile, touch enabled

### Tablet iPad
- **User Agent**: iPad Safari
- **Viewport**: 768x1024
- **Device**: Tablet, touch enabled

## Web UI Configuration

### Accessing Advanced Settings
1. Go to "Create Job" page
2. Click "▶ Advanced Configuration" to expand
3. Configure proxy, device, and fingerprint settings

### Configuration Options

#### Proxy Settings
- **Proxy Server**: Full proxy URL (e.g., `http://proxy.example.com:8080`)
- **Username**: Proxy authentication username
- **Password**: Proxy authentication password

#### Device Settings
- **User Agent**: Custom browser user agent string
- **Viewport**: Screen width and height
- **Mobile Device**: Enable mobile device simulation
- **Touch Support**: Enable touch interaction simulation

#### Fingerprint Masking
- **Enable**: Randomizes user agent, viewport, and other properties
- **Automatic**: No manual configuration needed

## API Integration

### Creating Jobs with Configuration
```bash
curl -X POST http://localhost:4000/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mobile Test",
    "url": "https://example.com",
    "steps": [...],
    "config": {
      "device": {
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        "viewport": { "width": 375, "height": 812 },
        "isMobile": true,
        "hasTouch": true
      },
      "proxy": {
        "server": "http://proxy.example.com:8080"
      },
      "fingerprintMasking": true
    }
  }'
```

## Security & Legal Considerations

⚠️ **Important**: These features are for legitimate testing and automation only:

### ✅ Legitimate Uses
- **Testing**: QA testing with different devices/browsers
- **Monitoring**: Website monitoring from different locations
- **Research**: Academic research and data collection
- **Own Websites**: Testing your own websites and applications

### ❌ Prohibited Uses
- **Evading Detection**: Bypassing anti-bot systems
- **Fraudulent Activity**: Creating fake traffic or interactions
- **Unauthorized Access**: Accessing restricted content
- **Terms Violations**: Violating website terms of service

### Legal Compliance
- Only use on websites you own or have explicit permission
- Comply with applicable laws (CFAA, GDPR, etc.)
- Respect website terms of service and robots.txt
- Use responsibly and ethically

## Technical Implementation

### Browser Context Configuration
The system configures Playwright browser contexts with:
- Custom user agents
- Viewport dimensions
- Device characteristics
- Proxy settings
- Geolocation data
- Timezone settings

### Fingerprint Masking Techniques
- Random user agent rotation
- Viewport randomization
- Screen resolution spoofing
- Timezone randomization
- Language randomization
- Advanced anti-detection measures

### Proxy Support
- HTTP/HTTPS proxy support
- SOCKS proxy support
- Authentication handling
- Bypass rule configuration
- Connection pooling

## Troubleshooting

### Common Issues
1. **Proxy Connection Failed**: Check proxy server URL and credentials
2. **User Agent Not Applied**: Ensure proper format and browser support
3. **Viewport Issues**: Verify width/height values are valid
4. **Geolocation Errors**: Check latitude/longitude format

### Debug Information
- Check job logs for configuration details
- Verify proxy connectivity before running jobs
- Test device settings with simple automation tasks
- Monitor for detection patterns in logs

## Best Practices

### Proxy Management
- Use reliable proxy providers
- Rotate proxies for large-scale operations
- Monitor proxy performance and success rates
- Implement retry logic for failed connections

### Device Simulation
- Use realistic device configurations
- Match user agents with viewport sizes
- Test on actual devices for validation
- Consider mobile-first design testing

### Fingerprint Masking
- Enable for sensitive operations
- Combine with proxy rotation
- Monitor for detection patterns
- Use sparingly to avoid patterns

## Support

For technical support or questions about these features:
1. Check the job logs for detailed execution information
2. Verify configuration syntax and values
3. Test with simple automation tasks first
4. Review legal and ethical guidelines

Remember: Use these features responsibly and in compliance with all applicable laws and website terms of service.
