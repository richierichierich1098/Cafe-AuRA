import asyncio
from playwright.async_api import async_playwright
import os

artifacts_dir = r"C:\Users\Honey Shah\.gemini\antigravity\brain\b29ac6d9-42ac-4c73-a02e-c3c2eaa62fb5"

async def capture_desktop():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 1920x1080 desktop window
        context = await browser.new_context(viewport={"width": 1920, "height": 1080})
        page = await context.new_page()
        
        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        
        shot_path = os.path.join(artifacts_dir, "desktop_hero_wave_border.jpg")
        await page.screenshot(path=shot_path, quality=90, type="jpeg")
        print(f"Captured desktop screenshot: {shot_path}")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_desktop())
