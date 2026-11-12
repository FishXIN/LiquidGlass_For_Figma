# LiquidGlass_For_Figma

**Glass, captured.** 开源、可自部署的可编辑矢量玻璃素材生成器。

[在线使用](https://fishxin.github.io/LiquidGlass_For_Figma/) · [连接 Figma](CONNECT_FIGMA.md) · [MIT License](LICENSE)

上传背景 → 移动鼠标定位 → 点击锁定 → 调整玻璃 → 查看实际矢量预览 → 复制或下载 SVG，也可以通过本地插件发送到 Figma。

## v1.1：真正的矢量输出

SVG 不含 `<image>`、Base64、外链图片、脚本或复杂滤镜。输出只使用形状、线性/径向渐变和裁切，玻璃色彩、高光、阴影分别命名，便于在 Figma 中编辑。

上传照片只作为色彩采样参考。素材保留轮廓、高光和当前位置的背景色彩，**主动简化照片细节，不追求逐像素还原**。背景色彩用柔和渐变叠加表达，避免大量像素小方块；简洁模式最多 29 个可见形状，丰富模式最多 45 个（仅玻璃区域）。完整画布模式也将背景简化为矢量色彩。

这是固定的静态矢量素材，不是 Figma 原生 Glass 效果。更换 Figma 背景不会重新采样。界面上方的 Canvas 用于定位和参考，下方「SVG 输出」显示实际导出的矢量效果。PNG 下载单独保留原始 Canvas 像素效果；SVG/插件导入不会偷偷退回图片。

与 v1.0 不同：旧版在 SVG 中包裹 PNG。v1.1 已移除这条导出路径；插件由 `createImage` 改为 `createNodeFromSvg`。升级用户需重新下载插件包、重启桥接服务和插件。

## 功能

- PNG / JPG / WEBP 上传与拖放；内置程序生成背景。
- 1200 × 800 参考画布，背景居中 cover 裁切；鼠标跟随、单击锁定、方向键微调（Shift 加速）。
- 通透、柔雾、厚边预设；圆角、磨砂、折射、透光层和光照调节。
- 实际 SVG 预览、代码、图形数量与体积自动更新。
- 简洁 / 丰富两档矢量色彩表达，玻璃区域 / 完整画布两种范围。
- SVG 复制和下载；PNG 另行下载（1× 原始像素 / 2× 插值放大）。
- 本地桥接服务 + Figma 开发插件，收到真实插件确认后才提示成功。
- 原生 JavaScript / Canvas 2D，零 npm 依赖，不需要 API Key。

## 本地运行

需要 Node.js 20+，无需安装依赖：

```sh
npm run dev
# http://127.0.0.1:5173
npm test
npm run build
```

构建使用系统 `zip` 命令打包插件。macOS/Linux 通常已提供；Windows 可使用 WSL，或安装 zip。应用源码也可以直接放在静态服务器运行。

## 自部署 / GitHub Pages

`npm run build` 产物在 `dist/`，可上传到任意静态服务器。所有资源使用相对路径，支持 GitHub Pages 子路径。

```sh
npm run deploy
# 测试 → 构建 → 推送 dist 到 gh-pages
# 首次在 GitHub Settings → Pages 选择 gh-pages / (root)
```

CI 在 main / PR 上执行测试与构建。自部署后修改网站 GitHub 链接及在线地址；自定义域名下本地连接的 origin 配置见连接文档。

## 隐私与权限

图片在浏览器内存中处理，不上传服务器，无分析统计或云端素材存储。可选连接服务只监听 loopback，校验随机配对码和来源，任务最多保留五分钟。插件只允许连接本机服务，接收 SVG 后创建可编辑图层。

## 实现与边界

Canvas 参考渲染采用圆角距离场、边缘位移采样、磨砂和定向高光；纯矢量导出独立采样颜色并构建渐变。独立实现，没有复制第三方组件源码，不声称是 Apple 原生材质算法。当前不支持原图尺寸画布、多玻璃图层和照片细节的无损矢量化。

参考：[Apple Liquid Glass](https://developer.apple.com/documentation/technologyoverviews/liquid-glass)、[Apple Materials](https://developer.apple.com/design/human-interface-guidelines/materials)、[xiaojiaenen/liquid-glass](https://github.com/xiaojiaenen/liquid-glass)、[Figma Plugin API](https://developers.figma.com/docs/plugins/)。商标归原权利人所有，本项目无官方关联。

## 贡献

欢迎提交带复现步骤的 Issues / Pull Requests。提交前运行 `npm test` 与 `npm run build`。不要提交用户图片、配对码或设计文件。
