import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const resources = {
  en: {
    translation: {
      feed_placeholder: 'No messages, write something...',
      input_placeholder: 'Write message...',
      url_copied: 'Link copied',

      tooltip_security:
        'Pictures should be identical for both participants, compare them to make sure the session is secure.',

      info_created: 'Session created, tap to copy session link',
      info_establishing: 'Establishing session...',
      info_established: 'Messages encrypted',

      action_retry: 'Try again',
      action_new_session: 'Create new session',

      error_connection_lost: 'Connection lost',
      error_server_unavailable: "Couldn't connect to the server",
      error_establishing_failed: "Couldn't establish secure session",

      close_codes: {
        '4003': 'Connection closed by remote peer',
        '4004': 'Session not found',
        '4005': 'Unable to create new session',
        '4100': 'Received unexpected message',
        '4101': 'Message decryption failed',
        '4102': 'Message encryption failed',
      },
    },
  },
  ru: {
    translation: {
      welcome_text: 'Начать сеанс',
      feed_placeholder: 'Сообщений нет, напишите что-нибудь...',
      input_placeholder: 'Написать сообщение...',
      url_copied: 'Адрес скопирован',

      tooltip_security:
        'Картинки должны быть идентичны для обоих участников, сравните их, чтобы убедиться в безопасности сеанса.',

      info_created: 'Сеанс создан, поделитесь ссылкой сеанса',
      info_establishing: 'Настройка сеанса...',
      info_established: 'Сообщения зашифрованы',

      action_retry: 'Попробовать снова',
      action_new_session: 'Создать новый сеанс',

      error_connection_lost: 'Соединение потеряно',
      error_server_unavailable: 'Не удалось подключиться к серверу',
      error_establishing_failed: 'Не удалось настроить безопасный сеанс',

      close_codes: {
        '4003': 'Соединение закрыто удаленным участником',
        '4004': 'Сеанс не найден',
        '4005': 'Не удалось создать новый сеанс',
        '4100': 'Получено некорректное сообщение',
        '4101': 'Не удалось зашифровать сообщение',
        '4102': 'Не удалось дешифровать сообщение',
      },
    },
  },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    resources,
  });

export default i18n;
