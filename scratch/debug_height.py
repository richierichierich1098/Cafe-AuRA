import asyncio
from playwright.async_api import async_playwright

async def debug_height():
    async with async_playwright() as p:
        device = p.devices['iPhone 12']
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(**device)
        page = await context.new_page()
        
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(2000)
        
        await page.evaluate("window.scrollTo(0, 300)")
        await page.wait_for_timeout(500)
        
        info = await page.evaluate("""() => {
            const hero = document.getElementById('hero');
            const grid = hero.querySelector('.poetry-grid');
            const computedHero = window.getComputedStyle(hero);
            const computedGrid = window.getComputedStyle(grid);
            
            return {
                hero_height: computedHero.height,
                hero_min_height: computedHero.minHeight,
                hero_max_height: computedHero.maxHeight,
                hero_box_sizing: computedHero.boxSizing,
                hero_margin: computedHero.margin,
                hero_padding: computedHero.padding,
                grid_height: computedGrid.height,
                grid_min_height: computedGrid.minHeight,
                grid_max_height: computedGrid.maxHeight,
                window_inner_height: window.innerHeight,
                document_client_height: document.documentElement.clientHeight
            };
        }""")
        
        print("--- Detailed Height Metrics ---")
        for key, val in info.items():
            print(f"{key}: {val}")
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_height())
