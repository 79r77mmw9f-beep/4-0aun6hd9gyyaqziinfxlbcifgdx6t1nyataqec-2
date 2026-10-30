# LIVING CITY (بازی شهر زنده)

> **یک بازی مستقل ۲بعدی جهان‌باز شهری با رانندگی، جرم، شبیه‌سازی علت‌ومعلولی، جناح‌ها و اقتصاد پویا.**

---

## لینک اجرای بازی (Live Web Play)
می‌توانید آخرین نسخه بازی را بلافاصله در مرورگر خود از طریق آدرس زیر بازی و آزمایش کنید:
👉 **[اجرای زنده LIVING CITY](https://antigravity.luch.dev/site/910982dd-9e46-4137-83f6-c3898bf535db/c8bd3a7f4c1ede0d37fe5b59/)**

---

## کلیدهای کنترل بازی (Controls)

| کلید | عملکرد |
|---|---|
| **W / A / S / D** یا **کلیدهای جهت‌نما** | حرکت کاراکتر بازیکن در ۸ جهت (با سرعت قطری کاملاً یکسان) |
| **Shift** (نگه‌داشتن) | دویدن سریع‌تر (Sprint) |
| **Esc** | باز کردن / بستن منوی مکث (Pause Menu) |
| **~** (یا کلید `F1` / دکمه پرونده در HUD) | باز کردن پنل بازرس و پرونده زنده پروژه (Dev Dossier) |
| **دکمه Restart در منوی Pause** | بازنشانی صحنه به نقطه اولیه |

---

## اجرای آزمون‌ها (Testing)
این پروژه دارای آزمون‌های خودکار واحد و یکپارچگی است که مستقیماً با Node.js اجرا می‌شوند:

```bash
# اجرای تمامی تست‌ها
npm test

# اجرای تست‌های واحد (بردار، برخورد، دوربین)
npm run test:unit

# اجرای تست‌های یکپارچگی (حلقه بازی، مکث، ریستارت)
npm run test:integration
```

---

## ساختار مستندات پروژه
- [چشم‌انداز بازی (GAME_VISION)](docs/GAME_VISION.md)
- [نقشه راه فازها (ROADMAP)](docs/ROADMAP.md)
- [وضعیت جاری پروژه (PROJECT_STATUS)](docs/PROJECT_STATUS.md)
- [تصمیمات معماری ADR (DECISIONS)](docs/DECISIONS.md)
- [خطاهای باز و پیگیری (KNOWN_ISSUES)](docs/KNOWN_ISSUES.md)
- [معماری سیستم‌ها (ARCHITECTURE)](docs/ARCHITECTURE.md)
- [مدل داده و رویدادها (DATA_MODEL)](docs/DATA_MODEL.md)
- [نقشه آزمون (TEST_PLAN)](docs/TEST_PLAN.md)
- [راهنمای دیداری (ART_BIBLE)](docs/ART_BIBLE.md)
- [دفترچه سورپرایزها (SURPRISE_LEDGER)](docs/SURPRISE_LEDGER.md)
