"""
Waits for stats content to actually appear, then dumps everything.
Run: python tm_debug_table.py
"""
import time
from pathlib import Path
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import undetected_chromedriver as uc

URL = "https://www.transfermarkt.co.in/david-raya/leistungsdaten/spieler/262749/saison/2019/plus/1"

opts = uc.ChromeOptions()
opts.add_argument("--no-sandbox")
opts.add_argument("--lang=en-GB")
driver = uc.Chrome(options=opts, version_main=148)
driver.set_window_size(1400, 900)

try:
    driver.get(URL)

    # Wait up to 30s for MORE than 1 table to appear (the filter is always table 0)
    print("Waiting for stats tables to load via AJAX...")
    for i in range(30):
        count = driver.execute_script("return document.querySelectorAll('table').length;")
        print(f"  {i+1}s — tables found: {count}")
        if count > 1:
            break
        time.sleep(1)

    # Extra settle
    time.sleep(3)

    result = driver.execute_script("""
        var out = '';
        var tables = document.querySelectorAll('table');
        out += 'TOTAL TABLES: ' + tables.length + '\\n\\n';
        tables.forEach(function(t, i) {
            var rows = t.querySelectorAll('tr');
            out += '--- TABLE ' + i + ' class="' + t.className + '" id="' + t.id + '" rows=' + rows.length + '\\n';
            // dump first 3 rows
            for (var r = 0; r < Math.min(3, rows.length); r++) {
                out += '  ROW ' + r + ': ' + rows[r].outerHTML.substring(0, 600) + '\\n';
            }
            out += '\\n';
        });

        out += '\\n\\nVISIBLE PAGE TEXT (first 3000):\\n';
        out += document.body.innerText.substring(0, 3000);
        return out;
    """)

    Path("debug_dumps").mkdir(exist_ok=True)
    Path("debug_dumps/all_tables.txt").write_text(result, encoding="utf-8")
    print("\n--- OUTPUT ---")
    print(result[:6000])

finally:
    try: driver.quit()
    except: pass