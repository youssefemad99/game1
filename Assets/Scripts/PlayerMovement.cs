using UnityEngine;

/// <summary>
/// سكريبت حركة اللاعب من منظور أول (First Person Movement).
/// يعتمد على CharacterController ويستقبل المدخلات من VirtualJoystick.
/// يدعم أزرار الكيبورد (WASD / الأسهم) داخل محرر Unity لتسهيل التجربة السريعة.
/// خفيف جداً ومناسب للأجهزة الضعيفة (مضبوط على 30 فريم).
/// </summary>
[RequireComponent(typeof(CharacterController))]
public class PlayerMovement : MonoBehaviour
{
    [Header("Components")]
    [Tooltip("مكون CharacterController المسؤول عن تحريك اللاعب والاصطدام")]
    [SerializeField] private CharacterController controller;

    [Tooltip("سكريبت الجويستيك الافتراضي في الـ Canvas")]
    [SerializeField] private VirtualJoystick joystick;

    [Header("Movement Settings")]
    [Tooltip("سرعة مشي اللاعب")]
    [SerializeField] private float moveSpeed = 4.0f;

    [Tooltip("قوة الجاذبية الأرضية لسحب اللاعب للأسفل")]
    [SerializeField] private float gravity = -9.81f;

    [Header("Performance")]
    [Tooltip("تحديد معدل الإطارات على الموبايل لتوفير البطارية ومنع التقطيع")]
    [SerializeField] private int targetFrameRate = 30;

    private float verticalVelocity = 0f;

    private void Awake()
    {
        if (controller == null)
        {
            controller = GetComponent<CharacterController>();
        }

        // قفل الفريمات عند 30 فريم كما هو محدد في وثيقة اللعبة للأجهزة الضعيفة
        Application.targetFrameRate = targetFrameRate;
    }

    private void Update()
    {
        MovePlayer();
    }

    private void MovePlayer()
    {
        // 1. قراءة الاتجاه من الجويستيك
        float horizontal = joystick != null ? joystick.Horizontal : 0f;
        float vertical = joystick != null ? joystick.Vertical : 0f;

        // دعم الكيبورد أثناء التجربة على الكمبيوتر داخل Unity Editor
#if UNITY_EDITOR
        if (Mathf.Approximately(horizontal, 0f) && Mathf.Approximately(vertical, 0f))
        {
            horizontal = Input.GetAxisRaw("Horizontal");
            vertical = Input.GetAxisRaw("Vertical");
        }
#endif

        // 2. حساب اتجاه الحركة بالنسبة لاتجاه وجه اللاعب
        Vector3 direction = (transform.right * horizontal) + (transform.forward * vertical);

        // منع زيادة السرعة عند المشي بالزاوية (Diagonal Movement)
        if (direction.sqrMagnitude > 1f)
        {
            direction.Normalize();
        }

        // تطبيق حركة المشي الأفقية
        controller.Move(direction * (moveSpeed * Time.deltaTime));

        // 3. حساب وتطبيق الجاذبية الأرضية
        if (controller.isGrounded && verticalVelocity < 0f)
        {
            // قيمة صغيرة لضمان التصاق اللاعب بالأرض والسلالم
            verticalVelocity = -2f;
        }
        else
        {
            verticalVelocity += gravity * Time.deltaTime;
        }

        // تطبيق الحركة الرأسية (السقوط للأسفل)
        Vector3 verticalMovement = new Vector3(0f, verticalVelocity, 0f);
        controller.Move(verticalMovement * Time.deltaTime);
    }
}
