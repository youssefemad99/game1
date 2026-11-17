/**
 * CafeScene.js
 * بناء بيئة القهوة المصرية ثلاثية الأبعاد بأسلوب Low-Poly خفيف جداً.
 * تحتوي على:
 * - أرضية ببلاط دافئ وحيطان بارتفاع 3.5 متر.
 * - بنك القهوة (البار) مع غلاية الشاي والأكواب.
 * - 4 ترابيزات شعبية مع كراسي خشبية وبلاستيكية (كما ورد في وثيقة اللعبة للمستوى 1).
 * - مجسم شيشة صغيرة في الركن.
 * - إضاءة دافئة بدون ظلال ثقيلة لضمان أعلى أداء وسلاسة على أي موبايل ضعيف.
 */
class CafeScene {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;

    this.createMaterials();
    this.buildRoom();
    this.buildBarCounter();
    this.buildTablesAndChairs();
    this.buildDecorations();
    this.setupLighting();
  }

  createMaterials() {
    // خامات Lambert خفيفة جداً على معالجات الموبايل
    this.matFloor = new THREE.MeshLambertMaterial({ color: 0x9e5229 });       // بلاط بني دافئ
    this.matWall = new THREE.MeshLambertMaterial({ color: 0xe8d7be });        // حوائط بيج فاتح
    this.matWood = new THREE.MeshLambertMaterial({ color: 0x5a311b });        // خشب غامق للترابيزات والبار
    this.matMarble = new THREE.MeshLambertMaterial({ color: 0xded8cc });      // رخام البار
    this.matChairPlastic = new THREE.MeshLambertMaterial({ color: 0x2266aa });// كراسي بلاستيك زرقاء شعبية
    this.matMetal = new THREE.MeshLambertMaterial({ color: 0xcccccc });       // معدن الشيشة والغلاية
    this.matBrass = new THREE.MeshLambertMaterial({ color: 0xdfab35 });       // نحاس الكنكة
  }

  buildRoom() {
    // 1. الأرضية (14 × 14 متر)
    const floorGeo = new THREE.BoxGeometry(14, 0.2, 14);
    const floor = new THREE.Mesh(floorGeo, this.matFloor);
    floor.position.y = -0.1;
    this.scene.add(floor);

    // سقف بسيط
    const ceilingGeo = new THREE.BoxGeometry(14, 0.2, 14);
    const ceiling = new THREE.Mesh(ceilingGeo, this.matWall);
    ceiling.position.y = 3.5;
    this.scene.add(ceiling);

    // 2. الحيطان الأربعة
    const wallHeight = 3.5;
    const wallThick = 0.3;

    // الحائط الخلفي
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(14, wallHeight, wallThick), this.matWall);
    backWall.position.set(0, wallHeight / 2, -7);
    this.scene.add(backWall);

    // الحائط الأيسر
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 14), this.matWall);
    leftWall.position.set(-7, wallHeight / 2, 0);
    this.scene.add(leftWall);

    // الحائط الأيمن
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallHeight, 14), this.matWall);
    rightWall.position.set(7, wallHeight / 2, 0);
    this.scene.add(rightWall);

    // الحائط الأمامي (مع فتحة باب القهوة للخروج للشارع)
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry(5.5, wallHeight, wallThick), this.matWall);
    frontWallLeft.position.set(-4.25, wallHeight / 2, 7);
    this.scene.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry(5.5, wallHeight, wallThick), this.matWall);
    frontWallRight.position.set(4.25, wallHeight / 2, 7);
    this.scene.add(frontWallRight);

    // عتبة علوية فوق الباب
    const doorTop = new THREE.Mesh(new THREE.BoxGeometry(3, 0.9, wallThick), this.matWall);
    doorTop.position.set(0, wallHeight - 0.45, 7);
    this.scene.add(doorTop);
  }

  buildBarCounter() {
    // بار إعداد الشاي والقهوة في الركن الأيسر الخلفي
    const counterWidth = 3.6;
    const counterDepth = 1.2;
    const counterHeight = 1.05;
    const posX = -4.5;
    const posZ = -5.0;

    const baseGeo = new THREE.BoxGeometry(counterWidth, counterHeight, counterDepth);
    const base = new THREE.Mesh(baseGeo, this.matWood);
    base.position.set(posX, counterHeight / 2, posZ);
    this.scene.add(base);

    // رخامة البار العلوية
    const topGeo = new THREE.BoxGeometry(counterWidth + 0.2, 0.1, counterDepth + 0.2);
    const top = new THREE.Mesh(topGeo, this.matMarble);
    top.position.set(posX, counterHeight + 0.05, posZ);
    this.scene.add(top);

    // غلاية الشاي الكبيرة (Cylinder)
    const kettle = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.5, 8), this.matMetal);
    kettle.position.set(posX - 0.9, counterHeight + 0.35, posZ);
    this.scene.add(kettle);

    // كنكة قهوة نحاس
    const kanaka = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.22, 8), this.matBrass);
    kanaka.position.set(posX - 0.4, counterHeight + 0.2, posZ + 0.1);
    this.scene.add(kanaka);

    // إضافة حدود التصادم حتى لا يخترق اللاعب البار
    if (this.player) {
      this.player.addCollider({
        minX: posX - (counterWidth / 2) - 0.2,
        maxX: posX + (counterWidth / 2) + 0.2,
        minZ: posZ - (counterDepth / 2) - 0.2,
        maxZ: posZ + (counterDepth / 2) + 0.2
      });
    }
  }

  buildTablesAndChairs() {
    // 4 ترابيزات موزعة في صالة القهوة (كما في المرحلة 1)
    const tablePositions = [
      { x: -3.0, z: -1.5 },
      { x:  3.0, z: -1.5 },
      { x: -3.0, z:  2.5 },
      { x:  3.0, z:  2.5 }
    ];

    tablePositions.forEach((pos, idx) => {
      this.createTable(pos.x, pos.z, idx);
    });
  }

  createTable(x, z, idx) {
    const tableHeight = 0.8;
    const tableRadius = 0.7;

    // قرص الترابيزة (Low-Poly Cylinder بـ 10 أضلاع فقط)
    const topGeo = new THREE.CylinderGeometry(tableRadius, tableRadius, 0.06, 10);
    const tableTop = new THREE.Mesh(topGeo, this.matWood);
    tableTop.position.set(x, tableHeight, z);
    this.scene.add(tableTop);

    // رجل الترابيزة المركزية
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, tableHeight, 6);
    const leg = new THREE.Mesh(legGeo, this.matMetal);
    leg.position.set(x, tableHeight / 2, z);
    this.scene.add(leg);

    // قاعدة رجل الترابيزة
    const baseGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 8);
    const base = new THREE.Mesh(baseGeo, this.matMetal);
    base.position.set(x, 0.02, z);
    this.scene.add(base);

    // كوب شاي زجاجي أو فنجان على الترابيزة
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 6), this.matMarble);
    cup.position.set(x + 0.2, tableHeight + 0.07, z);
    this.scene.add(cup);

    // وضع كرسيين أو تلاتة حول الترابيزة
    this.createChair(x - 0.9, z, 0);
    this.createChair(x + 0.9, z, Math.PI);

    // تسجيل تصادم الترابيزة
    if (this.player) {
      this.player.addCollider({
        minX: x - 0.8,
        maxX: x + 0.8,
        minZ: z - 0.8,
        maxZ: z + 0.8
      });
    }
  }

  createChair(x, z, rotY) {
    const chairGroup = new THREE.Group();
    chairGroup.position.set(x, 0, z);
    chairGroup.rotation.y = rotY;

    // مقعد الكرسي البلاستيك
    const seatGeo = new THREE.BoxGeometry(0.45, 0.05, 0.45);
    const seat = new THREE.Mesh(seatGeo, this.matChairPlastic);
    seat.position.y = 0.45;
    chairGroup.add(seat);

    // ظهر الكرسي
    const backGeo = new THREE.BoxGeometry(0.45, 0.45, 0.04);
    const back = new THREE.Mesh(backGeo, this.matChairPlastic);
    back.position.set(0, 0.7, -0.2);
    chairGroup.add(back);

    // 4 أرجل للكرسي
    const legGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.45, 4);
    const legPositions = [
      [-0.18, -0.18],
      [ 0.18, -0.18],
      [-0.18,  0.18],
      [ 0.18,  0.18]
    ];

    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, this.matMetal);
      leg.position.set(lx, 0.225, lz);
      chairGroup.add(leg);
    });

    this.scene.add(chairGroup);
  }

  buildDecorations() {
    // شيشة مصرية في الركن اليمين الخلفي
    const shishaGroup = new THREE.Group();
    shishaGroup.position.set(5.5, 0, -5.5);

    // زجاجة الشيشة السفلية
    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 0.5, 8), this.matMetal);
    bottle.position.y = 0.25;
    shishaGroup.add(bottle);

    // عمود الشيشة النحاسي
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), this.matBrass);
    stem.position.y = 0.75;
    shishaGroup.add(stem);

    // حجر المعسل والصحن
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8), this.matMetal);
    plate.position.y = 1.05;
    shishaGroup.add(plate);

    const clayHead = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.12, 6), this.matFloor);
    clayHead.position.y = 1.13;
    shishaGroup.add(clayHead);

    this.scene.add(shishaGroup);

    // برواز صورة قديمة أو ساعة حائط على الجدار
    const frameGeo = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const frame = new THREE.Mesh(frameGeo, this.matWood);
    frame.position.set(0, 2.3, -6.83);
    this.scene.add(frame);
  }

  setupLighting() {
    // إضاءة محيطية عامة دافئة
    const ambientLight = new THREE.AmbientLight(0xffecd2, 0.75);
    this.scene.add(ambientLight);

    // مصباح دافئ متدلي في منتصف القهوة
    const centerLight = new THREE.PointLight(0xffbe6b, 1.0, 16);
    centerLight.position.set(0, 3.2, 0);
    this.scene.add(centerLight);

    // ضوء نهار خفيف داخل من باب القهوة
    const sunLight = new THREE.DirectionalLight(0xfff6e5, 0.45);
    sunLight.position.set(2, 4, 8);
    this.scene.add(sunLight);
  }
}
