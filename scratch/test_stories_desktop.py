import asyncio
from playwright.async_api import async_playwright
import os

artifacts_dir = r"C:\Users\Honey Shah\.gemini\antigravity\brain\b29ac6d9-42ac-4c73-a02e-c3c2eaa62fb5"

async def capture_stories_desktop():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()
        
        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        
        print("Scrolling to #stories section...")
        await page.evaluate("document.getElementById('stories').scrollIntoView();")
        await page.wait_for_timeout(1000)
        
        shot_path = os.path.join(artifacts_dir, "desktop_stories_3columns.jpg")
        await page.screenshot(path=shot_path, quality=90, type="jpeg")
        print(f"Captured stories desktop screenshot: {shot_path}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_stories_desktop())
