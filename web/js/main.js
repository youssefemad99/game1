/**
 * Main.js
 * نقطة الانطلاق لتطبيق الويب (PWA) للعبة "مدير القهوة".
 * يهيئ Three.js ومحرك الريندر، ويربط اللاعب والكاميرا والجويستيك وبيئة القهوة.
 * خفيف جداً ومُعد خصيصاً للموبايلات الضعيفة.
 */

window.addEventListener('DOMContentLoaded', () => {
  // 1. حاوية الكانفاس
  const container = document.getElementById('canvas-container');

  // 2. إنشاء المشهد (Scene)
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a0f08);

  // 3. إنشاء كاميرا المنظور الأول (First Person Camera)
  const camera = new THREE.PerspectiveCamera(
    65, // مجال الرؤية (FOV)
    window.innerWidth / window.innerHeight,
    0.1,
    60
  );

  // 4. إعداد محرك الريندر (WebGLRenderer) بأداء فائق وموفر للطاقة
  const renderer = new THREE.WebGLRenderer({
    antialias: false, // إيقاف التنعيم الثقيل لضمان 30-60 فريم على أي موبايل
    powerPreference: 'high-performance',
    precision: 'mediump'
  });

  // تقييد الـ PixelRatio عند 1.5 كحد أقصى لمنع استهلاك المعالج الرسومي في الشاشات العالية
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // 5. إنشاء الجويستيك الافتراضي
  const joystick = new VirtualJoystick('joystick-container', 'joystick-thumb', 45);

  // 6. إنشاء اللاعب (يربط الحركة والجويستيك والكاميرا)
  const player = new Player(scene, camera, joystick);

  // 7. إنشاء وحدة التحكم في تدوير الكاميرا باللمس والماوس
  const cameraController = new TouchCameraController(player.group, camera, 'touch-look-zone');

  // 8. بناء بيئة القهوة Low-Poly
  const cafeScene = new CafeScene(scene, player);

  // 9. زر ملء الشاشة (Fullscreen) لدخول الوضع الكامل في الموبايل
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const fullscreenIcon = document.getElementById('fullscreen-icon');

  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      fullscreenIcon.textContent = '✕';
      // محاولة قفل الشاشة بالعرض إذا كان المتصفح يدعم ذلك
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      document.exitFullscreen().catch(() => {});
      fullscreenIcon.textContent = '⛶';
    }
  });

  document.addEventListener('fullscreenchange', () => {
    fullscreenIcon.textContent = document.fullscreenElement ? '✕' : '⛶';
  });

  // 10. التكيف مع تغيير حجم الشاشة أو تدوير الموبايل
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', () => {
    setTimeout(onResize, 200);
  });

  // 11. عداد الفريمات (FPS Counter)
  const fpsElement = document.getElementById('fps-counter');
  let frameCount = 0;
  let lastTime = performance.now();

  function updateFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 500) {
      const currentFPS = Math.round((frameCount * 1000) / (now - lastTime));
      fpsElement.textContent = `${currentFPS} FPS`;
      frameCount = 0;
      lastTime = now;
    }
  }

  // 12. حلقة التحديث المستمرة (Game Loop)
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    // حساب فرق الوقت بين الفريمات
    let delta = clock.getDelta();
    if (delta > 0.1) delta = 0.1; // تجنب القفزات الكبيرة عند تصغير المتصفح

    // تحديث حركة اللاعب
    player.update(delta);

    // ريندر المشهد
    renderer.render(scene, camera);

    // تحديث عداد الإطارات
    updateFPS();
  }

  // بدء تشغيل اللعبة
  animate();
});
