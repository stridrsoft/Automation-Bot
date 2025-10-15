# Multi-Bot & Visual Mode Guide

## Overview

The web automation app now supports **multi-bot execution** and **visual browser mode** for educational purposes. You can run multiple bots simultaneously with different IP addresses and devices, and watch the automation happen in real-time.

## 🚀 Multi-Bot Mode

### What is Multi-Bot Mode?
Instead of running one bot, you can configure the system to run multiple bots simultaneously, each with different:
- **IP addresses** (different proxies)
- **Device simulations** (different user agents, viewports)
- **Timing** (delays between bot launches)

### Configuration Example
```json
{
  "name": "Multi-Device Test",
  "url": "https://example.com",
  "steps": [...],
  "config": {
    "multiBot": {
      "enabled": true,
      "count": 5,
      "proxies": [
        "http://proxy1.example.com:8080",
        "http://proxy2.example.com:8080",
        "http://proxy3.example.com:8080"
      ],
      "delayBetweenBots": 2000,
      "randomizeOrder": true
    }
  }
}
```

### How It Works
1. **Bot 1**: Uses proxy1, launches immediately
2. **Bot 2**: Uses proxy2, launches after 2 seconds
3. **Bot 3**: Uses proxy3, launches after 4 seconds
4. **Bot 4**: Uses proxy1 (rotates), launches after 6 seconds
5. **Bot 5**: Uses proxy2, launches after 8 seconds

Each bot runs independently and can have different device configurations.

## 👁️ Visual Mode

### What is Visual Mode?
Visual mode lets you **see the browser automation in action** instead of running headlessly. Perfect for:
- **Learning**: Understanding how automation works
- **Debugging**: Seeing exactly what the bot is doing
- **Manual Intervention**: Taking control when needed

### Configuration Example
```json
{
  "config": {
    "visualMode": {
      "enabled": true,
      "headless": false,
      "slowMo": 1000,
      "showDevTools": true,
      "allowManualIntervention": true,
      "pauseOnError": true
    }
  }
}
```

### Visual Mode Features

#### 1. **Visible Browser Window**
- Browser window opens and you can see everything
- Watch forms being filled, buttons being clicked
- See page navigation and interactions

#### 2. **Slow Motion**
- Set delay between actions (e.g., 1000ms = 1 second)
- Perfect for understanding the automation flow
- Adjustable speed for different learning needs

#### 3. **Element Highlighting**
- Current target elements are highlighted with red borders
- Shows exactly what the bot is about to interact with
- Visual feedback for each automation step

#### 4. **Manual Intervention**
- Pause automation to interact manually
- Take control of the browser when needed
- Continue automation after manual actions

#### 5. **Developer Tools**
- Optional DevTools panel for debugging
- Inspect elements, network requests, console logs
- Advanced debugging capabilities

## 🎯 Educational Use Cases

### 1. **Learning Web Automation**
```json
{
  "config": {
    "visualMode": {
      "enabled": true,
      "headless": false,
      "slowMo": 2000,
      "allowManualIntervention": true
    }
  }
}
```
- Watch each step happen slowly
- Understand selector targeting
- Learn automation patterns

### 2. **Testing Different Devices**
```json
{
  "config": {
    "multiBot": {
      "enabled": true,
      "count": 3,
      "devices": [
        {"userAgent": "iPhone", "viewport": {"width": 375, "height": 812}},
        {"userAgent": "Android", "viewport": {"width": 360, "height": 800}},
        {"userAgent": "Desktop", "viewport": {"width": 1920, "height": 1080}}
      ]
    }
  }
}
```
- Test how your website looks on different devices
- Compare mobile vs desktop experiences
- Validate responsive design

### 3. **Load Testing with Different IPs**
```json
{
  "config": {
    "multiBot": {
      "enabled": true,
      "count": 10,
      "proxies": ["proxy1.com", "proxy2.com", "proxy3.com"],
      "delayBetweenBots": 500
    }
  }
}
```
- Simulate multiple users from different locations
- Test server performance under load
- Validate rate limiting and security measures

## 🛠️ Step-by-Step Tutorial

### Tutorial 1: Basic Visual Mode
1. **Create a new job**
2. **Enable Visual Mode**:
   - Check "Enable Visual Mode"
   - Uncheck "Show Browser Window" (headless: false)
   - Set Slow Motion to 2000ms
3. **Add simple steps**:
   - Fill a form field
   - Click a button
   - Take a screenshot
4. **Run the job** and watch the browser automation

### Tutorial 2: Multi-Bot with Visual Mode
1. **Create a new job**
2. **Enable Multi-Bot Mode**:
   - Check "Enable Multi-Bot Mode"
   - Set Number of Bots to 3
   - Add 3 different proxy URLs
3. **Enable Visual Mode**:
   - Check "Enable Visual Mode"
   - Uncheck "Show Browser Window"
4. **Run the job** and watch 3 browser windows open simultaneously

### Tutorial 3: Manual Intervention
1. **Create a job with manual steps**
2. **Enable Visual Mode with Manual Intervention**
3. **Add a "pause" step** in your automation
4. **Run the job**:
   - Bot will pause and show overlay
   - You can interact with the page manually
   - Click anywhere to continue automation

## 📊 Monitoring Multiple Bots

### Real-Time Monitoring
- Each bot runs in its own browser window
- Console logs show which bot is performing which action
- Screenshots are saved for each bot separately
- Results are aggregated in the job details

### Bot Identification
- Bot 1: `job-123-bot-1`
- Bot 2: `job-123-bot-2`
- Bot 3: `job-123-bot-3`
- Each has its own logs and screenshots

## 🔧 Advanced Configuration

### Custom Device Presets
```json
{
  "multiBot": {
    "devices": [
      {
        "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        "viewport": {"width": 375, "height": 812},
        "isMobile": true,
        "hasTouch": true
      },
      {
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "viewport": {"width": 1920, "height": 1080},
        "isMobile": false,
        "hasTouch": false
      }
    ]
  }
}
```

### Proxy Rotation
```json
{
  "multiBot": {
    "proxies": [
      "http://proxy1.example.com:8080",
      "http://proxy2.example.com:8080",
      "http://proxy3.example.com:8080"
    ],
    "randomizeOrder": true
  }
}
```

### Timing Control
```json
{
  "multiBot": {
    "delayBetweenBots": 5000,  // 5 seconds between bot launches
    "count": 10
  },
  "visualMode": {
    "slowMo": 1000  // 1 second between actions
  }
}
```

## 🎓 Educational Benefits

### For Students
- **Visual Learning**: See automation happen in real-time
- **Hands-on Experience**: Interact with the browser during automation
- **Debugging Skills**: Learn to troubleshoot automation issues
- **Multi-Device Testing**: Understand responsive design testing

### For Teachers
- **Demonstration Tool**: Show automation concepts visually
- **Interactive Learning**: Students can pause and explore
- **Real-world Scenarios**: Simulate actual testing scenarios
- **Assessment**: Students can demonstrate understanding

### For Developers
- **Testing Tool**: Validate automation scripts
- **Debugging**: Identify issues in automation logic
- **Performance Testing**: Test with multiple concurrent users
- **Cross-browser Testing**: Test different device configurations

## ⚠️ Important Notes

### System Requirements
- **Visual Mode**: Requires display (not suitable for headless servers)
- **Multi-Bot**: Each bot uses system resources
- **Memory**: More bots = more memory usage
- **Network**: Each bot makes network requests

### Best Practices
- **Start Small**: Begin with 1-2 bots for learning
- **Monitor Resources**: Watch CPU and memory usage
- **Use Delays**: Add delays between bots to avoid overwhelming servers
- **Test Locally**: Use localhost for initial testing

### Legal Considerations
- **Educational Use Only**: These features are for learning purposes
- **Respect Rate Limits**: Don't overwhelm target websites
- **Follow Terms of Service**: Only test on websites you own or have permission
- **Ethical Use**: Use responsibly and ethically

## 🚀 Getting Started

1. **Rebuild the application**:
   ```bash
   docker compose build --no-cache
   docker compose up
   ```

2. **Access the web interface** at `http://localhost:5173`

3. **Create a new job** and expand "Advanced Configuration"

4. **Enable Multi-Bot Mode** and/or **Visual Mode**

5. **Configure your settings** and run the job

6. **Watch the magic happen**! 🎉

## 📚 Example Scenarios

### Scenario 1: Learning Form Automation
- **Goal**: Learn how to fill out web forms
- **Setup**: Visual mode with slow motion
- **Steps**: Fill name, email, message, submit
- **Learning**: See each field being filled, understand selectors

### Scenario 2: Multi-Device Testing
- **Goal**: Test website on different devices
- **Setup**: Multi-bot with different device configs
- **Steps**: Navigate to page, take screenshots
- **Learning**: Compare how site looks on different devices

### Scenario 3: Load Testing
- **Goal**: Test server performance
- **Setup**: Multi-bot with different proxies
- **Steps**: Simultaneous requests to same endpoint
- **Learning**: Understand load testing concepts

This guide provides everything you need to get started with multi-bot and visual mode features for educational purposes!
