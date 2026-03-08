/**
 * Dark Mode Background Switcher
 * 8 cool night-mode backgrounds for the #universe canvas
 *
 * Backgrounds:
 *   1. stars     - Starfield with comets (original)
 *   2. particles - Particle network with mouse interaction
 *   3. aurora    - Northern lights / Aurora Borealis
 *   4. fireflies - Floating glowing fireflies
 *   5. matrix    - Digital rain (Matrix-style)
 *   6. meteors   - Meteor shower with glowing trails
 *   7. snow      - Gentle snowfall on a dark night
 *   8. nebula    - Colorful nebula clouds with twinkling stars
 */

(function () {
    'use strict';

    var canvas = document.getElementById('universe');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var W, H;
    var animId = null;
    var currentBg = null;
    var mouseX = -9999, mouseY = -9999;

    // ---- Background registry ----
    var backgrounds = {};
    var bgOrder = ['stars', 'particles', 'aurora', 'fireflies', 'matrix', 'meteors', 'snow', 'nebula'];
    var bgNames = {
        stars: '星空',
        particles: '粒子网络',
        aurora: '极光',
        fireflies: '萤火虫',
        matrix: '数字雨',
        meteors: '流星雨',
        snow: '飘雪',
        nebula: '星云'
    };
    var bgIcons = {
        stars: 'fas fa-star',
        particles: 'fas fa-project-diagram',
        aurora: 'fas fa-water',
        fireflies: 'fas fa-bug',
        matrix: 'fas fa-code',
        meteors: 'fas fa-meteor',
        snow: 'fas fa-snowflake',
        nebula: 'fas fa-cloud'
    };

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
    }
    resize();
    window.addEventListener('resize', function () {
        resize();
        if (currentBg && backgrounds[currentBg] && backgrounds[currentBg].resize) {
            backgrounds[currentBg].resize();
        }
    });

    // Track mouse for particle network
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    document.addEventListener('mouseleave', function () {
        mouseX = -9999;
        mouseY = -9999;
    });

    // =========================================================
    //  1. STARS - Original starfield with comets
    // =========================================================
    (function () {
        var starDensity = 0.216;
        var speedCoeff = 0.05;
        var stars = [];
        var first = true;
        var giantColor = '180,184,240';
        var starColor = '226,225,142';
        var cometColor = '226,225,224';

        function getRand(min, max) { return Math.random() * (max - min) + min; }
        function getProb(p) { return Math.floor(Math.random() * 1000) + 1 < p * 10; }

        function Star() {
            this.reset = function () {
                this.giant = getProb(3);
                this.comet = this.giant || first ? false : getProb(10);
                this.x = getRand(0, W - 10);
                this.y = getRand(0, H);
                this.r = getRand(1.1, 2.6);
                this.dx = getRand(speedCoeff, 6 * speedCoeff) + (this.comet + 1 - 1) * speedCoeff * getRand(50, 120) + speedCoeff * 2;
                this.dy = -getRand(speedCoeff, 6 * speedCoeff) - (this.comet + 1 - 1) * speedCoeff * getRand(50, 120);
                this.fadingOut = null;
                this.fadingIn = true;
                this.opacity = 0;
                this.opacityTresh = getRand(0.2, 1 - (this.comet + 1 - 1) * 0.4);
                this.do = getRand(0.0005, 0.002) + (this.comet + 1 - 1) * 0.001;
            };
            this.fadeIn = function () {
                if (this.fadingIn) {
                    this.fadingIn = !(this.opacity > this.opacityTresh);
                    this.opacity += this.do;
                }
            };
            this.fadeOut = function () {
                if (this.fadingOut) {
                    this.fadingOut = !(this.opacity < 0);
                    this.opacity -= this.do / 2;
                    if (this.x > W || this.y < 0) {
                        this.fadingOut = false;
                        this.reset();
                    }
                }
            };
            this.draw = function () {
                ctx.beginPath();
                if (this.giant) {
                    ctx.fillStyle = 'rgba(' + giantColor + ',' + this.opacity + ')';
                    ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
                } else if (this.comet) {
                    ctx.fillStyle = 'rgba(' + cometColor + ',' + this.opacity + ')';
                    ctx.arc(this.x, this.y, 1.5, 0, 2 * Math.PI, false);
                    for (var i = 0; i < 30; i++) {
                        ctx.fillStyle = 'rgba(' + cometColor + ',' + (this.opacity - (this.opacity / 20) * i) + ')';
                        ctx.rect(this.x - this.dx / 4 * i, this.y - this.dy / 4 * i - 2, 2, 2);
                        ctx.fill();
                    }
                } else {
                    ctx.fillStyle = 'rgba(' + starColor + ',' + this.opacity + ')';
                    ctx.rect(this.x, this.y, this.r, this.r);
                }
                ctx.closePath();
                ctx.fill();
            };
            this.move = function () {
                this.x += this.dx;
                this.y += this.dy;
                if (this.fadingOut === false) this.reset();
                if (this.x > W - (W / 4) || this.y < 0) this.fadingOut = true;
            };
        }

        backgrounds.stars = {
            init: function () {
                first = true;
                stars = [];
                var count = W * starDensity;
                for (var i = 0; i < count; i++) {
                    stars[i] = new Star();
                    stars[i].reset();
                }
                setTimeout(function () { first = false; }, 50);
            },
            draw: function () {
                ctx.clearRect(0, 0, W, H);
                for (var i = 0; i < stars.length; i++) {
                    stars[i].move();
                    stars[i].fadeIn();
                    stars[i].fadeOut();
                    stars[i].draw();
                }
            },
            resize: function () {
                this.init();
            }
        };
    })();

    // =========================================================
    //  2. PARTICLES - Connected particle network with mouse
    // =========================================================
    (function () {
        var particles = [];
        var maxDist = 120;
        var mouseDist = 180;
        var count;

        function Particle() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.r = Math.random() * 2 + 1;
        }

        backgrounds.particles = {
            init: function () {
                particles = [];
                count = Math.floor((W * H) / 8000);
                if (count > 200) count = 200;
                for (var i = 0; i < count; i++) {
                    particles.push(new Particle());
                }
            },
            draw: function () {
                ctx.clearRect(0, 0, W, H);
                for (var i = 0; i < particles.length; i++) {
                    var p = particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > W) p.vx *= -1;
                    if (p.y < 0 || p.y > H) p.vy *= -1;

                    // Draw particle
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(130, 170, 255, 0.8)';
                    ctx.fill();

                    // Connect to nearby particles
                    for (var j = i + 1; j < particles.length; j++) {
                        var p2 = particles[j];
                        var dx = p.x - p2.x;
                        var dy = p.y - p2.y;
                        var dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < maxDist) {
                            ctx.beginPath();
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.strokeStyle = 'rgba(130, 170, 255,' + (1 - dist / maxDist) * 0.4 + ')';
                            ctx.lineWidth = 0.6;
                            ctx.stroke();
                        }
                    }

                    // Connect to mouse
                    var mdx = p.x - mouseX;
                    var mdy = p.y - mouseY;
                    var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (mDist < mouseDist) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.strokeStyle = 'rgba(180, 210, 255,' + (1 - mDist / mouseDist) * 0.6 + ')';
                        ctx.lineWidth = 0.8;
                        ctx.stroke();

                        // Slight attraction towards mouse
                        p.x -= mdx * 0.002;
                        p.y -= mdy * 0.002;
                    }
                }

                // Draw mouse glow
                if (mouseX > 0 && mouseY > 0) {
                    var grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, mouseDist * 0.5);
                    grad.addColorStop(0, 'rgba(130, 170, 255, 0.15)');
                    grad.addColorStop(1, 'rgba(130, 170, 255, 0)');
                    ctx.beginPath();
                    ctx.arc(mouseX, mouseY, mouseDist * 0.5, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();
                }
            },
            resize: function () {
                this.init();
            }
        };
    })();

    // =========================================================
    //  3. AURORA - Northern Lights / Aurora Borealis
    // =========================================================
    (function () {
        var time = 0;
        var bands = [];
        var starPoints = [];

        function initStars() {
            starPoints = [];
            var numStars = Math.floor((W * H) / 5000);
            if (numStars > 300) numStars = 300;
            for (var i = 0; i < numStars; i++) {
                starPoints.push({
                    x: Math.random() * W,
                    y: Math.random() * H * 0.7,
                    r: Math.random() * 1.2 + 0.3,
                    twinkle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.02 + 0.01
                });
            }
        }

        function initBands() {
            bands = [];
            for (var i = 0; i < 4; i++) {
                bands.push({
                    yBase: H * (0.2 + i * 0.12),
                    amplitude: 30 + Math.random() * 40,
                    frequency: 0.002 + Math.random() * 0.002,
                    speed: 0.003 + Math.random() * 0.005,
                    phase: Math.random() * Math.PI * 2,
                    hue: 120 + i * 30,          // green -> cyan -> blue
                    opacity: 0.12 - i * 0.02,
                    width: 80 + i * 20
                });
            }
        }

        backgrounds.aurora = {
            init: function () {
                time = 0;
                initBands();
                initStars();
            },
            draw: function () {
                time += 1;
                ctx.clearRect(0, 0, W, H);

                // Draw twinkling stars
                for (var s = 0; s < starPoints.length; s++) {
                    var sp = starPoints[s];
                    sp.twinkle += sp.speed;
                    var opacity = 0.3 + 0.7 * Math.abs(Math.sin(sp.twinkle));
                    ctx.beginPath();
                    ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(220, 230, 255,' + opacity + ')';
                    ctx.fill();
                }

                // Draw aurora bands
                for (var b = 0; b < bands.length; b++) {
                    var band = bands[b];
                    var grad = ctx.createLinearGradient(0, band.yBase - band.width, 0, band.yBase + band.width);
                    grad.addColorStop(0, 'hsla(' + band.hue + ', 80%, 60%, 0)');
                    grad.addColorStop(0.3, 'hsla(' + band.hue + ', 80%, 55%, ' + band.opacity + ')');
                    grad.addColorStop(0.5, 'hsla(' + band.hue + ', 90%, 50%, ' + (band.opacity * 1.5) + ')');
                    grad.addColorStop(0.7, 'hsla(' + (band.hue + 20) + ', 80%, 55%, ' + band.opacity + ')');
                    grad.addColorStop(1, 'hsla(' + (band.hue + 40) + ', 80%, 60%, 0)');

                    ctx.beginPath();
                    ctx.moveTo(0, H);
                    for (var x = 0; x <= W; x += 3) {
                        var y = band.yBase +
                            Math.sin(x * band.frequency + time * band.speed + band.phase) * band.amplitude +
                            Math.sin(x * band.frequency * 1.5 + time * band.speed * 0.7) * band.amplitude * 0.5;
                        ctx.lineTo(x, y);
                    }
                    ctx.lineTo(W, H);
                    ctx.closePath();
                    ctx.fillStyle = grad;
                    ctx.fill();
                }
            },
            resize: function () {
                initBands();
                initStars();
            }
        };
    })();

    // =========================================================
    //  4. FIREFLIES - Floating glowing fireflies
    // =========================================================
    (function () {
        var flies = [];
        var count;

        function Firefly() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.r = Math.random() * 3 + 2;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.phase = Math.random() * Math.PI * 2;
            this.phaseSpeed = Math.random() * 0.02 + 0.01;
            // warm color palette: gold, amber, green-gold
            var hues = [45, 55, 65, 35, 50];
            this.hue = hues[Math.floor(Math.random() * hues.length)];
            this.lightness = 50 + Math.random() * 20;
            // drift direction change timer
            this.driftTimer = Math.random() * 200;
        }

        backgrounds.fireflies = {
            init: function () {
                flies = [];
                count = Math.floor((W * H) / 20000);
                if (count < 20) count = 20;
                if (count > 80) count = 80;
                for (var i = 0; i < count; i++) {
                    flies.push(new Firefly());
                }
            },
            draw: function () {
                ctx.clearRect(0, 0, W, H);

                for (var i = 0; i < flies.length; i++) {
                    var f = flies[i];
                    f.phase += f.phaseSpeed;
                    f.driftTimer--;
                    if (f.driftTimer <= 0) {
                        f.vx = (Math.random() - 0.5) * 0.6;
                        f.vy = (Math.random() - 0.5) * 0.6;
                        f.driftTimer = 100 + Math.random() * 200;
                    }

                    f.x += f.vx;
                    f.y += f.vy;

                    // wrap around
                    if (f.x < -20) f.x = W + 20;
                    if (f.x > W + 20) f.x = -20;
                    if (f.y < -20) f.y = H + 20;
                    if (f.y > H + 20) f.y = -20;

                    var glow = 0.3 + 0.7 * Math.abs(Math.sin(f.phase));
                    var glowR = f.r + glow * 10;

                    // Outer glow
                    var grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowR);
                    grad.addColorStop(0, 'hsla(' + f.hue + ', 100%, ' + f.lightness + '%, ' + (glow * 0.5) + ')');
                    grad.addColorStop(0.4, 'hsla(' + f.hue + ', 90%, ' + (f.lightness - 10) + '%, ' + (glow * 0.2) + ')');
                    grad.addColorStop(1, 'hsla(' + f.hue + ', 80%, ' + (f.lightness - 20) + '%, 0)');
                    ctx.beginPath();
                    ctx.arc(f.x, f.y, glowR, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();

                    // Core
                    ctx.beginPath();
                    ctx.arc(f.x, f.y, f.r * glow, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(' + f.hue + ', 100%, 80%, ' + glow + ')';
                    ctx.fill();
                }
            },
            resize: function () {
                this.init();
            }
        };
    })();

    // =========================================================
    //  5. MATRIX - Digital Rain
    // =========================================================
    (function () {
        var columns;
        var drops;
        var fontSize = 14;
        var chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        backgrounds.matrix = {
            init: function () {
                columns = Math.floor(W / fontSize);
                drops = [];
                for (var i = 0; i < columns; i++) {
                    drops[i] = Math.floor(Math.random() * -H / fontSize);
                }
            },
            draw: function () {
                // Fade effect - use dark blue tint to match the universe gradient
                ctx.fillStyle = 'rgba(8, 10, 20, 0.05)';
                ctx.fillRect(0, 0, W, H);

                ctx.font = fontSize + 'px monospace';

                for (var i = 0; i < drops.length; i++) {
                    var char = chars[Math.floor(Math.random() * chars.length)];
                    var x = i * fontSize;
                    var y = drops[i] * fontSize;

                    // Head character is brighter
                    if (drops[i] > 0) {
                        // Bright head
                        ctx.fillStyle = 'rgba(180, 255, 180, 0.9)';
                        ctx.fillText(char, x, y);

                        // Slightly dimmer trail character
                        if (drops[i] > 1) {
                            var trailChar = chars[Math.floor(Math.random() * chars.length)];
                            ctx.fillStyle = 'rgba(0, 200, 80, 0.6)';
                            ctx.fillText(trailChar, x, y - fontSize);
                        }
                    }

                    // Main green characters
                    ctx.fillStyle = 'rgba(0, 180, 60, 0.35)';
                    ctx.fillText(char, x, y);

                    if (y > H && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                }
            },
            resize: function () {
                this.init();
            }
        };
    })();

    // =========================================================
    //  6. METEORS - Meteor shower with glowing trails
    // =========================================================
    (function () {
        var starPoints = [];
        var meteors = [];
        var maxMeteors;

        function initStars() {
            starPoints = [];
            var num = Math.floor((W * H) / 4000);
            if (num > 400) num = 400;
            for (var i = 0; i < num; i++) {
                starPoints.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: Math.random() * 1.2 + 0.3,
                    twinkle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.015 + 0.005
                });
            }
        }

        function Meteor() {
            this.reset = function () {
                // Start from top or right edge
                if (Math.random() > 0.5) {
                    this.x = Math.random() * W * 1.2;
                    this.y = -10;
                } else {
                    this.x = W + 10;
                    this.y = Math.random() * H * 0.4;
                }
                this.len = 60 + Math.random() * 120;
                this.speed = 4 + Math.random() * 8;
                // angle: roughly 200-240 degrees (falling left-down)
                var angle = (200 + Math.random() * 40) * Math.PI / 180;
                this.dx = Math.cos(angle) * this.speed;
                this.dy = -Math.sin(angle) * this.speed;
                this.opacity = 0.6 + Math.random() * 0.4;
                this.width = 1 + Math.random() * 1.5;
                this.alive = true;
                // color: white, blue-white or warm
                var colors = ['220,230,255', '180,200,255', '255,240,220', '200,210,255'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            };
            this.reset();
        }

        backgrounds.meteors = {
            init: function () {
                initStars();
                meteors = [];
                maxMeteors = Math.floor(W / 150);
                if (maxMeteors < 3) maxMeteors = 3;
                if (maxMeteors > 12) maxMeteors = 12;
            },
            draw: function () {
                ctx.clearRect(0, 0, W, H);

                // Stars
                for (var s = 0; s < starPoints.length; s++) {
                    var sp = starPoints[s];
                    sp.twinkle += sp.speed;
                    var op = 0.3 + 0.5 * Math.abs(Math.sin(sp.twinkle));
                    ctx.beginPath();
                    ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(200, 210, 240,' + op + ')';
                    ctx.fill();
                }

                // Spawn meteors
                if (meteors.length < maxMeteors && Math.random() < 0.03) {
                    var m = new Meteor();
                    meteors.push(m);
                }

                // Draw meteors
                for (var i = meteors.length - 1; i >= 0; i--) {
                    var mt = meteors[i];
                    mt.x += mt.dx;
                    mt.y += mt.dy;

                    // Trail
                    var tailX = mt.x - mt.dx * (mt.len / mt.speed);
                    var tailY = mt.y - mt.dy * (mt.len / mt.speed);
                    var grad = ctx.createLinearGradient(mt.x, mt.y, tailX, tailY);
                    grad.addColorStop(0, 'rgba(' + mt.color + ',' + mt.opacity + ')');
                    grad.addColorStop(0.3, 'rgba(' + mt.color + ',' + (mt.opacity * 0.4) + ')');
                    grad.addColorStop(1, 'rgba(' + mt.color + ',0)');
                    ctx.beginPath();
                    ctx.moveTo(mt.x, mt.y);
                    ctx.lineTo(tailX, tailY);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = mt.width;
                    ctx.stroke();

                    // Head glow
                    var hGrad = ctx.createRadialGradient(mt.x, mt.y, 0, mt.x, mt.y, 4);
                    hGrad.addColorStop(0, 'rgba(' + mt.color + ',' + mt.opacity + ')');
                    hGrad.addColorStop(1, 'rgba(' + mt.color + ',0)');
                    ctx.beginPath();
                    ctx.arc(mt.x, mt.y, 4, 0, Math.PI * 2);
                    ctx.fillStyle = hGrad;
                    ctx.fill();

                    // Off screen?
                    if (mt.x < -50 || mt.y > H + 50) {
                        meteors.splice(i, 1);
                    }
                }
            },
            resize: function () {
                initStars();
                meteors = [];
                maxMeteors = Math.floor(W / 150);
                if (maxMeteors < 3) maxMeteors = 3;
                if (maxMeteors > 12) maxMeteors = 12;
            }
        };
    })();

    // =========================================================
    //  7. SNOW - Gentle snowfall on a dark night
    // =========================================================
    (function () {
        var flakes = [];
        var count;
        var wind = 0;
        var windTarget = 0;
        var windTimer = 0;

        function Snowflake() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.r = Math.random() * 3 + 1;
            this.speed = 0.5 + Math.random() * 1.5;
            this.swing = Math.random() * Math.PI * 2;
            this.swingSpeed = 0.01 + Math.random() * 0.02;
            this.swingAmp = 0.3 + Math.random() * 0.8;
            this.opacity = 0.4 + Math.random() * 0.6;
        }

        backgrounds.snow = {
            init: function () {
                flakes = [];
                count = Math.floor((W * H) / 6000);
                if (count < 50) count = 50;
                if (count > 300) count = 300;
                for (var i = 0; i < count; i++) {
                    flakes.push(new Snowflake());
                }
                wind = 0;
                windTarget = 0;
                windTimer = 0;
            },
            draw: function () {
                ctx.clearRect(0, 0, W, H);

                // Slowly shift wind
                windTimer--;
                if (windTimer <= 0) {
                    windTarget = (Math.random() - 0.5) * 1.2;
                    windTimer = 200 + Math.random() * 300;
                }
                wind += (windTarget - wind) * 0.005;

                for (var i = 0; i < flakes.length; i++) {
                    var f = flakes[i];
                    f.swing += f.swingSpeed;
                    f.x += Math.sin(f.swing) * f.swingAmp + wind;
                    f.y += f.speed;

                    // Wrap
                    if (f.y > H + 10) {
                        f.y = -10;
                        f.x = Math.random() * W;
                    }
                    if (f.x < -10) f.x = W + 10;
                    if (f.x > W + 10) f.x = -10;

                    // Draw snowflake with soft glow
                    var grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 2);
                    grad.addColorStop(0, 'rgba(230, 238, 255,' + f.opacity + ')');
                    grad.addColorStop(0.5, 'rgba(210, 225, 250,' + (f.opacity * 0.5) + ')');
                    grad.addColorStop(1, 'rgba(200, 215, 240, 0)');
                    ctx.beginPath();
                    ctx.arc(f.x, f.y, f.r * 2, 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();

                    // Core
                    ctx.beginPath();
                    ctx.arc(f.x, f.y, f.r * 0.6, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(240, 248, 255,' + f.opacity + ')';
                    ctx.fill();
                }
            },
            resize: function () {
                this.init();
            }
        };
    })();

    // =========================================================
    //  8. NEBULA - Colorful nebula clouds with twinkling stars
    // =========================================================
    (function () {
        var time = 0;
        var starPoints = [];
        var cloudLayers = [];

        function initStars() {
            starPoints = [];
            var num = Math.floor((W * H) / 3500);
            if (num > 500) num = 500;
            for (var i = 0; i < num; i++) {
                starPoints.push({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    r: Math.random() * 1.4 + 0.2,
                    twinkle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.02 + 0.008,
                    hue: Math.random() > 0.7 ? (200 + Math.random() * 60) : (40 + Math.random() * 20)
                });
            }
        }

        function initClouds() {
            cloudLayers = [];
            var numClouds = 5 + Math.floor(Math.random() * 3);
            for (var i = 0; i < numClouds; i++) {
                cloudLayers.push({
                    cx: W * (0.15 + Math.random() * 0.7),
                    cy: H * (0.2 + Math.random() * 0.6),
                    rx: 150 + Math.random() * 250,
                    ry: 100 + Math.random() * 180,
                    hue: [280, 320, 200, 260, 340, 180][Math.floor(Math.random() * 6)],
                    sat: 60 + Math.random() * 30,
                    opacity: 0.04 + Math.random() * 0.06,
                    driftX: (Math.random() - 0.5) * 0.15,
                    driftY: (Math.random() - 0.5) * 0.08,
                    pulsePhase: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.003 + Math.random() * 0.004
                });
            }
        }

        backgrounds.nebula = {
            init: function () {
                time = 0;
                initStars();
                initClouds();
            },
            draw: function () {
                time++;
                ctx.clearRect(0, 0, W, H);

                // Draw nebula clouds
                for (var c = 0; c < cloudLayers.length; c++) {
                    var cl = cloudLayers[c];
                    cl.cx += cl.driftX;
                    cl.cy += cl.driftY;

                    // Wrap clouds around
                    if (cl.cx < -cl.rx) cl.cx = W + cl.rx;
                    if (cl.cx > W + cl.rx) cl.cx = -cl.rx;
                    if (cl.cy < -cl.ry) cl.cy = H + cl.ry;
                    if (cl.cy > H + cl.ry) cl.cy = -cl.ry;

                    var pulse = 1 + 0.15 * Math.sin(time * cl.pulseSpeed + cl.pulsePhase);
                    var rX = cl.rx * pulse;
                    var rY = cl.ry * pulse;

                    var grad = ctx.createRadialGradient(cl.cx, cl.cy, 0, cl.cx, cl.cy, Math.max(rX, rY));
                    grad.addColorStop(0, 'hsla(' + cl.hue + ', ' + cl.sat + '%, 50%, ' + (cl.opacity * 1.5) + ')');
                    grad.addColorStop(0.3, 'hsla(' + ((cl.hue + 30) % 360) + ', ' + cl.sat + '%, 40%, ' + (cl.opacity * 1.0) + ')');
                    grad.addColorStop(0.6, 'hsla(' + ((cl.hue + 60) % 360) + ', ' + (cl.sat - 10) + '%, 35%, ' + (cl.opacity * 0.5) + ')');
                    grad.addColorStop(1, 'hsla(' + cl.hue + ', ' + cl.sat + '%, 30%, 0)');

                    ctx.save();
                    ctx.translate(cl.cx, cl.cy);
                    ctx.scale(rX / Math.max(rX, rY), rY / Math.max(rX, rY));
                    ctx.beginPath();
                    ctx.arc(0, 0, Math.max(rX, rY), 0, Math.PI * 2);
                    ctx.fillStyle = grad;
                    ctx.fill();
                    ctx.restore();
                }

                // Draw twinkling stars
                for (var s = 0; s < starPoints.length; s++) {
                    var sp = starPoints[s];
                    sp.twinkle += sp.speed;
                    var op = 0.3 + 0.7 * Math.abs(Math.sin(sp.twinkle));
                    ctx.beginPath();
                    ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
                    ctx.fillStyle = 'hsla(' + sp.hue + ', 80%, 85%, ' + op + ')';
                    ctx.fill();

                    // Brighter stars get a glow
                    if (sp.r > 1.0 && op > 0.7) {
                        var sGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.r * 4);
                        sGrad.addColorStop(0, 'hsla(' + sp.hue + ', 80%, 85%, ' + (op * 0.3) + ')');
                        sGrad.addColorStop(1, 'hsla(' + sp.hue + ', 80%, 85%, 0)');
                        ctx.beginPath();
                        ctx.arc(sp.x, sp.y, sp.r * 4, 0, Math.PI * 2);
                        ctx.fillStyle = sGrad;
                        ctx.fill();
                    }
                }
            },
            resize: function () {
                initStars();
                initClouds();
            }
        };
    })();

    // =========================================================
    //  Background Manager (public API)
    // =========================================================
    function stopAnimation() {
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    }

    function startAnimation() {
        stopAnimation();
        function loop() {
            if (document.body.classList.contains('night') && currentBg && backgrounds[currentBg]) {
                backgrounds[currentBg].draw();
            }
            animId = requestAnimationFrame(loop);
        }
        loop();
    }

    function switchBackground(type) {
        if (!backgrounds[type]) return;
        stopAnimation();
        currentBg = type;
        ctx.clearRect(0, 0, W, H);
        backgrounds[type].init();
        startAnimation();
        // Persist choice
        try { localStorage.setItem('nightBgType', type); } catch (e) { /* ignore */ }
        // Update UI
        updateSwitcherUI();
    }

    function updateSwitcherUI() {
        var items = document.querySelectorAll('.bg-switcher-item');
        for (var i = 0; i < items.length; i++) {
            if (items[i].getAttribute('data-bg') === currentBg) {
                items[i].classList.add('active');
            } else {
                items[i].classList.remove('active');
            }
        }
    }

    function getSavedBg() {
        try {
            return localStorage.getItem('nightBgType') || 'stars';
        } catch (e) {
            return 'stars';
        }
    }

    // ---- Night color theme management ----
    var nightColorThemes = ['default', 'brown', 'green', 'purple', 'red'];
    var nightColorNames = {
        'default': '蓝色调',
        'brown': '暖棕色调',
        'green': '翠绿色调',
        'purple': '紫色调',
        'red': '暗红色调'
    };
    var nightColorIcons = {
        'default': 'fas fa-tint',
        'brown': 'fas fa-paw',
        'green': 'fas fa-leaf',
        'purple': 'fas fa-gem',
        'red': 'fas fa-fire'
    };

    function getSavedNightColor() {
        try { return localStorage.getItem('nightColorTheme') || 'default'; } catch (e) { return 'default'; }
    }

    function applyNightColorTheme(theme) {
        // Remove all night color theme classes
        for (var i = 0; i < nightColorThemes.length; i++) {
            if (nightColorThemes[i] !== 'default') {
                document.body.classList.remove('night-' + nightColorThemes[i]);
            }
        }
        // Add the selected theme class
        if (theme !== 'default') {
            document.body.classList.add('night-' + theme);
        }
        try { localStorage.setItem('nightColorTheme', theme); } catch (e) { /* ignore */ }
        updateNightColorUI();
    }

    function updateNightColorUI() {
        var saved = getSavedNightColor();
        var items = document.querySelectorAll('.bg-switcher-color-item');
        for (var i = 0; i < items.length; i++) {
            if (items[i].getAttribute('data-color-theme') === saved) {
                items[i].classList.add('active');
            } else {
                items[i].classList.remove('active');
            }
        }
    }

    // ---- Build the switcher popup UI ----
    function buildSwitcherUI() {
        // Check if already built
        if (document.getElementById('bg-switcher-popup')) return;

        var popup = document.createElement('div');
        popup.id = 'bg-switcher-popup';
        popup.className = 'bg-switcher-popup';
        popup.style.display = 'none';

        for (var i = 0; i < bgOrder.length; i++) {
            var key = bgOrder[i];
            var item = document.createElement('div');
            item.className = 'bg-switcher-item';
            item.setAttribute('data-bg', key);
            item.innerHTML = '<i class="' + bgIcons[key] + '"></i><span>' + bgNames[key] + '</span>';
            item.addEventListener('click', (function (k) {
                return function (e) {
                    e.stopPropagation();
                    switchBackground(k);
                };
            })(key));
            popup.appendChild(item);
        }

        // Add separator and night color theme section
        var separator = document.createElement('div');
        separator.className = 'bg-switcher-separator';
        popup.appendChild(separator);

        var label = document.createElement('div');
        label.className = 'bg-switcher-label';
        label.textContent = '色调';
        popup.appendChild(label);

        for (var j = 0; j < nightColorThemes.length; j++) {
            var cKey = nightColorThemes[j];
            var cItem = document.createElement('div');
            cItem.className = 'bg-switcher-item bg-switcher-color-item';
            cItem.setAttribute('data-color-theme', cKey);
            cItem.innerHTML = '<i class="' + nightColorIcons[cKey] + '"></i><span>' + nightColorNames[cKey] + '</span>';
            cItem.addEventListener('click', (function (k) {
                return function (e) {
                    e.stopPropagation();
                    applyNightColorTheme(k);
                };
            })(cKey));
            popup.appendChild(cItem);
        }

        document.body.appendChild(popup);
    }

    function positionPopup() {
        var btn = document.getElementById('bg-switch-nav');
        var popup = document.getElementById('bg-switcher-popup');
        if (!btn || !popup) return;
        var rect = btn.getBoundingClientRect();
        popup.style.top = (rect.bottom + 8) + 'px';
        popup.style.right = (window.innerWidth - rect.right) + 'px';
    }

    function togglePopup() {
        var popup = document.getElementById('bg-switcher-popup');
        if (!popup) return;
        if (popup.style.display === 'none') {
            positionPopup();
            popup.style.display = 'block';
            updateSwitcherUI();
            // Close on outside click
            setTimeout(function () {
                document.addEventListener('click', closePopupOutside);
            }, 0);
        } else {
            popup.style.display = 'none';
            document.removeEventListener('click', closePopupOutside);
        }
    }

    function closePopupOutside(e) {
        var popup = document.getElementById('bg-switcher-popup');
        var btn = document.getElementById('bg-switch-nav');
        if (!popup) return;
        if (!popup.contains(e.target) && !(btn && btn.contains(e.target))) {
            popup.style.display = 'none';
            document.removeEventListener('click', closePopupOutside);
        }
    }

    // ---- Initialize ----
    function initBgSwitcher() {
        var btn = document.getElementById('bg-switch-nav');
        if (!btn) {
            setTimeout(initBgSwitcher, 100);
            return;
        }
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            togglePopup();
        });
        buildSwitcherUI();

        var saved = getSavedBg();
        switchBackground(saved);

        // Apply saved night color theme
        applyNightColorTheme(getSavedNightColor());
    }

    initBgSwitcher();

    // Expose for theme-setting.js
    window._bgSwitcher = {
        switchBackground: switchBackground,
        stopAnimation: stopAnimation,
        startAnimation: startAnimation,
        getCurrentBg: function () { return currentBg; },
        applyNightColorTheme: applyNightColorTheme,
        getSavedNightColor: getSavedNightColor
    };
})();
