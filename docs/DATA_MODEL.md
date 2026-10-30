# مدل داده و الگوهای ساختاریافته (DATA_MODEL)
## بازی «LIVING CITY»

---

## ۱. مدل داده رویدادها (Event Schema)
هر رویدادی که در بازی تولید می‌شود از شمای استاندارد زیر پیروی می‌کند:
```json
{
  "event_id": "evt_1001",
  "tick": 345,
  "timestamp": 1720000000000,
  "event_type": "PlayerMoved | CollisionOccurred | GamePaused | GameResumed",
  "actor_id": "player_01",
  "target_id": null,
  "location": { "x": 120.5, "y": 240.0 },
  "evidence": {},
  "visibility": "public | local | hidden"
}
```

---

## ۲. مدل داده نقشه و تایل‌ها (TileMap Schema)
نقشه شهر بر پایه شبکه‌ای از بلوک‌ها و تایل‌ها با ابعاد استاندارد ۳۲ در ۳۲ پیکسل طراحی شده است:
- `EMPTY (0)`: فضای خالی
- `ROAD_ASPHALT (1)`: خیابان آسفالت با خط‌کشی
- `SIDEWALK (2)`: پیاده‌رو بتنی ایمن برای عابران
- `CROSSWALK (3)`: گذرگاه عابر پیاده
- `BUILDING_WALL (10)`: دیوار صلب ساختمان با برخورد کامل
- `BUILDING_ROOF (11)`: سقف ساختمان (دارای بافت و سایه مایل)
- `BOLLARD_OBSTACLE (20)`: مانع فیزیکی پیاده‌رو / جدول بتنی
- `SPECIAL_WINDOW (30)`: پنجره ویژه با سوسوی نور (Narrative Seed)

---

## ۳. مدل داده موجودیت بازیکن (Player Entity)
```javascript
{
  id: "player_main",
  position: Vector2(x, y),
  velocity: Vector2(vx, vy),
  speed: 160.0, // pixels per second
  heading: 0.0, // radians
  size: { width: 22, height: 22 },
  state: "idle | walking",
  health: 100,
  inVehicle: false
}
```
