using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// سكريبت تحريك كاميرا المنظور الأول باللمس (Touch Look).
/// يراقب حركة الإصبع في الجزء الأيمن من الشاشة لتدوير الكاميرا وجسم اللاعب.
/// يدعم اللمس المتعدد (Multi-touch) حتى لا يتعارض مع جويستيك الحركة.
/// يدعم سحب الماوس داخل محرر Unity للتجربة على الكمبيوتر.
/// </summary>
public class TouchCameraController : MonoBehaviour
{
    [Header("Targets")]
    [Tooltip("جسم اللاعب (يتم تدويره يميناً ويساراً)")]
    [SerializeField] private Transform playerBody;

    [Tooltip("كاميرا المنظور الأول (يتم تدويرها للأعلى والأسفل)")]
    [SerializeField] private Transform cameraTransform;

    [Header("Sensitivity & Limits")]
    [Tooltip("حساسية اللمس على شاشة الموبايل")]
    [SerializeField] private float touchSensitivity = 0.12f;

    [Tooltip("حساسية الماوس داخل محرر Unity للتجربة")]
    [SerializeField] private float mouseSensitivity = 2.0f;

    [Tooltip("أقصى زاوية للنظر للأسفل")]
    [SerializeField] private float minPitch = -75f;

    [Tooltip("أقصى زاوية للنظر للأعلى")]
    [SerializeField] private float maxPitch = 75f;

    [Header("Screen Partition")]
    [Tooltip("نسبة بداية الجزء الأيمن (0.4 تعني أن الـ 60% الأيمن من الشاشة مخصص للكاميرا)")]
    [Range(0.2f, 0.8f)]
    [SerializeField] private float rightSideStartRatio = 0.45f;

    // تتبع زاوية النظر الرأسية الحالية
    private float currentPitch = 0f;

    // معرف الإصبع الذي يتحكم في الكاميرا حالياً (لمنع التداخل مع الجويستيك)
    private int lookFingerId = -1;

    private void Awake()
    {
        // إعداد تلقائي إذا لم يتم التحديد في Inspector
        if (cameraTransform == null)
        {
            cameraTransform = transform;
        }

        if (playerBody == null && transform.parent != null)
        {
            playerBody = transform.parent;
        }
    }

    private void Update()
    {
        // 1. معالجة اللمس الفعلي على الموبايل
        HandleTouchInput();

        // 2. معالجة فأرة الكمبيوتر داخل محرر Unity للتجربة السريعة
#if UNITY_EDITOR
        HandleEditorMouseInput();
#endif
    }

    private void HandleTouchInput()
    {
        for (int i = 0; i < Input.touchCount; i++)
        {
            Touch touch = Input.GetTouch(i);

            // عند بداية لمسة جديدة
            if (touch.phase == TouchPhase.Began)
            {
                // نتأكد أن اللمس بدأ في النصف الأيمن من الشاشة
                if (touch.position.x > Screen.width * rightSideStartRatio)
                {
                    // التأكد من أن اللمس ليس فوق أزرار UI (إذا كان EventSystem موجوداً)
                    if (EventSystem.current == null || !EventSystem.current.IsPointerOverGameObject(touch.fingerId))
                    {
                        // نخصص هذا الإصبع لتدوير الكاميرا ما لم يكن هناك إصبع آخر مخصص بالفعل
                        if (lookFingerId == -1)
                        {
                            lookFingerId = touch.fingerId;
                        }
                    }
                }
            }
            // أثناء سحب الإصبع المخصص للكاميرا
            else if (touch.fingerId == lookFingerId)
            {
                if (touch.phase == TouchPhase.Moved)
                {
                    float deltaX = touch.deltaPosition.x * touchSensitivity;
                    float deltaY = touch.deltaPosition.y * touchSensitivity;
                    ApplyRotation(deltaX, deltaY);
                }
                else if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
                {
                    // تحرير الإصبع عند رفعه من الشاشة
                    lookFingerId = -1;
                }
            }
        }
    }

#if UNITY_EDITOR
    private void HandleEditorMouseInput()
    {
        // في المحرر: عند الضغط وسحب الماوس داخل الجزء الأيمن
        if (Input.GetMouseButton(0))
        {
            if (Input.mousePosition.x > Screen.width * rightSideStartRatio)
            {
                float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
                float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;
                ApplyRotation(mouseX, mouseY);
            }
        }
    }
#endif

    private void ApplyRotation(float deltaX, float deltaY)
    {
        // تدوير جسم اللاعب أفقياً (يمين / يسار حول محور Y)
        if (playerBody != null)
        {
            playerBody.Rotate(Vector3.up * deltaX);
        }

        // تدوير الكاميرا رأسياً (فوق / تحت حول محور X) مع تثبيت الحدود (Clamp)
        currentPitch -= deltaY;
        currentPitch = Mathf.Clamp(currentPitch, minPitch, maxPitch);

        if (cameraTransform != null)
        {
            cameraTransform.localEulerAngles = new Vector3(currentPitch, 0f, 0f);
        }
    }
}
