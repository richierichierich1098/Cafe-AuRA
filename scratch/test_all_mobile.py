import asyncio
from playwright.async_api import async_playwright
import os

artifacts_dir = r"C:\Users\Honey Shah\.gemini\antigravity\brain\b29ac6d9-42ac-4c73-a02e-c3c2eaa62fb5"

async def capture_all_viewports():
    viewports = [360, 375, 390, 412, 430, 768]
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for w in viewports:
            # Emulate mobile screen height proportional to width
            h = 800 if w < 768 else 1024
            context = await browser.new_context(
                viewport={"width": w, "height": h},
                user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1"
            )
            page = await context.new_page()
            
            print(f"Navigating for viewport {w}x{h}...")
            await page.goto("http://localhost:3000", wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)
            
            # Capture the Hero page load state
            shot_path = os.path.join(artifacts_dir, f"mobile_verify_{w}px.jpg")
            await page.screenshot(path=shot_path, quality=80, type="jpeg", timeout=20000)
            print(f"Captured {w}px render: {shot_path}")
            
            await context.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_all_viewports())
