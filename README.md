# LiquidGlass_For_Figma

**Glass, captured.** 开源、可自部署的静态玻璃素材生成器。

[在线使用](https://fishxin.github.io/LiquidGlass_For_Figma/) · [连接 Figma](CONNECT_FIGMA.md) · [MIT License](LICENSE)

上传背景 → 移动鼠标定位玻璃 → 点击锁定 → 调整磨砂、折射与高光 → 复制或下载静态 SVG / PNG，也可以通过本地插件一键发送到 Figma。

## 功能

- PNG / JPG / WEBP 背景上传与拖放；内置程序生成背景，无外链素材。
- 1200 × 800 画布，背景居中 cover 裁切；鼠标跟随、单击锁定、方向键微调（Shift 加速）。
- 通透、柔雾、厚边预设，圆角、磨砂、折射、厚边宽度、透光层、高光与光照方向调节。
- 当前状态 SVG 代码自动更新；一键复制、下载 SVG / PNG。
- 仅玻璃区域（含其采样背景与透明外围阴影）或完整画布导出。
- 1× 原始像素 / 2× 插值放大输出。
- 开源本地桥接服务 + Figma 开发插件，接收成功确认；无云端素材中转。
- 原生 JavaScript / Canvas 2D，零 npm 依赖，不需要 API Key。

## 输出到底是什么？

导出 SVG 使用 `<image>` 内嵌渲染后的 PNG。磨砂、边缘折射、高光和采样背景全部固定在图片中，无外部资源、SVG 滤镜或 JavaScript。这是为静态视觉一致性设计的 SVG 容器，**不是纯矢量，也不是 Figma 原生 Glass**。改变 Figma 中的背景不会改变素材内部背景。若某个客户端粘贴 SVG 未保留图片，请使用 PNG 或配套插件。

2× 是插值放大，不增加真实纹理细节。上传背景统一适配到 1200 × 800；当前版本不支持原图分辨率画布和多玻璃图层。

## 本地运行

需要 Node.js 20+，不需要安装依赖：

```sh
npm run dev
# http://127.0.0.1:5173
npm test
npm run build
```

构建使用系统 `zip` 命令打包插件。macOS/Linux 通常已提供；Windows 可用 WSL，或安装 zip 后构建。应用源码本身可由任意静态服务器运行。

## 自部署 / GitHub Pages

`npm run build` 产物在 `dist/`，可以上传到任意静态服务器。所有应用资源使用相对路径，支持 GitHub Pages 子路径。

本仓库将构建产物发布到 `gh-pages` 分支，Pages 设置选择 `gh-pages / (root)`。CI 在 main / PR 上执行测试和构建；它不修改线上部署。

```sh
npm test
npm run build
npm run deploy
# 首次在 GitHub Settings → Pages 选择 gh-pages / (root)
```

首次自部署后，请修改网站 GitHub 链接及 README 在线地址。自定义域名下桥接服务的 origin 配置见连接文档。

## 隐私与权限

图片在浏览器内存中处理，不上传服务器，不记录分析数据，不保存浏览器历史素材。可选桥接服务只绑定 loopback、验证随机配对码与来源，任务最长保留五分钟。页面在线资源来自部署主机；连接 Figma 时仅将选中的静态导出发送到本机插件。

## 实现与边界

独立实现的 Canvas 2D 近似渲染：圆角距离场 + 边缘位移采样 + 磨砂 + 定向高光。没有复制原组件库代码，不声称是 Apple 的物理材质实现。

设计研究参考：
- [Apple Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)
- [Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [xiaojiaenen/liquid-glass](https://github.com/xiaojiaenen/liquid-glass)：需求调研与网页效果参考。
- [Figma Plugin API](https://developers.figma.com/docs/plugins/)

Apple、Figma 商标归其所有者。本项目为独立开源工具，无官方关联。

## 贡献

欢迎通过 Issues 报告带复现步骤的问题，通过 Pull Request 提交改进。提交前运行 `npm test` 和 `npm run build`。请勿提交用户背景图、配对码或设计文件。性能、原图分辨率输出、原生矢量高光图层是适合后续贡献的方向。
