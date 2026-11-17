using UnityEngine;
using UnityEngine.EventSystems;

/// <summary>
/// سكريبت جويستيك افتراضي لشاشات اللمس (UI Joystick)
/// خفيف جداً، لا يستهلك ذاكرة (Zero GC Allocation)، ويعمل باللمس على الموبايل وبفأرة الكمبيوتر داخل المحرر.
/// </summary>
public class VirtualJoystick : MonoBehaviour, IPointerDownHandler, IDragHandler, IPointerUpHandler
{
    [Header("UI Elements")]
    [Tooltip("خلفية الجويستيك (الدائرة الكبيرة)")]
    [SerializeField] private RectTransform joystickBackground;

    [Tooltip("مقبض الجويستيك الداخلي (الدائرة الصغيرة التي تتحرك مع الإصبع)")]
    [SerializeField] private RectTransform joystickHandle;

    [Header("Settings")]
    [Tooltip("أقصى مسافة يتحركها المقبض عن المركز")]
    [SerializeField] private float handleLimit = 80f;

    // الاتجاه الناتج (-1 إلى 1 على المحورين X و Y)
    private Vector2 inputVector = Vector2.zero;

    public float Horizontal => inputVector.x;
    public float Vertical => inputVector.y;
    public Vector2 Direction => inputVector;

    private void Awake()
    {
        // إذا لم يتم تحديد الخلفية في الـ Inspector، نأخذ RectTransform لهذا الـ Object تلقائياً
        if (joystickBackground == null)
        {
            joystickBackground = GetComponent<RectTransform>();
        }
    }

    public void OnPointerDown(PointerEventData eventData)
    {
        OnDrag(eventData);
    }

    public void OnDrag(PointerEventData eventData)
    {
        if (joystickBackground == null || joystickHandle == null) return;

        // تحويل نقطة اللمس على الشاشة إلى إحداثيات محلية داخل خلفية الجويستيك
        if (RectTransformUtility.ScreenPointToLocalPointInRectangle(
            joystickBackground, 
            eventData.position, 
            eventData.pressEventCamera, 
            out Vector2 localPoint))
        {
            // حساب المسافة والاتجاه من مركز الجويستيك
            Vector2 offset = Vector2.ClampMagnitude(localPoint, handleLimit);

            // تحريك المقبض
            joystickHandle.anchoredPosition = offset;

            // حساب قيمة الحركة المعيارية بين -1 و +1
            inputVector = offset / handleLimit;
        }
    }

    public void OnPointerUp(PointerEventData eventData)
    {
        // إعادة المقبض والقيم للصفر عند رفع الإصبع
        inputVector = Vector2.zero;
        if (joystickHandle != null)
        {
            joystickHandle.anchoredPosition = Vector2.zero;
        }
    }

    // دالة لتصفير الجويستيك في حال تم إيقاف تفعيله
    private void OnDisable()
    {
        inputVector = Vector2.zero;
        if (joystickHandle != null)
        {
            joystickHandle.anchoredPosition = Vector2.zero;
        }
    }
}
