(function() {
  /**
   * Icarus 夜间模式 - 早期初始化 by iMaeGoo
   * https://www.imaegoo.com/
   *
   * 这个脚本只负责在页面加载时立即应用夜间模式的 body class，
   * 防止白屏闪烁。所有交互逻辑（点击切换、图标更新）由 theme-setting.js 统一管理。
   */
  var raw = localStorage.getItem('night');
  var isNight = false;

  if (raw) {
      try {
          var parsed = JSON.parse(raw);
          // setExpire 格式: { data: 'true'/'false', time: ..., expire: ... }
          if (parsed && typeof parsed === 'object' && parsed.data !== undefined) {
              isNight = parsed.data === 'true';
          } else {
              // 纯布尔值或字符串 'true'/'false'
              isNight = parsed === true || parsed === 'true';
          }
      } catch (e) {
          // 纯字符串 'true'/'false'（非 JSON）
          isNight = raw === 'true';
      }
  } else {
      // 默认黑夜模式
      isNight = true;
  }

  if (isNight) {
      document.body.classList.add('night');
      // Also apply saved night color theme early to prevent color flash
      try {
          var nightColorTheme = localStorage.getItem('nightColorTheme');
          if (nightColorTheme && nightColorTheme !== 'default') {
              document.body.classList.add('night-' + nightColorTheme);
          }
      } catch (e) { /* ignore */ }
  }
}());
