import asyncio
from playwright.async_api import async_playwright
import os

artifacts_dir = r"C:\Users\Honey Shah\\.gemini\antigravity\brain\b29ac6d9-42ac-4c73-a02e-c3c2eaa62fb5"
js_path = r"c:\Users\Honey Shah\OneDrive\Desktop\Pikachu\AI\Websites\Cafe AuRA\app-v3.js"

# Read current JS code
with open(js_path, "r", encoding="utf-8") as f:
    js_content = f.read()

# Replace desktop anchor 0.65 with 0.38
new_js_content = js_content.replace("const anchor = isDesktop ? 0.65 : 0.5;", "const anchor = isDesktop ? 0.38 : 0.5;")

# Write modified JS
with open(js_path, "w", encoding="utf-8") as f:
    f.write(new_js_content)

print("Modified app-v3.js to use anchorX = 0.38 for desktop.")

async def capture_test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()
        
        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        
        shot_path = os.path.join(artifacts_dir, "desktop_hero_handle_test.jpg")
        await page.screenshot(path=shot_path, quality=90, type="jpeg")
        print(f"Captured screenshot: {shot_path}")
        
        await browser.close()

try:
    asyncio.run(capture_test())
finally:
    # Restore original JS code to keep local state clean
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print("Restored original app-v3.js.")
