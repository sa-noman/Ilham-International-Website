# Ilham International Website

সর্বশেষ **Newsroom v8** ডিজাইনের চালানো যায় এমন ফ্রন্টএন্ড। অষ্টম সংস্করণের বিশ্লেষণ–মতামত ডিভাইডার, উদ্ধৃতিচিহ্নসহ পরিচ্ছন্ন মতামত তালিকা এবং পূর্বের সব সংবাদ বিভাগ এতে আছে।

## চালানো

Node.js 20 বা পরবর্তী সংস্করণ প্রয়োজন। কোনো npm dependency বা API key লাগে না।

```sh
npm run dev
```

খুলুন http://127.0.0.1:4173 । অন্য পোর্টের জন্য `PORT=3000 npm run dev`।

```sh
npm run check
npm run build
npm run preview
```

`dist/` ফোল্ডার যেকোনো static hosting-এ দেওয়া যাবে। GitHub Pages-এর project subpath-এও relative assets ও hash routes কাজ করে। এই রিপো থেকে কোনো production deployment স্বয়ংক্রিয়ভাবে চালু করা হয়নি।

## যা আছে

- প্রচ্ছদ: টপ নিউজ, সর্বশেষ/সর্বাধিক পঠিত, ব্রেকিং হাইলাইট ও আন্তর্জাতিক বিভাগ।
- ভিডিও, হালকা সোনালি বিশ্লেষণ–মতামত ব্লক ও মাঝের পাতলা ডিভাইডার।
- মধ্যপ্রাচ্য–প্রতিরক্ষা, বাংলাদেশ, এক্সপ্লেইনার–অর্থনীতি, প্রযুক্তি–এআই, সংস্কৃতি–খেলা এবং বিশেষ প্রতিবেদন।
- আলাদা বিভাগ ও সংবাদ পড়ার পেজ, সার্চ, সর্বশেষ আপডেট ফিল্টার, ভিডিও প্লেয়ার ও মোবাইল মেনু।
- নিজস্ব ছবি ও ফন্ট, Telegram CTA এবং footer।

## ফাইল

| ফাইল | কাজ |
| --- | --- |
| `public/index.html` | HTML entry point |
| `public/app.js` | পেজ rendering, hash routing ও interaction |
| `public/styles.css` | v8 পর্যন্ত ডিজাইনের CSS; আগের override-এর ক্রম বজায় আছে |
| `public/news-data.js` | নমুনা সংবাদ, category, author ও source |
| `public/videos.js` | নমুনা ভিডিও metadata |
| `public/assets/` | ছবি, logo ও font |
| `public/media/` | তিনটি ছবিভিত্তিক demo video |
| `scripts/` | local server, build ও asset checks |

## প্রিভিউ ডেটা ও সীমা

এটি ডিজাইন প্রিভিউ, লাইভ সংবাদ প্রকাশের সিস্টেম নয়। খবর, প্রকাশের সময়, header-এর তারিখ, breaking সময়সীমা ও সর্বাধিক পঠিত তালিকা sample data হিসেবে স্থির রাখা হয়েছে। ভিডিওগুলো ছবিভিত্তিক নমুনা। Admin/CMS, database, authentication, real-time update বা প্রকৃত readership analytics এখনো নেই। ই-পেপার, যোগাযোগ ও কিছু footer link মূল ilhamnews.com-এ যায়।

প্রোডাকশন চালুর আগে সংবাদ API/CMS, live timestamps, analytics এবং server-rendered article URLs/SEO যুক্ত করতে হবে। ছবি, logo ও font আগের client preview থেকে রাখা হয়েছে; এই repository কোনো নতুন license বা তৃতীয় পক্ষের asset ব্যবহারের অধিকার দেয় না।

## ডিজাইন উৎস

Ilham News-এর অষ্টম সংস্করণের source commit: `8ff727e5479781ef7200f70399c43955ab802a6c`। শুধু এই সর্বশেষ সংস্করণকে স্বতন্ত্র root app হিসেবে সাজানো হয়েছে; পুরোনো preview-গুলোর code এখানে মিশিয়ে দেওয়া হয়নি।
