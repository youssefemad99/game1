/**
 * CameraController.js
 * تحويل مطابق لسكريبت TouchCameraController.cs في Unity.
 * يراقب اللمس والسحب في النصف الأيمن من الشاشة لتدوير الكاميرا أفقياً ورأسياً.
 * يدعم اللمس المتعدد (Multi-touch) حتى لا يتعارض مع جويستيك الحركة.
 * يدعم سحب الماوس على الكمبيوتر للتجربة الفورية.
 */
class TouchCameraController {
  constructor(playerGroup, camera, lookZoneId = 'touch-look-zone') {
    this.playerGroup = playerGroup; // يمثل جسم اللاعب (يدور يميناً ويساراً)
    this.camera = camera;           // يمثل الكاميرا (تدور للأعلى والأسفل)
    this.lookZone = document.getElementById(lookZoneId);

    // الحساسية وزوايا الرؤية
    this.touchSensitivity = 0.004;
    this.mouseSensitivity = 0.003;
    this.minPitch = -Math.PI * 0.42; // حوالي -75 درجة
    this.maxPitch = Math.PI * 0.42;  // حوالي +75 درجة

    this.yaw = 0;   // الدوران حول محور Y (اليمين واليسار)
    this.pitch = 0; // الدوران حول محور X (الأعلى والأسفل)

    this.activePointerId = null;
    this.lastX = 0;
    this.lastY = 0;

    this.init();
  }

  init() {
    if (!this.lookZone) return;

    // أحداث اللمس والمؤشر للمنطقة اليمنى
    this.lookZone.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
    window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e), { passive: false });

    // دعم Pointer Lock الاختياري عند النقر بالماوس على الكمبيوتر
    document.addEventListener('mousemove', (e) => {
      if (document.pointerLockElement) {
        this.applyRotation(e.movementX * this.mouseSensitivity, e.movementY * this.mouseSensitivity);
      }
    });
  }

  onPointerDown(e) {
    if (this.activePointerId !== null) return;
    // التأكد من عدم الضغط على أزرار الواجهة
    if (e.target.closest('#hud-top')) return;

    this.activePointerId = e.pointerId;
    this.lastX = e.clientX;
    this.lastY = e.clientY;
  }

  onPointerMove(e) {
    if (e.pointerId !== this.activePointerId) return;

    const deltaX = e.clientX - this.lastX;
    const deltaY = e.clientY - this.lastY;

    this.lastX = e.clientX;
    this.lastY = e.clientY;

    const sensitivity = e.pointerType === 'touch' ? this.touchSensitivity : this.mouseSensitivity;
    this.applyRotation(deltaX * sensitivity, deltaY * sensitivity);
  }

  onPointerUp(e) {
    if (e.pointerId !== this.activePointerId) return;
    this.activePointerId = null;
  }

  applyRotation(deltaX, deltaY) {
    // تدوير اللاعب أفقياً (Yaw)
    this.yaw -= deltaX;
    this.playerGroup.rotation.y = this.yaw;

    // تدوير الكاميرا رأسياً (Pitch) مع التقييد بالحد الأدنى والأقصى
    this.pitch -= deltaY;
    this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
    this.camera.rotation.x = this.pitch;
  }
}
