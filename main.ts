// 小家账本 · 参赛程序（Node 22，标准库 only）
// 把本站的静态文件 app/ 与实拍截图 screenshots/ 复制到输出目录，
// 再用 vendor/makefun-frontend.ts 里的 buildDossier 写出 /output/dossier.json，
// 也就是评委读到的那份材料：截图、首屏加载文件与字节、全部源码。
// 在评分沙箱外，MAKEFUN_OUTPUT_DIR 代替 /output：
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// 与评分器的上限保持一致：截图最多 4 张、单张不超 256 KiB；
// app/ 最多 993 个文件/目录、总共不超 16 MiB；dossier 正文不超 160 KiB。
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
