# 果果小夥伴・猜性別

Mobile First 的寶寶性別投票網站，使用 Next.js、Vercel API Route 與 Supabase PostgreSQL。

## 1. 建立 Supabase 資料表

專案已對應既有 Supabase Project `Gender Party` 的 `public.GenderTbl`：

| 欄位 | 用途 |
| --- | --- |
| `NickName` | 投票人暱稱，也是 Primary Key |
| `Gender` | 儲存 `男` 或 `女` |
| `VoteDate` | 最後投票時間 |

`supabase/schema.sql` 僅供日後需要重建資料表時使用，現有 Project 不需再次執行。
若 Project 關閉了 Data API，請到 **Integrations → Data API Settings** 確認 `public` schema 已公開給 Data API；資料表本身仍由 RLS 與權限限制保護。

## 2. 設定本機環境變數

複製 `.env.example` 為 `.env.local`：

```env
SUPABASE_URL=https://ummyhbtaghbugrndlsxp.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_secret_key
```

Secret Key 只能放在伺服器環境變數，禁止加上 `NEXT_PUBLIC_`，也不可提交到 Git。

## 3. 本機執行

```bash
npm install
npm run dev
```

瀏覽 `http://localhost:3000`。投票後可在 Supabase 的 **Table Editor → votes** 查看資料。

## 4. 部署到 Vercel

1. 將整個專案推送到 GitHub。
2. 在 Vercel 選擇 **Add New → Project**，匯入該 Repository。
3. Framework Preset 選擇 **Next.js**。
4. 在 **Environment Variables** 新增 `SUPABASE_URL` 與 `SUPABASE_SECRET_KEY`。
5. 兩個變數套用到 Production；若要測試 Preview，也請套用到 Preview。
6. 點擊 **Deploy**。

## 投票規則

- `NickName` 是資料表 Primary Key，同一暱稱再次投票會更新 `Gender` 與 `VoteDate`，不會增加第二票。
- 兩個不同的人若輸入完全相同的暱稱，後投票者會更新前一筆；建議使用容易辨識且不重複的暱稱。
- 若需嚴格的一人一票，必須增加登入、邀請碼或另一個唯一識別欄位。
