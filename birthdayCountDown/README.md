# 生日倒计时（生理期计算）

## 说明

- 图标：https://raw.githubusercontent.com/Orz-3/mini/master/birthday.png

## 常见问题

- `Surge`配置:

  ```properties
  # 每天00:00:10执行一次
  cron "10 0 0 * * *" script-path=https://raw.githubusercontent.com/dompling/Script/master/birthdayCountDown/index.js
  ```

- `QuanX`配置:

  ```properties
  [task_local]
   # 每天00:01执行一次
  1 0 * * * https://raw.githubusercontent.com/dompling/Script/master/birthdayCountDown/index.js
  ```
