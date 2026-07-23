import asyncio
from playwright.async_api import async_playwright

async def debug_sticky():
    async with async_playwright() as p:
        device = p.devices['iPhone 12']
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(**device)
        page = await context.new_page()
        
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(2000)
        
        # Scroll to Y=300px (inside the pinning range)
        await page.evaluate("window.scrollTo(0, 300)")
        await page.wait_for_timeout(500)
        
        # Query sticky element styles and bounding rect
        info = await page.evaluate("""() => {
            const hero = document.getElementById('hero');
            const wrapper = document.getElementById('hero-scrub-container');
            const computed = window.getComputedStyle(hero);
            
            return {
                sticky_inline_position: hero.style.position,
                sticky_inline_top: hero.style.top,
                sticky_computed_position: computed.position,
                sticky_computed_top: computed.top,
                sticky_computed_height: computed.height,
                wrapper_rect_top: wrapper.getBoundingClientRect().top,
                hero_rect_top: hero.getBoundingClientRect().top,
                hero_rect_bottom: hero.getBoundingClientRect().bottom,
                window_inner_height: window.innerHeight,
                scroll_y: window.scrollY
            };
        }""")
        
        print("--- Mobile Debug Info at Y=300px scroll ---")
        for key, val in info.items():
            print(f"{key}: {val}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_sticky())
