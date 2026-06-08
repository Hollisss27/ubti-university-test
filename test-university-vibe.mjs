import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const galleryHtml = readFileSync(new URL("./大学气质人物形象总览.html", import.meta.url), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)?.[1] ?? "";
const questionBlock = script.match(/const questions = \[([\s\S]*?)\n      \];\n\n      const results/)?.[1] ?? "";
const questionCount = [...questionBlock.matchAll(/\n        \{\n          text:/g)].length;
const optionCounts = questionBlock
  .split(/\n        \{\n          text:/)
  .slice(1)
  .map(block => [...block.matchAll(/\{ text: "/g)].length);

assert(html.includes('id="questionsList"'), "quiz should render all questions on one page");
assert(html.includes('id="submitQuiz" disabled'), "submit button should start disabled");
assert(html.includes('id="findMissingBtn"'), "quiz should keep a quick missing-answer locator");
assert(html.includes("<title>别估分了，先测测你的 UBTI。</title>"), "browser title should be restored to the UBTI version");
assert(html.includes("<h1>别估分了，先测测你的 UBTI。</h1>"), "home hero should be restored to the UBTI version");
assert(html.includes('<p class="disclaimer">看看你适合上什么大学</p>'), "home subtitle should be restored");
assert(html.includes('<div id="progressCount" class="progress-count">0 / 22</div>'), "initial progress should match the 22-question bank");
assert(questionCount === 22, "question bank should match the approved 22-question bank");
assert(optionCounts.length === 22, "parser should read all 22 question option counts");
assert(optionCounts.every(count => count === 4), "every question should keep four answer options");
assert(script.includes("shuffledOptions"), "quiz should still shuffle options");
assert(script.includes("calculateScores"), "quiz should still score from hidden per-option weights");
assert(script.includes("normalizeScores"), "result matching should normalize the new meme-heavy question bank");
assert(script.includes("rankedResults.slice(0, 18)"), "result matching should keep a balanced candidate pool");
assert(script.includes("findMissingAnswer"), "quiz should still support locating skipped questions");

[
  "高考结束，灵魂刚从考场飘出来，你第一反应是？",
  "如果把你丢进一个大学新生群，你最可能？",
  "大学里最容易让你破防的是？",
  "如果录取通知书会说一句话，你希望它说？"
].forEach(text => assert(script.includes(text), `approved question bank should include: ${text}`));

[
  ["THU", "卷麻了", "TODO!"],
  ["PKU", "想太多", "WHY?"],
  ["FDU", "锐评人", "HOTTAKE"],
  ["ZJU", "全都要", "ALL-IN"],
  ["SCU", "饭搭子", "EAT-IT"],
  ["FIN", "搞钱人", "CASH!"],
  ["DATA", "样本量呢", "N=?"],
  ["PSY", "你还好吗", "RUOK?"]
].forEach(([code, cn, en]) => {
  assert(script.includes(`${code}: ["${cn}", "${en}"`), `result copy should be restored for ${code}`);
});

assert(script.includes("你的大学气质是："), "result card should be restored to university vibe wording");
assert(script.includes("高考结束了，来测测你适合上什么大学？"), "share poster should be restored to the previous hook");
assert(script.includes("renderSharePage(currentResult);\n        result.classList.add(\"hidden\");"), "share flow should still enter the share page immediately");
assert(!script.includes('btn.textContent = "海报生成中"'), "result page share button should not wait on poster generation");
const showResultBlock = script.match(/async function showResult\(\) \{([\s\S]*?)\n      \}/)?.[1] ?? "";
assert(!showResultBlock.includes("await ensureAvatarReady"), "result page should render immediately instead of waiting for avatar decode");

assert(html.includes("保存到相册"), "share page should keep the save-to-album action");
assert(html.includes("复制测试链接"), "share page should keep the copy-link action");
assert(script.includes('subtitle.textContent = "长按下方图片，选择“保存图片”'), "mobile save preview should keep clear long-press guidance");
assert(html.includes('托管：<a href="https://www.cloudflare.com/" target="_blank" rel="noopener">Cloudflare</a>（免费）'), "home credits should keep Cloudflare");
assert(html.includes('网站搭建：<a href="https://www.gm.cn/" target="_blank" rel="noopener">GMSSH</a>（免费）'), "home credits should keep GMSSH");
assert(galleryHtml.includes("大学气质人物形象总览"), "gallery file should be restored to the previous naming");

console.log("university vibe restored checks passed");
