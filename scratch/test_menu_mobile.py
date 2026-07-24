import asyncio
from playwright.async_api import async_playwright
import os

artifacts_dir = r"C:\Users\Honey Shah\.gemini\antigravity\brain\b29ac6d9-42ac-4c73-a02e-c3c2eaa62fb5"

async def capture_menu_mobile():
    async with async_playwright() as p:
        context = await p.chromium.launch(headless=True)
        # Emulate standard phone viewport (iPhone 12/13/14 equivalent)
        page = await context.new_page(viewport={"width": 390, "height": 844})
        
        print("Navigating to http://localhost:3000...")
        await page.goto("http://localhost:3000", wait_until="domcontentloaded")
        await page.wait_for_timeout(2000)
        
        print("Scrolling to .savour-arched-row section...")
        await page.evaluate("document.querySelector('.savour-arched-row').scrollIntoView({block: 'start'});")
        await page.wait_for_timeout(1000)
        
        shot_path = os.path.join(artifacts_dir, "mobile_menu_carousel.jpg")
        await page.screenshot(path=shot_path, quality=90, type="jpeg")
        print(f"Captured menu mobile screenshot: {shot_path}")
        
        await context.close()

if __name__ == "__main__":
    asyncio.run(capture_menu_mobile())
