#!/usr/bin/env python3
"""Geocode precise addresses via OSM Nominatim (1 req/sec, proper UA).
Writes docs/_geocode.json for review before applying to data.js."""
import json, time, urllib.parse, urllib.request
from pathlib import Path

UA = "kyoto-trip-pwa/1.0 (offline travel app; jaeho19@gmail.com)"
NOMINATIM = "https://nominatim.openstreetmap.org/search"

# key -> list of queries (try in order until a hit)
QUERIES = {
    "kuas": ["京都先端科学大学 太秦キャンパス", "京都府京都市右京区山ノ内五反田町18"],
    "hotel_kyoto": ["ホテルモントレ京都", "Hotel Monterey Kyoto"],
    "hotel_kobe": ["ホテルモントレ神戸", "Hotel Monterey Kobe"],
    "gochisomura": ["ごちそう村 高石", "ごちそう村 大阪府高石市"],
    "yakinikuking": ["焼肉きんぐ 京都桂店", "焼肉きんぐ 桂 京都市"],
    "kagonoya": ["かごの屋 神戸住吉店", "かごの屋 神戸市 住吉"],
    "takadanobaba": ["高田馬場 姫路市", "高田馬場 姫路"],
    "arashiyama_resto": ["嵐山 レストラン 京都市右京区嵐山"],
    # landmark confirmations
    "kinkakuji": ["金閣寺"], "ginkakuji": ["銀閣寺"], "kiyomizu": ["清水寺 京都"],
    "nonomiya": ["野宮神社"], "bamboo": ["嵐山 竹林の小径"],
    "togetsukyo": ["渡月橋"], "himeji": ["姫路城"], "kix": ["関西国際空港"],
}

def geocode(q):
    params = urllib.parse.urlencode({"q": q, "format": "jsonv2", "limit": "1",
                                     "accept-language": "ja"})
    req = urllib.request.Request(f"{NOMINATIM}?{params}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read())
    if data:
        d = data[0]
        return {"lat": round(float(d["lat"]), 5), "lng": round(float(d["lon"]), 5),
                "matched": d.get("display_name", "")[:80], "query": q}
    return None

def main():
    out = {}
    for key, qs in QUERIES.items():
        hit = None
        for q in qs:
            try:
                hit = geocode(q)
            except Exception as e:
                print(f"[{key}] '{q}' error: {e}")
            time.sleep(1.1)
            if hit:
                break
        out[key] = hit
        print(f"[{key}] {hit['lat'] if hit else 'MISS'},{hit['lng'] if hit else ''}")
    dst = Path(__file__).resolve().parent.parent / "docs" / "_geocode.json"
    dst.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nwrote {dst}")

if __name__ == "__main__":
    main()
