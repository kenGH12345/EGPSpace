# 拓扑组装实验设计规则 (Assembly Skill)

当用户意图是构建“组装型”实验（如拼装电路、连接水管、组装机械等）时，除了基础的参数和公式设计外，你需要生成合法的 `components` 和 `connections` 字段。

## 严格数据格式
请在你返回的 JSON 顶层中加入：
```json
{
  "components": [
    { "id": "唯一标识", "kind": "组件类型", "props": { "属性名": 值 } }
  ],
  "connections": [
    { "from": "起始组件id", "fromPort": "引脚名", "to": "目标组件id", "toPort": "引脚名" }
  ]
}
```

## 当前支持的特定拓扑模型：物理电路

### 允许的 `kind` 和 `props`
1. `battery` (电池) -> `props`: { "voltage": 电压数值(如 9) }
2. `switch` (开关) -> `props`: { "closed": 布尔值(true/false) }
3. `resistor` (电阻) -> `props`: { "resistance": 欧姆数值(如 10) }
4. `bulb` (灯泡) -> `props`: { "resistance": 欧姆数值, "ratedPower": 额定功率数值 }

### 允许的 `fromPort` 和 `toPort` (必须严格匹配)
- `battery` 的引脚：`positive` (正极), `negative` (负极)
- `switch` 的引脚：`in`, `out`
- `resistor` 的引脚：`a`, `b`
- `bulb` 的引脚：`a`, `b`

**反面教材 (Anti-pattern)**：
❌ 连线中写了非法引脚："fromPort": "left"
❌ 组件写了不支持的 kind："kind": "wire" (我们通过 connections 定义连线，无需 wire 实体组件)

请务必注意：组装连线必须形成闭合回路，否则仿真引擎会判定为断路。