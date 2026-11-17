/**
 * Player.js
 * تحويل مطابق لسكريبت PlayerMovement.cs في Unity.
 * يتحكم في حركة اللاعب بالمنظور الأول بالاعتماد على:
 * 1. الجويستيك الافتراضي (VirtualJoystick)
 * 2. أزرار الكيبورد (WASD أو الأسهم)
 * ويحتوي على نظام تصادم خفيف جداً يمنع اللاعب من اختراق الحيطان والترابيزات.
 */
class Player {
  constructor(scene, camera, joystick) {
    this.scene = scene;
    this.camera = camera;
    this.joystick = joystick;

    // سرعة المشي وحدود اللاعب
    this.speed = 4.2;
    this.radius = 0.45;

    // حاوية اللاعب في المشهد (تمثل الجسم ومكانه)
    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0); // البداية في منتصف القهوة
    this.scene.add(this.group);

    // نضع الكاميرا داخل مجموعة اللاعب على ارتفاع 1.6 متر (عين الإنسان)
    this.camera.position.set(0, 1.6, 0);
    this.camera.rotation.order = 'YXZ';
    this.group.add(this.camera);

    // مفاتيح الكيبورد
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false
    };

    // مصفوفة العوائق لمنع الاصطدام
    this.colliders = [];

    this.initKeyboard();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.keys.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.keys.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.keys.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.keys.right = false;
          break;
      }
    });
  }

  addCollider(box) {
    // box: { minX, maxX, minZ, maxZ }
    this.colliders.push(box);
  }

  update(delta) {
    // 1. قراءة مدخلات الجويستيك
    let moveH = this.joystick ? this.joystick.getHorizontal() : 0;
    let moveV = this.joystick ? this.joystick.getVertical() : 0;

    // 2. إذا لم يكن الجويستيك مستخدماً، نأخذ المدخلات من الكيبورد
    if (moveH === 0 && moveV === 0) {
      if (this.keys.forward) moveV += 1;
      if (this.keys.backward) moveV -= 1;
      if (this.keys.right) moveH += 1;
      if (this.keys.left) moveH -= 1;
    }

    // إذا لم تكن هناك حركة نتوقف
    if (moveH === 0 && moveV === 0) return;

    // توحيد طول المتجه لمنع السرعة المضاعفة عند المشي القطري
    const len = Math.hypot(moveH, moveV);
    if (len > 1) {
      moveH /= len;
      moveV /= len;
    }

    // 3. حساب اتجاه الحركة بالنسبة لزاوية دوران اللاعب (Yaw)
    const yaw = this.group.rotation.y;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);

    // في الفضاء ثلاثي الأبعاد:
    // الاتجاه للأمام: (sin, cos) بالسالب/الموجب
    // اليمين: (cos, -sin)
    const forwardX = -sin;
    const forwardZ = -cos;
    const rightX = cos;
    const rightZ = -sin;

    const dirX = (rightX * moveH) + (forwardX * moveV);
    const dirZ = (rightZ * moveH) + (forwardZ * moveV);

    const step = this.speed * delta;
    const targetX = this.group.position.x + (dirX * step);
    const targetZ = this.group.position.z + (dirZ * step);

    // 4. فحص التصادم الخفيف والتأكد من البقاء داخل حدود القهوة
    if (!this.checkCollision(targetX, this.group.position.z)) {
      this.group.position.x = targetX;
    }
    if (!this.checkCollision(this.group.position.x, targetZ)) {
      this.group.position.z = targetZ;
    }
  }

  checkCollision(nextX, nextZ) {
    // فحص حدود الغرفة العامة (الغرفة 14×14 متر)
    const roomLimit = 6.4;
    if (Math.abs(nextX) > roomLimit || Math.abs(nextZ) > roomLimit) {
      return true;
    }

    // فحص الأجسام والعوائق المسجلة (كالترابيزات والبار)
    for (const col of this.colliders) {
      if (
        nextX + this.radius > col.minX &&
        nextX - this.radius < col.maxX &&
        nextZ + this.radius > col.minZ &&
        nextZ - this.radius < col.maxZ
      ) {
        return true;
      }
    }
    return false;
  }
}
