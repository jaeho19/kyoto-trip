#!/usr/bin/env python3
"""Second-pass geocode using deep-research-CONFIRMED addresses. Nominatim 1req/s."""
import json, time, urllib.parse, urllib.request
from pathlib import Path

UA = "kyoto-trip-pwa/1.0 (offline travel app; jaeho19@gmail.com)"
N = "https://nominatim.openstreetmap.org/search"

QUERIES = {
    # research-confirmed addresses
    "kuas": ["山ノ内五反田町 右京区 京都市", "Yamanouchi Gotanda-cho Ukyo-ku Kyoto"],
    "hotel_kyoto": ["京都市中京区烏丸通三条下る饅頭屋町604", "饅頭屋町 中京区 京都市"],
    "yakinikuking": ["京都市西京区牛ヶ瀬山柿町3", "牛ヶ瀬山柿町 西京区"],
    "takadanobaba": ["兵庫県姫路市本町68", "姫路市本町68"],
    "arashiyama_resto": ["京都市右京区嵐山中尾下町 レストラン嵐山", "嵐山 渡月橋 京都市右京区"],
    "gochisomura": ["高石市 大阪府 ごちそう村", "大阪府高石市"],
}

def geocode(q):
    p = urllib.parse.urlencode({"q": q, "format": "jsonv2", "limit": "1", "accept-language": "ja"})
    req = urllib.request.Request(f"{N}?{p}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read())
    if data:
        d = data[0]
        return {"lat": round(float(d["lat"]), 5), "lng": round(float(d["lon"]), 5), "q": q}
    return None

out = {}
for key, qs in QUERIES.items():
    hit = None
    for q in qs:
        try:
            hit = geocode(q)
        except Exception as e:
            print(f"[{key}] err {e}")
        time.sleep(1.1)
        if hit:
            break
    out[key] = hit
    print(f"[{key}] {hit['lat'] if hit else 'MISS'},{hit['lng'] if hit else ''}")

dst = Path(__file__).resolve().parent.parent / "docs" / "_geocode2.json"
dst.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print("wrote", dst)
