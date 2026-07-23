import asyncio
from playwright.async_api import async_playwright

async def verify_realtime_scroll():
    async with async_playwright() as p:
        device = p.devices['iPhone 12']
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(**device)
        page = await context.new_page()
        
        # Track console errors
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(err.message))

        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(2000)
        
        # Scroll smoothly in increments of 20px to simulate active user touch scrolling
        print("Starting active scrolling simulation...")
        for y in range(0, 1500, 20):
            await page.evaluate(f"window.scrollTo(0, {y})")
            await page.wait_for_timeout(30) # 30ms between scroll steps (simulates 30fps scroll action)
            
            # Check for layout size shifts
            body_width = await page.evaluate("document.body.clientWidth")
            viewport_width = device['viewport']['width']
            if body_width > viewport_width:
                print(f"Warning: Horizontal scroll detected at Y={y} (Body: {body_width}px, Viewport: {viewport_width}px)")
                
        print("Scrolling simulation finished.")
        if console_errors:
            print("Errors detected during scroll:")
            for err in console_errors:
                print(f" - {err}")
        else:
            print("No console errors or exceptions detected during scrolling!")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_realtime_scroll())
