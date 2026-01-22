import time
from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    page.route("**/api/track**", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''{
            "id": "123",
            "title": "Test Song",
            "artist": "Test Artist",
            "album": "Test Album",
            "year": "2024",
            "popularity": 90,
            "spotifyUrl": "https://spotify.com",
            "previewUrl": "https://example.com/audio.mp3"
        }'''
    ))

    print("Navigating to home...")
    page.goto("http://localhost:3000", timeout=60000)

    page.wait_for_selector("text=HISTER")

    print("Entering playlist...")
    page.wait_for_selector("input[type=text]")
    page.fill("input[type=text]", "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")
    page.click("text=ROZPOCZNIJ GRĘ")

    print("Waiting for game...")
    page.wait_for_url("**/game?**")

    # Czekamy na tag audio (ale stan attached, nie visible)
    page.wait_for_selector("audio", state="attached")

    # Czekamy na przycisk "Pokaż odpowiedź", co potwierdza że UI gracza jest gotowe
    page.wait_for_selector("text=POKAŻ ODPOWIEDŹ")

    # Robimy zrzut ekranu playera (powinno być widać przycisk Play)
    page.screenshot(path="verification/08_game_player.png")

    print("Game loaded with player.")

    browser.close()
    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
