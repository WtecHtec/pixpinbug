# 解决
1. 截图网页图片快速上传
2. 可操作浏览器自动化，并将截图图片上传指定区域。
# 使用
1. 点击图标，选区截图，支持截图、也可以AC 自动化。
2. 如果使用AC自动化，先去设置页面配置对应的操作
3. [快捷键](chrome://extensions/shortcuts)可以自定义。

# AC自动化
1. 目前支持飞书项目。这个选项是为了方便，因为飞书的项目，是可以直接截图的。直接粘贴到飞书项目缺陷新建的网页链接即可。
2. 如果是自动化，可以使用[插件](https://chromewebstore.google.com/detail/replaytact-form-automatio/ohkipcncfnmjoeneihmglaadloddopkg?authuser=0&hl=zh-CN) 编排流程，并将流程复制到设置页面。



# 核心流程
1. 截图将图片复制，此时你可以直接粘贴下来。
2. 核心流程是将图片粘贴到指定的区域。因此在编排流程时，需要最后一个操作是：点击DOM即可。