import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    print("Navigating to home...")
    try:
        page.goto("http://localhost:3000")
        page.wait_for_selector("text=HISTER")
        page.screenshot(path="verification/05_final_check.png")
        print("Home page loaded successfully.")
    except Exception as e:
        print(f"Error: {e}")

    browser.close()
    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
