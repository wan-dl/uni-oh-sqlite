# AGENTS_cn.md - 开发者与 AI 知识库

本文档为 AI 智能体和开发者提供的指南。它记录了项目的架构模式、已解决的问题，以及 uni-app x 和 UTS 特有的平台约束。

## 1. 项目概述

这是一个基于 **uni-app x (UTS)** 的 跨平台应用（支持Android、iOS)，通过 UTS 模块展示原生能力.

## 2. 技术栈与约束
- **语言**: UTS (Uni TypeScript) - 在 Android 上转译为 Kotlin。
- **样式**: UVUE CSS (一个专用的高性能 CSS 子集)。
- **运行时要求**: 测试 MLKit 和 CameraX 等原生模块时，**必须使用自定义调试基座**。

## 3. 开发工作流

### 3.1 标准修改工作流
修改任何 `.uts` 或 `.uvue` 文件后，**始终**遵循此验证循环:
1. **获取构建日志**以检查编译错误
2. **分析错误**
3. **修复问题**并等待重新编译
4. **重复**直到编译成功

### 3.2 构建验证命令
```bash
# Android 平台
npm run logcat:app-android

# iOS 平台
npm run logcat:app-ios

# 如果没有日志出现，获取最后的构建输出
npm run logcat:app-android -- --mode lastBuild
npm run logcat:app-ios -- --mode lastBuild
```

## 4. AI 智能体命令与工作流

### 4.1
**目标**: 解决所有构建错误，直到项目编译成功。

**工作流**:
1. **获取日志**，使用适当的命令:
   - Android: `npm run logcat:app-android`
   - iOS: `npm run logcat:app-ios`
2. **分析错误**，与第 3 节(已解决的陷阱与编码规范)交叉参考
3. **应用修复**到相关的 `.uts` 或 `.uvue` 文件
4. **等待** HBuilderX 重新编译(保存文件时自动)
5. **重新获取日志**并重复，直到没有错误

**后备方案**: 如果日志为空或过时，在命令后附加 `-- --mode lastBuild` 以检索最近的构建输出。

## 5. 已解决的问题与最佳实践 (Resolved Issues & Best Practices)

### 5.1 CSS 样式约束 (Android)
- **font-weight**: Android 平台仅支持 `normal` (400) 和 `bold` (700)。不支持 `800`, `900` 等数值，会导致编译错误。
  - *错误示例*: `font-weight: 900;`
  - *正确示例*: `font-weight: 700;` 或 `font-weight: bold;`

### 5.2 UTS 语法与类型安全
- **闭包中的变量类型转换**: 在 `setTimeout` 或其他闭包中访问外部可变变量 (`var`) 时，智能类型推断 (Smart Cast) 可能失效。
  - *场景*: `clearTimeout(timer)` 其中 `timer` 是可空的 `number | null`。
  - *修复*: 显式类型转换 `clearTimeout(timer as number)`。
- **数值比较**: 避免对数值类型使用 `===` (Identity Equality)，尤其是在与字面量比较时。
  - *警告*: `Identity equality for arguments of types 'Number' and 'Int' can be unstable`
  - *修复*: 使用 `==` 进行数值比较 (e.g., `list.length == 0`)。

### 5.3 滚动视图 (Scroll-View) 策略
- **避免嵌套滚动**: 不要在 `scroll-view` 内部嵌套另一个 `scroll-view` (同方向)。这会导致滚动冲突，特别是在 Android 上。
- **全页滚动 vs 局部滚动**:
  - 如果需要整个页面滚动（Header 随列表滚动），使用外层 `scroll-view` 包裹所有内容，并将内部列表设为普通 `view`。
  - 如果需要固定 Header，列表独立滚动，确保列表容器有确定的高度 (e.g., `flex: 1` 配合父容器 `height: 100%`)。

### 5.4 UTS 引用原生代码规范

#### Android (Kotlin)
- **需要显式 import**: 在 `app-android` 目录下的 `.uts` 文件中引用 Kotlin 代码，**需要** import 语句。
  - *示例*: `import SqliteHelper from "./SqliteHelper.kt"`

#### iOS (Swift)
- **不需要 import**: 在 `app-ios` 目录下的 `.uts` 文件中引用 Swift 代码，**不需要** import 语句。Swift 类可以直接使用。
  - *错误示例*: `import SqliteHelper from "./SqliteHelper.swift"` (不需要)
  - *正确示例*: 直接使用 `OhSqliteHelper.openDb(name)`

### 5.5 iOS UTS 调用 Swift 原生代码的关键经验

#### 5.5.1 Swift 类定义规范
Swift 类必须使用 `@objc` 和 `@objcMembers` 修饰，以便 UTS 能够调用：
```swift
@objc(OhSqliteHelper)
@objcMembers
public class OhSqliteHelper: NSObject {
    @objc public static func openDb(_ name: String) -> Bool {
        // ...
    }
}
```

#### 5.5.2 参数类型限制（重要！）
- **禁止使用联合类型数组**: UTS 在 iOS 上不支持 `(string | number | null)[]` 这种联合类型数组作为函数参数，会导致运行时 `method call failed` 错误。
  - *错误示例*: `function executeSql(args: (string | number | null)[])`
  - *正确示例*: `function executeSql(args: any[])`

- **复杂数据使用 JSON 字符串传递**: 避免在 UTS 和 Swift 之间传递复杂类型（数组、字典），改用 JSON 字符串：
  ```uts
  // UTS 端
  const argsJson = JSON.stringify(args) ?? "[]"
  const result = OhSqliteHelper.execSql(name, sql, argsJson)
  ```
  ```swift
  // Swift 端
  @objc public static func execSql(_ name: String, _ sql: String, _ argsJson: String) -> String {
      let args = parseArgs(argsJson)  // 解析 JSON
      // ... 执行操作
      return "{\"success\":true}"  // 返回 JSON 字符串
  }
  ```

#### 5.5.3 可选类型解包
`JSON.stringify()` 在 iOS UTS 上返回 `String?` 可选类型，必须解包：
- *错误*: `const json = JSON.stringify(args)` → 编译错误 `optional type 'String?' must be unwrapped`
- *正确*: `const json = JSON.stringify(args) ?? "[]"`

#### 5.5.4 不支持的语法
- **Swift 命名参数语法**: UTS 不支持 Swift 风格的命名参数调用
  - *错误*: `fileManager.urls(for: .documentDirectory, in: .userDomainMask)`
  - *解决*: 在 Swift helper 中封装，UTS 只调用简单方法

- **declare class 声明**: UTS 不支持 TypeScript 的 `declare class` 语法声明原生类

#### 5.5.5 完整示例架构

**Swift Helper (SqliteHelper.swift)**:
```swift
@objc(OhSqliteHelper)
@objcMembers
public class OhSqliteHelper: NSObject {
    // 简单类型参数，返回 JSON 字符串
    @objc public static func execSql(_ name: String, _ sql: String, _ argsJson: String) -> String {
        // 实现逻辑，返回 JSON
        return "{\"success\":true,\"rowsAffected\":1}"
    }
}
```

**UTS 调用 (index.uts)**:
```uts
export function executeSql(name: string, sql: string, args: any[]): UTSJSONObject {
    try {
        const argsJson = JSON.stringify(args) ?? "[]"
        const jsonStr = OhSqliteHelper.execSql(name, sql, argsJson)
        return JSON.parse(jsonStr) as UTSJSONObject
    } catch (e) {
        return { success: false, error: (e as Error).message ?? "Unknown error" }
    }
}
```

## UTS插件开发参考文档

- [UTS插件介绍](https://doc.dcloud.net.cn/uni-app-x/plugin/uts-plugin.html)
- [Android平台开发文档](https://doc.dcloud.net.cn/uni-app-x/plugin/uts-for-android.html)
- [iOS平台开发文档](https://doc.dcloud.net.cn/uni-app-x/plugin/uts-for-ios.html)