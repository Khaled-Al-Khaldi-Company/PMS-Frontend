import axios from 'axios';

/** Translates common English error messages to user-friendly Arabic */
export function translateErrorMessage(message: string): string {
  if (!message) return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
  
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('invalid credentials') || lowerMsg.includes('unauthorized')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }
  if (lowerMsg.includes('failed to fetch') || lowerMsg.includes('network error')) {
    return 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الشبكة وتوافر الخدمة.';
  }
  if (lowerMsg.includes('forbidden') || lowerMsg.includes('access denied')) {
    return 'عفواً، ليس لديك الصلاحية الكافية لإجراء هذه العملية.';
  }
  if (lowerMsg.includes('bad request')) {
    return 'طلب غير صالح. يرجى مراجعة البيانات المدخلة.';
  }
  if (lowerMsg.includes('not found')) {
    return 'العنصر المطلوب غير موجود.';
  }
  if (lowerMsg.includes('conflict') || lowerMsg.includes('already exists')) {
    return 'هناك تعارض في البيانات، قد يكون العنصر موجوداً مسبقاً.';
  }
  if (lowerMsg.includes('internal server error')) {
    return 'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.';
  }
  if (lowerMsg.includes('cannot delete') || lowerMsg.includes('foreign key constraint')) {
    return 'لا يمكن الحذف لارتباط هذا العنصر ببيانات أخرى في النظام.';
  }

  return message; // returns original message (or already translated Arabic message)
}

/** Extract a human-readable API error message (Arabic-friendly) for alerts/toasts */
export function getApiErrorMessage(
  err: unknown,
  fallback = 'حدث خطأ غير متوقع. حاول مرة أخرى.',
): string {
  let rawMessage = '';

  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string | string[]; error?: string }
      | undefined;

    if (typeof data?.message === 'string' && data.message.trim()) {
      rawMessage = data.message;
    } else if (Array.isArray(data?.message) && data.message.length > 0) {
      rawMessage = data.message.join('\n');
    } else if (typeof data?.error === 'string' && data.error.trim()) {
      rawMessage = data.error;
    } else if (err.message) {
      rawMessage = err.message;
    }
  } else if (err instanceof Error && err.message) {
    rawMessage = err.message;
  }

  if (rawMessage) {
    return translateErrorMessage(rawMessage);
  }

  return fallback;
}

