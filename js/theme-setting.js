// author by removef
// https://removeif.github.io/

/*
function isNightFun() {
    var isNightTemp = localStorage.getExpire('night'); //'true';
    //var isNightTemp = 'true';

    // 第一次进来判断是白天还是晚上
    if (isNightTemp == null || isNightTemp == undefined) {
        if (isNightRange("19:00", "23:59") || isNightRange("00:00", "07:00")) {
            isNightTemp = 'true';
            //edited alittlebear 不然开始点第一次夜间模式没反应
            //nightIcon = true
            //applyNight('true');
        } else {
            isNightTemp = 'false';
        }
        localStorage.setExpire("night", isNightTemp, expireTime1H);
    }
    return isNightTemp;
}*/
// 获取初始状态
// author by removef
// https://removeif.github.io/

// author by removef
// https://removeif.github.io/

function isNightFun() {
    var isNightTemp = localStorage.getExpire('night');
    // 强制默认黑夜：如果缓存不存在，则设为 'true'
    if (isNightTemp == null || isNightTemp == undefined) {
        isNightTemp = 'true';
        localStorage.setExpire("night", isNightTemp, expireTime1H);
    }
    return isNightTemp;
}

var isNight = isNightFun();
var nightNav;
var nightIcon;

/**
 * 核心渲染函数
 */
function applyNight(value) {
    if (value === 'true') {
        // 1. 背景变黑 (立即对 body 生效)
        document.body.classList.add('night');
        document.body.classList.remove('light');
        // 2. 图标变灯泡 (暗示：点击可以点亮)
        if (nightIcon) {
            nightIcon.classList.remove('fa-moon');
            nightIcon.classList.add('fa-lightbulb');
        }
        // 3. 显示背景切换按钮
        var bgBtn = document.getElementById('bg-switch-nav');
        if (bgBtn) bgBtn.style.display = '';
        // 4. 重新启动背景动画
        if (window._bgSwitcher) window._bgSwitcher.startAnimation();
        // 5. 隐藏白天主题切换按钮
        var ltBtn = document.getElementById('light-theme-nav');
        if (ltBtn) ltBtn.style.display = 'none';
        var ltPopup = document.getElementById('light-theme-popup');
        if (ltPopup) ltPopup.style.display = 'none';
        // 6. 移除白天主题classes
        if (window._lightTheme) window._lightTheme.remove();
    } else {
        // 1. 背景变白
        document.body.classList.remove('night');
        document.body.classList.add('light');
        // 2. 图标变月亮 (暗示：点击进入黑夜)
        if (nightIcon) {
            nightIcon.classList.remove('fa-lightbulb');
            nightIcon.classList.add('fa-moon');
        }
        // 3. 隐藏背景切换按钮和弹窗
        var bgBtn = document.getElementById('bg-switch-nav');
        if (bgBtn) bgBtn.style.display = 'none';
        var bgPopup = document.getElementById('bg-switcher-popup');
        if (bgPopup) bgPopup.style.display = 'none';
        // 4. 显示白天主题切换按钮
        var ltBtn = document.getElementById('light-theme-nav');
        if (ltBtn) ltBtn.style.display = '';
        // 5. 应用白天主题
        if (window._lightTheme) window._lightTheme.apply();
    }
}

function findNightIcon() {
    nightNav = document.getElementById('night-nav');
    nightIcon = document.getElementById('night-icon');
    
    if (!nightNav || !nightIcon) {
        // 如果 DOM 还没加载完，100ms 后重试
        setTimeout(findNightIcon, 100);
    } else {
        // --- 核心修复点 ---
        // 1. 绑定点击事件
        nightNav.addEventListener('click', switchNight);
        // 2. 强制刷新：一旦找到图标元素，无论如何根据当前 isNight 状态重绘一次图标
        // 这样可以解决无痕模式第一次加载时 nightIcon 为空导致 applyNight 跳过图标处理的问题
        applyNight(isNight); 
    }
}

function switchNight() {
    // 切换状态逻辑
    if (isNight === 'false') {
        isNight = 'true';
    } else {
        isNight = 'false';
    }
    
    // 执行渲染
    applyNight(isNight);
    
    // 持久化到缓存
    localStorage.setExpire('night', isNight, expireTime1H);
    
    // 如果有评论系统组件则重载
    if(typeof loadUtterances == 'function'){
        loadUtterances();
    }
}

/**
 * 立即执行区
 */
// 1. 脚本一加载立刻把背景变黑，防止白屏闪烁
applyNight(isNight);

// 2. 只有当 DOM 解析到图标元素后，才能成功修改图标 Class
// findNightIcon 会在找到元素后自动调用一次 applyNight 来修正图标
findNightIcon();