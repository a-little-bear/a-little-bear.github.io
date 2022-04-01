// author by removef
// https://removeif.github.io/

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
}

var isNight=isNightFun();
// 参考自 https://www.imaegoo.com/
var nightNav;
var nightIcon;

function applyNight(value) {
    if (value == 'true') {
        //document.body.classList.remove('light');
        //document.body.classList.add('night');
        document.body.className += ' night'
        if (nightIcon) {
            nightIcon.className = nightIcon.className.replace(/ fa-moon/g, '').replace(/ fa-lightbulb/g, '') + ' fa-lightbulb'
        }
    } else {
        //document.body.classList.remove('night');
        //document.body.classList.add('light');
        document.body.className = document.body.className.replace(/ night/g, '')
        if (nightIcon) {
            nightIcon.className = nightIcon.className.replace(/ fa-lightbulb/g, '').replace(/ fa-moon/g, '') + ' fa-moon'
        }
    }
}

function findNightIcon() {
    nightNav = document.getElementById('night-nav');
    nightIcon = document.getElementById('night-icon');
    if (!nightNav || !nightIcon) {
        setTimeout(findNightIcon, 100);
    } else {
        nightNav.addEventListener('click', switchNight);
        //edited alittlebear 加了一个感叹号
        if (!isNight) {
            nightIcon.className = nightIcon.className.replace(/ fa-moon/g, '').replace(/ fa-lightbulb/g, '') + ' fa-lightbulb'
        } else {
            nightIcon.className = nightIcon.className.replace(/ fa-lightbulb/g, '').replace(/ fa-moon/g, '') + ' fa-moon'
        }
    }
}

function switchNight() {

    if (isNight == 'false') {
        isNight = 'true';
    } else {
        isNight = 'false';
    }
    
    applyNight(isNight);
    localStorage.setExpire('night', isNight, expireTime1H);
    if(typeof loadUtterances == 'function'){
        loadUtterances();
    }
}

findNightIcon();
applyNight(isNight);