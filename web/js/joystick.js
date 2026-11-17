/**
 * Joystick.js
 * تحويل مطابق لسكريبت VirtualJoystick.cs في Unity.
 * يعمل باللمس على الموبايل وبسحب الماوس على الكمبيوتر.
 * يوفر قيماً معيارية للأفقي (Horizontal) والرأسي (Vertical) بين -1 و +1.
 */
class VirtualJoystick {
  constructor(containerId, thumbId, maxRadius = 45) {
    this.container = document.getElementById(containerId);
    this.thumb = document.getElementById(thumbId);
    this.maxRadius = maxRadius;

    this.horizontal = 0;
    this.vertical = 0;
    this.activePointerId = null;
    this.centerX = 0;
    this.centerY = 0;

    this.init();
  }

  init() {
    if (!this.container || !this.thumb) return;

    // استخدام PointerEvents لدعم اللمس والفأرة بنفس الكفاءة
    this.container.addEventListener('pointerdown', (e) => this.onPointerDown(e), { passive: false });
    window.addEventListener('pointermove', (e) => this.onPointerMove(e), { passive: false });
    window.addEventListener('pointerup', (e) => this.onPointerUp(e), { passive: false });
    window.addEventListener('pointercancel', (e) => this.onPointerUp(e), { passive: false });
  }

  updateCenter() {
    const rect = this.container.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
  }

  onPointerDown(e) {
    if (this.activePointerId !== null) return;
    e.preventDefault();
    e.stopPropagation();

    this.activePointerId = e.pointerId;
    this.updateCenter();
    this.processMove(e.clientX, e.clientY);
  }

  onPointerMove(e) {
    if (e.pointerId !== this.activePointerId) return;
    e.preventDefault();
    this.processMove(e.clientX, e.clientY);
  }

  processMove(clientX, clientY) {
    let dx = clientX - this.centerX;
    let dy = clientY - this.centerY;

    const distance = Math.hypot(dx, dy);

    // حصر المقبض داخل نصف القطر الأقصى
    if (distance > this.maxRadius) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * this.maxRadius;
      dy = Math.sin(angle) * this.maxRadius;
    }

    // تحريك مقبض الجويستيك بصرياً
    this.thumb.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;

    // تحويل القيم إلى نطاق -1 إلى +1
    // في الشاشة السحب لأعلى يعطي قيمة dy سالبة، لذلك نعكس الإشارة لتكون للأمام
    this.horizontal = dx / this.maxRadius;
    this.vertical = -dy / this.maxRadius;
  }

  onPointerUp(e) {
    if (e.pointerId !== this.activePointerId) return;
    this.activePointerId = null;

    // تصفير القيم وإرجاع المقبض للمنتصف
    this.horizontal = 0;
    this.vertical = 0;
    this.thumb.style.transform = 'translate3d(0px, 0px, 0)';
  }

  getHorizontal() {
    return this.horizontal;
  }

  getVertical() {
    return this.vertical;
  }

  isActive() {
    return this.activePointerId !== null;
  }
}
