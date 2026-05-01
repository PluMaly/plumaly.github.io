## 快速开始

1. 编辑 `data/profile.json` — 修改姓名、学校、研究方向等个人信息
2. 编辑 `data/publications.json` — 添加或修改论文
3. 编辑 `data/cv.json` — 更新简历内容
4. 将个人照片放到 `assets/img/profile.jpg`（推荐 3:4 比例）
5. 将简历 PDF 放到 `files/cv.pdf`
6. 推送到 GitHub — 自动部署到 `plumaly.github.io`

> **不需要懂 HTML！** 所有内容都通过 `data/` 目录下的 JSON 文件管理，只需编辑纯文本字段即可更新网站。

## 文件结构

```
├── index.html                 ← 主页面（单页滚动）
├── 404.html
├── data/                      ← 网站内容（只需编辑这里的文件！）
│   ├── profile.json           ← 姓名、头衔、研究方向、简介、社交链接
│   ├── publications.json      ← 论文列表
│   └── cv.json                ← 教育经历、研究经历、奖项、技能
├── assets/
│   ├── css/
│   │   ├── base.css           ← 重置、颜色变量、排版
│   │   ├── layout.css         ← 页面布局、导航、各区块
│   │   ├── components.css     ← 按钮、标签、手风琴等组件
│   │   └── blog.css           ← 博客列表和文章页样式
│   ├── js/
│   │   ├── theme.js           ← 深色/浅色模式切换
│   │   ├── scroll.js          ← 平滑滚动、导航高亮、回到顶部
│   │   ├── filter.js          ← 论文分类筛选
│   │   ├── blog.js            ← Markdown 解析器和博客渲染
│   │   └── content.js         ← 读取 JSON 数据并在首页渲染内容
│   └── img/
│       └── profile.jpg        ← 你的个人照片（3:4 比例）
├── blog/
│   ├── index.html             ← 博客列表页
│   ├── post.html              ← 博客文章详情页
│   ├── posts.json             ← 博客文章清单（添加新文章请编辑此文件）
│   └── posts/                 ← 博客 Markdown 文件存放处
│       ├── 2026-05-01-large-scale-lp.md
│       ├── 2026-04-20-primal-dual-ipm.md
│       └── 2026-03-15-getting-started-julia.md
├── images/
│   └── publications/          ← 论文缩略图
│       ├── 1.svg
│       ├── 2.svg
│       └── 3.svg
├── files/
│   └── cv.pdf                 ← 你的简历 PDF
└── README.md
```

## 如何修改网站内容

### 修改个人信息

编辑 `data/profile.json`：

```json
{
  "name": "你的名字",
  "title": "你的头衔",
  "affiliation": {
    "name": "学校/机构名称",
    "url": "https://学校网址"
  },
  "email": "你的邮箱",
  "researchInterests": [
    "研究方向 1",
    "研究方向 2"
  ],
  "bio": [
    "第一段个人简介（可以使用 <strong>加粗</strong> HTML 标签）",
    "第二段个人简介"
  ],
  "socialLinks": [
    { "platform": "GitHub", "url": "https://github.com/你的用户名", "icon": "github" },
    { "platform": "Google Scholar", "url": "你的 Google Scholar 链接", "icon": "scholar" },
    { "platform": "LinkedIn", "url": "你的 LinkedIn 链接", "icon": "linkedin" }
  ]
}
```

### 修改个人照片

替换 `assets/img/profile.jpg` 为你自己的照片。推荐 3:4 比例（宽:高），至少 440×586 像素。如果照片不存在，CSS 会自动显示首字母 "YY" 作为备选。

### 添加/编辑论文

编辑 `data/publications.json`，每篇论文格式如下：

```json
{
  "category": "journal",
  "title": "论文标题",
  "authors": [
    { "name": "你的名字", "self": true },
    { "name": "合作者名字", "self": false }
  ],
  "venue": "期刊名, vol. 42, pp. 123–145, 2026",
  "thumbnail": "images/publications/1.svg",
  "links": [
    { "label": "PDF", "url": "https://..." },
    { "label": "DOI", "url": "https://..." },
    { "label": "Code", "url": "https://..." }
  ],
  "abstract": "论文摘要……"
}
```

- `"category"` 设为 `"journal"`、`"conference"` 或 `"working"`
- `"self": true` 的那位作者名字会高亮显示
- `"links"` 可以任意增减（PDF / DOI / arXiv / Code 等）
- 将缩略图放到 `images/publications/` 目录

### 修改简历内容

编辑 `data/cv.json`：

```json
{
  "cvPdfUrl": "files/cv.pdf",
  "education": [
    {
      "degree": "Ph.D. in Operations Research",
      "date": "2024 – Present",
      "institution": "大学名称，院系",
      "details": [
        "研究方向：大规模优化、内点法",
        "导师：Prof. XXX"
      ]
    }
  ],
  "researchExperience": [
    {
      "role": "Research Assistant",
      "date": "2024 – Present",
      "institution": "实验室名称，大学",
      "details": [
        "工作内容 1",
        "工作内容 2"
      ]
    }
  ],
  "awards": [
    { "title": "奖项名称", "date": "2024" }
  ],
  "skills": [
    { "label": "Programming", "value": "Python, Julia, C/C++, MATLAB" },
    { "label": "Languages", "value": "Chinese (native), English (fluent)" }
  ]
}
```

要替换简历 PDF，将你的 PDF 文件放到 `files/cv.pdf`。

### 添加博客文章

1. 用 Markdown 写好文章，保存到 `blog/posts/YYYY-MM-DD-简短标题.md`
2. 编辑 `blog/posts.json`，添加一条记录：

```json
{
  "file": "2026-06-01-我的新文章.md",
  "title": "我的新文章标题",
  "date": "2026-06-01",
  "summary": "一句话描述这篇文章的内容。"
}
```

首页的博客区块和 `/blog/` 页面都会自动显示新文章。点击文章会跳转到详情页，自动将 Markdown 转换为带样式的 HTML。

### 支持的 Markdown 语法

`.md` 文件支持以下语法：

- `# 一级标题` 到 `###### 六级标题`
- `**加粗**` 和 `*斜体*`
- `[链接](url)` 和 `![图片](url)`
- `- 无序列表` 和 `1. 有序列表`
- `` `行内代码` `` 和 ` ``` ` 围栏代码块
- `> 引用`
- `---` 分隔线
- `$行内公式$` 和 `$$独立公式$$`（LaTeX 公式，由 KaTeX 渲染）

### 修改主题颜色

编辑 `assets/css/base.css`，找到 `:root { ... }` 块：

```css
--color-accent: #8b1a2b;       /* 酒红色 — 修改此处更换强调色 */
--color-navy: #1e3a5f;         /* 深蓝色 — 区块标题下划线 */
--color-bg: #fdfcfb;           /* 页面背景色 */
--color-surface: #ffffff;      /* 卡片背景色 */
```

深色模式的颜色在下面的 `[data-theme="dark"]` 块中修改。

### 修改字体

编辑 `assets/css/base.css`，找到顶部的 `@import` 语句。将 `Crimson+Pro`（标题字体）和 `Inter`（正文字体）替换为任何 Google Font。然后修改：

```css
--font-heading: "你的字体", Georgia, serif;
--font-body: "你的字体", -apple-system, sans-serif;
```

## 部署

直接推送到 GitHub 仓库的 `main` 分支，GitHub Pages 会自动从 `main` 分支部署。不需要任何构建步骤。

本地预览：
```bash
python3 -m http.server 8080    # 或其他任意静态文件服务器
# 浏览器打开 http://localhost:8080
```

## 技术说明

- **零框架**：完全不依赖任何 JavaScript 或 CSS 第三方库
- **深色模式**：偏好保存到 localStorage，自动跟随系统设置
- **移动端适配**：768px 断点响应式，汉堡菜单
- **BEM 命名**：所有 CSS 类名遵循 Block__Element--Modifier 规范
- **无障碍**：跳过导航链接、ARIA 标签、语义化 HTML 标签
