export const languages = {
  pt: 'Português',
  en: 'English',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'pt';

// Every key below must exist in both `pt` and `en` — enforced by
// `npm run check:i18n` (scripts/check-i18n.mjs). A key present in only one
// locale is a bug, per CLAUDE.md.
//
// The PT copy was written by a non-native speaker and is pending review by
// the owner. Lines flagged `// TODO(pt-review)` are the ones worth a second
// look rather than silently rewriting.
export const ui = {
  pt: {
    'nav.home': 'Início',
    'nav.work': 'Trabalhos',
    'nav.services': 'Serviços',
    'lang.switch': 'English',

    'home.heading': 'Filmagem aérea profissional', // TODO(pt-review)
    'home.empty': 'Ainda não há projetos publicados nesta categoria.',

    'work.back': 'Voltar aos trabalhos',
    'work.watchHd': 'Ver em HD',
    'work.notFound': 'Projeto não encontrado.',

    'gallery.passcodeHeading': 'Esta galeria está protegida',
    'gallery.passcodeLabel': 'Código de acesso',
    'gallery.passcodeSubmit': 'Entrar',
    'gallery.passcodeError': 'Código incorreto. Tente novamente.',
    'gallery.locked': 'Demasiadas tentativas. Tente novamente mais tarde.',
    'gallery.notFound': 'Galeria não encontrada.',
    'gallery.welcome': 'Bem-vindo à sua galeria',

    'services.heading': 'Serviços',
    'services.comingSoon': 'Marcação de sessões em breve.', // TODO(pt-review)
  },
  en: {
    'nav.home': 'Home',
    'nav.work': 'Work',
    'nav.services': 'Services',
    'lang.switch': 'Português',

    'home.heading': 'Professional aerial cinematography',
    'home.empty': 'No projects published in this category yet.',

    'work.back': 'Back to work',
    'work.watchHd': 'Watch in HD',
    'work.notFound': 'Project not found.',

    'gallery.passcodeHeading': 'This gallery is protected',
    'gallery.passcodeLabel': 'Passcode',
    'gallery.passcodeSubmit': 'Enter',
    'gallery.passcodeError': 'Incorrect passcode. Please try again.',
    'gallery.locked': 'Too many attempts. Please try again later.',
    'gallery.notFound': 'Gallery not found.',
    'gallery.welcome': 'Welcome to your gallery',

    'services.heading': 'Services',
    'services.comingSoon': 'Booking coming soon.',
  },
} as const;

export type UiKey = keyof (typeof ui)['en'];
