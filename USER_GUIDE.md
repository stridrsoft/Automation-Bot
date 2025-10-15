# Web Automation App - User Guide

## What This App Does

This app lets you create automated "bots" that can fill out forms, click buttons, and take screenshots on websites. Think of it as a digital assistant that can perform repetitive tasks on websites for you.

## Getting Started

### 1. Access the App
- Open your web browser
- Go to: `http://localhost:5173`
- You'll see a login screen

### 2. Login
- **Email:** `admin@example.com`
- **Password:** `admin`
- Click "Login"

## Creating Your First Automation

### Step 1: Create a New Job
1. Click "Create New Job" or the "+" button
2. Give your job a name (e.g., "Contact Form Filler")
3. Enter the website URL you want to automate

### Step 2: Add Automation Steps
Click "Add Step" for each action you want the bot to perform:

**Fill Text Fields:**
- Action: "Fill"
- Selector: `input[name="name"]` (the field identifier)
- Value: "John Doe" (what to type)

**Click Buttons:**
- Action: "Click" 
- Selector: `button[type="submit"]` (the button identifier)

**Wait for Elements:**
- Action: "Wait"
- Selector: `#success` (element to wait for)
- Timeout: `5000` (5 seconds)

**Take Screenshots:**
- Action: "Screenshot"
- Selector: `body` (what to capture)

### Step 3: Run Your Job
1. Click "Save Job"
2. Click "Run Now" to start immediately
3. Or click "Run Later" to schedule it

## Monitoring Your Jobs

### View All Jobs
- The main dashboard shows all your automation jobs
- See status: Pending, Running, Success, or Failed

### Check Job Details
- Click on any job to see:
  - All the steps it will perform
  - Run history and results
  - Screenshots taken
  - Any error messages

### View Results
- Screenshots are saved automatically
- Check the "Results" tab to see what the bot captured
- Download or view screenshots of completed tasks

## Example: Contact Form Automation

Here's a complete example for filling out a contact form:

1. **Job Name:** "Contact Form Bot"
2. **URL:** `http://localhost:4000/sample_pages/contact.html`
3. **Steps:**
   - Fill name field: `input[name="name"]` → "Alex Smith"
   - Fill email field: `input[name="email"]` → "alex@example.com" 
   - Fill message field: `textarea[name="message"]` → "Hello from my bot!"
   - Click submit: `button[type="submit"]`
   - Wait for success: `#success` (5 seconds)
   - Take screenshot: `body`

## Understanding Selectors

Selectors tell the bot which part of the webpage to interact with:

- `input[name="email"]` = email input field
- `button[type="submit"]` = submit button
- `#success` = element with id="success"
- `.error` = element with class="error"
- `body` = the entire page

## Tips for Success

### Good Practices:
- Test on simple pages first
- Use the sample page (`http://localhost:4000/sample_pages/contact.html`) to practice
- Add wait steps between actions to let pages load
- Always take a screenshot at the end to verify results

### Common Issues:
- **Job fails:** Check that selectors are correct
- **Timeout errors:** Increase wait times
- **Connection refused:** Make sure the app is running

## Safety & Legal Notes

⚠️ **Important:** Only use this app on websites you own or have permission to automate. Always follow website terms of service and applicable laws.

## Getting Help

If you need assistance:
1. Check the job details for error messages
2. Look at the screenshots to see what happened
3. Try simpler steps first
4. Make sure the website URL is correct and accessible

## Sample Workflow

1. **Login** to the app
2. **Create** a new job called "Test Automation"
3. **Set URL** to the sample page: `http://localhost:4000/sample_pages/contact.html`
4. **Add steps:**
   - Fill name: `input[name="name"]` → "Your Name"
   - Fill email: `input[name="email"]` → "your@email.com"
   - Fill message: `textarea[name="message"]` → "Test message"
   - Click submit: `button[type="submit"]`
   - Wait: `#success` → 5000ms
   - Screenshot: `body`
5. **Save and Run** the job
6. **Check results** in the job details

That's it! You've created your first web automation.
