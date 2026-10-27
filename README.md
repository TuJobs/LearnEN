# >_ LearnEN — Tiếng Anh IT cho dev Việt

Web app học tiếng Anh chuyên ngành CNTT dành cho lập trình viên Việt Nam: vừa chơi vừa học, ghi nhớ bằng phương pháp có cơ sở khoa học, và học từ đúng nơi bạn sẽ gặp nó khi đi làm (code comment, commit, PR review, Slack, error log, meeting).

🌐 **Dùng thử ngay:** https://tujobs.github.io/LearnEN/

Chạy hoàn toàn trên trình duyệt, không cần tài khoản hay backend. Tiến độ được lưu bằng `localStorage`, có thể xuất/nhập file JSON. Cài được lên điện thoại như app và học offline (PWA).

## Chạy dự án

```bash
npm install
npm run dev      # mở http://localhost:5173
npm test         # chạy unit test (thuật toán SRS, chấm đáp án, kiểm tra dữ liệu)
npm run build    # build production vào thư mục dist/
```

> Nên dùng **Chrome hoặc Edge** để có đủ tính năng đọc (text-to-speech) và luyện nói (speech recognition).

## Phương pháp học

| Phương pháp | Áp dụng trong app |
| --- | --- |
| **Spaced Repetition** (lặp lại ngắt quãng) | Thuật toán SM-2 (như Anki) nhắc lại mỗi từ đúng lúc bạn sắp quên: 1 → 3 → 8 → 20 → 50 ngày… |
| **Active Recall** (chủ động nhớ lại) | Bạn phải tự gõ ra từ chứ không chỉ nhìn đáp án: Code Cloze, ôn tập chiều Việt → Anh, Listen & Type |
| **Học trong ngữ cảnh** | Mỗi câu ví dụ được hiển thị như code comment, git commit, PR review, tin nhắn Slack, error log… |
| **Học từ lỗi sai** | *Vietglish Debugger*: “debug” những lỗi tiếng Anh người Việt hay mắc (`I will off tomorrow`, `discuss about`, `can't login`…) |
| **Đa giác quan** | Nghe phát âm, đọc IPA, gõ chính tả, nói vào micro và được máy chấm |
| **Gamification** | XP, combo, streak, contribution graph kiểu GitHub, huy hiệu, lên cấp từ Intern → CTO |

## Các chế độ

- **📋 Bài học hôm nay** — lộ trình ~15 phút trên Dashboard: ôn thẻ đến hạn → học từ mới → chơi một game (đổi game mỗi ngày). Chỉ cần bấm “Tiếp tục”.
- **📖 Học từ mới** — mỗi lượt 5 từ: thẻ từ (IPA, nghĩa, ví dụ trong ngữ cảnh, mẹo nhớ, lỗi phát âm hay gặp) → trắc nghiệm Anh → Việt → tự gõ Việt → Anh.
- **🔁 Ôn tập (SRS)** — ôn đúng những từ đến hạn, xen kẽ hai chiều; tự chấm Quên / Khó / Nhớ / Dễ, có hiển thị lần ôn kế tiếp.
- **🔀 Merge Pairs** — ghép thuật ngữ với nghĩa, tính giờ và combo.
- **🧩 Code Cloze** — điền từ còn thiếu vào câu thật trong môi trường làm việc.
- **🎧 Listen & Type** — nghe và gõ lại từ hoặc cả câu, có so sánh từng chữ.
- **🐛 Vietglish Debugger** — click vào chỗ sai trong câu, xem diff `-`/`+` và giải thích.
- **🎭 Tình huống thực tế** — hội thoại nhập vai: daily stand-up, code review, báo sự cố cho khách hàng, phỏng vấn.
- **🎙️ Phát âm chuẩn** — các từ dev Việt hay đọc sai (`cache`, `queue`, `schema`, `Nginx`, `suite`…), nghe mẫu và nói thử.
- **🔨 Sentence Compiler** — ráp các ô từ thành câu tiếng Anh đúng trật tự từ câu tiếng Việt; chữa tật “dịch từng chữ”.
- **📚 Từ điển** — tra cứu, lọc theo chủ đề, xem trạng thái ghi nhớ của từng từ.
- **📊 Thống kê** — dự báo số thẻ cần ôn 14 ngày tới, XP và độ chính xác 30 ngày, phân bố mức ghi nhớ (mỗi biểu đồ có bản dạng bảng).

Âm thanh phản hồi (đúng/sai/lên cấp) được tổng hợp bằng Web Audio — không cần file âm thanh — và có thể tắt trong Cài đặt.

Hầu hết màn hình dùng được hoàn toàn bằng bàn phím: `Enter`, `Space`, `1`–`4`, `←` `→`.

## Nội dung

- **240 từ/cụm từ** chia 13 chủ đề: lập trình cơ bản, Git, Web & API, database, DevOps & Cloud, test & debug, Agile & họp hành, code review, bảo mật, AI/ML, viết tắt & tiếng lóng dev (LGTM, PTAL, WIP, OOO, YAGNI…), Frontend & UI, Email & làm việc với khách.
- **50 lỗi Vietglish** điển hình kèm giải thích.
- **8 kịch bản hội thoại**: stand-up, code review, báo sự cố, phỏng vấn, sprint planning, làm rõ yêu cầu qua email, xử lý bug cùng QA, nhờ tech lead hỗ trợ.

## Lộ trình gợi ý: 15 phút mỗi ngày

Mục **Bài học hôm nay** trên Dashboard dẫn bạn qua đúng ba bước này:

1. **5 phút** — Ôn tập tất cả thẻ đến hạn (ưu tiên số 1, đừng bỏ qua).
2. **5 phút** — Học 5 từ mới.
3. **5 phút** — Chơi một game. Game không tự thêm từ chưa học vào lịch ôn, nhưng ưu tiên những từ bạn hay quên.

Giữ streak quan trọng hơn học nhiều trong một ngày — đặt mục tiêu XP trong phần Cài đặt.

## Deploy & cài như app

Repo đã cấu hình sẵn GitHub Actions (`.github/workflows/deploy.yml`): **mỗi lần push lên nhánh `main`**, GitHub tự chạy test, build và deploy lên GitHub Pages. Test fail thì bản cũ được giữ nguyên.

Muốn đưa lên host khác (Netlify, Vercel, Cloudflare Pages…), chạy `npm run build` rồi upload thư mục `dist/`. Build dùng đường dẫn tương đối nên chạy được cả trong thư mục con. Trên HTTPS, app tự cài service worker:

- Sau lần mở đầu tiên, **toàn bộ app chạy offline** (mọi trang đã được lưu sẵn).
- Cài lên máy: Chrome/Edge bấm biểu tượng cài đặt trên thanh địa chỉ (hoặc nút trong **Cài đặt → Cài app**); iPhone mở bằng Safari → Chia sẻ → **Thêm vào MH chính**.
- Khi deploy bản mới, người dùng nhận bản mới ngay lần mở tiếp theo khi có mạng.

Service worker chỉ bật ở bản build (`npm run build` + `npm run preview` để thử), không bật khi chạy `npm run dev`.

## Cấu trúc thư mục

```
src/
├── data/            # Nội dung học: words.ts, bugs.ts, scenarios.ts, topics.ts
├── lib/
│   ├── srs.ts       # Thuật toán lặp lại ngắt quãng (SM-2 rút gọn)
│   ├── store.ts     # Tiến độ, XP, streak — lưu localStorage
│   ├── gamify.ts    # Cấp độ, streak, huy hiệu
│   ├── text.ts      # Chấm đáp án (cho phép gõ sai nhẹ), so khớp câu
│   ├── speech.ts    # Text-to-speech (tự chọn giọng tự nhiên nhất) & nhận diện giọng nói
│   ├── pick.ts      # Chọn từ cho game: từ đến hạn → từ đã học → từ mới, từ yếu trước
│   ├── builder.ts   # Tách câu thành ô từ, chấm trật tự (Sentence Compiler)
│   ├── stats.ts     # Dự báo ôn tập, chuỗi dài nhất, phân bố mức ghi nhớ
│   ├── sfx.ts       # Âm thanh phản hồi tổng hợp bằng Web Audio
│   └── pwa.ts       # Đăng ký service worker, nút cài app
├── service-worker.js # Cache offline; build tự chèn danh sách file (xem vite.config.ts)
├── routes.ts        # Danh sách trang & menu
├── components/      # Thẻ từ, khung ngữ cảnh (code/Slack/PR…), quiz, biểu đồ SVG
└── pages/           # Mỗi chế độ học là một trang
```

## Thêm từ vựng

Thêm một object vào chủ đề tương ứng trong `src/data/words.ts`. Từ cần học trong câu ví dụ được bọc trong `[ ]`:

```ts
{
  word: 'idempotent', ipa: '/ˌaɪ.dəmˈpoʊ.tənt/', pos: 'adj', vi: 'gọi nhiều lần vẫn cho cùng kết quả', ctx: 'pr',
  ex: 'PUT requests should be [idempotent].',
  exVi: 'Request PUT nên có tính idempotent.',
  tip: 'GET, PUT, DELETE là idempotent; POST thì không.',
  // Tuỳ chọn — để từ xuất hiện trong mục Phát âm chuẩn:
  wrong: 'i-đem-pô-tần', sound: 'ai-đầm-PÂU-tần',
},
```

`ctx` quyết định câu được hiển thị như thế nào: `code`, `commit`, `terminal`, `error`, `pr`, `chat`, `meeting`, `doc`, `email`. Chạy `npm test` để kiểm tra dữ liệu hợp lệ (mỗi câu ví dụ có đúng một `[ ]`, id không trùng…).

## Hướng phát triển

- Đồng bộ tiến độ giữa các thiết bị (Supabase/Firebase).
- Dùng LLM để chấm câu tự viết (vd: viết commit message, trả lời review) và giải thích lỗi.
- Nâng cấp thuật toán SRS lên FSRS.
- Thêm chủ đề: mobile, frontend, data engineering, viết email cho khách hàng Nhật/Mỹ.
