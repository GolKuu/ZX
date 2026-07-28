export const AUTH_MESSAGES = {
  unknown: 'Не удалось выполнить действие. Проверьте данные и попробуйте ещё раз.',
  login: 'Не удалось войти. Проверьте email и пароль.',
  register:
    'Если регистрация доступна для этого адреса, письмо с подтверждением уже отправлено.',
  recovery:
    'Если аккаунт с таким адресом существует, письмо для восстановления уже отправлено.',
  emailChange: 'Запрос принят. Проверьте текущую и новую почту для подтверждения.',
  passwordChanged: 'Пароль изменён. Теперь используйте новый пароль.',
} as const;

export function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[a-zа-яё]/u.test(password) &&
    /[A-ZА-ЯЁ]/u.test(password) &&
    /\d/u.test(password)
  );
}

export const PASSWORD_HINT = 'Минимум 8 символов, заглавная и строчная буквы, цифра.';
