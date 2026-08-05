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
    'nav.about': 'Sobre', // TODO(pt-review)
    'nav.services': 'Serviços',
    'nav.contact': 'Contacte-nos', // TODO(pt-review)
    'nav.menuOpen': 'Abrir menu', // TODO(pt-review)
    'nav.menuClose': 'Fechar menu', // TODO(pt-review)
    'lang.switch': 'English',
    'theme.toggleLight': 'Ativar modo claro', // TODO(pt-review)
    'theme.toggleDark': 'Ativar modo escuro', // TODO(pt-review)

    'home.heading': 'Filmagem aérea profissional', // TODO(pt-review)
    'home.tagline': 'Imagens aéreas cinematográficas, em qualquer lugar.', // TODO(pt-review)
    'home.empty': 'Ainda não há projetos publicados nesta categoria.',

    'about.heading': 'Criador de voos impossíveis', // TODO(pt-review)
    'about.intro': 'Piloto de drones FPV e criador de conteúdo, baseado no Algarve, Portugal. Voo em FPV cinematográfico por espaços estreitos, edifícios e paisagens para captar perspetivas que uma câmara normal nunca conseguiria — voos rápidos, precisos e num só take, por lugares que pareciam impossíveis de filmar.', // TODO(pt-review)
    'about.services.heading': 'O que faço', // TODO(pt-review)
    'about.services.fpv': 'Voo FPV cinematográfico por espaços estreitos, edifícios e paisagens', // TODO(pt-review)
    'about.services.realEstate': 'Imobiliário',
    'about.services.hotels': 'Hotéis e resorts', // TODO(pt-review)
    'about.services.tourism': 'Promoção turística', // TODO(pt-review)
    'about.services.events': 'Eventos',
    'about.services.automotive': 'Conteúdo automóvel', // TODO(pt-review)
    'about.services.flythrough': 'Voos de alta velocidade, num só take, que mostram um local a partir de ângulos que nenhuma outra câmara alcança', // TODO(pt-review)
    'about.equipment.heading': 'Equipamento', // TODO(pt-review)
    'about.equipment.airUnit': 'DJI O4 / O3 Air Units',
    'about.equipment.frame': 'Drones FPV 3"–5" construídos à medida', // TODO(pt-review)
    'about.equipment.camera': 'Câmaras de ação (GoPro) para a melhor qualidade de imagem', // TODO(pt-review)
    'about.equipment.grading': 'Correção de cor no DaVinci Resolve', // TODO(pt-review)
    'about.social.stat': '~19.000 seguidores e mais de 1.400 publicações no Instagram', // TODO(pt-review)
    'about.social.cta': 'Segue-me', // TODO(pt-review)

    'work.watchHd': 'Ver em HD',
    'work.watchSd': 'Ver em SD', // TODO(pt-review)
    'work.play': 'Reproduzir', // TODO(pt-review)
    'work.pause': 'Pausar', // TODO(pt-review)
    'work.soundOn': 'Som: Ligado', // TODO(pt-review)
    'work.soundOff': 'Som: Desligado', // TODO(pt-review)
    'work.fullscreen': 'Ecrã inteiro', // TODO(pt-review)
    'work.about': 'Sobre o projeto', // TODO(pt-review)
    'work.gallery': 'Bastidores', // TODO(pt-review)
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
    'nav.work': 'Works',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.contact': 'Get in touch',
    'nav.menuOpen': 'Open menu',
    'nav.menuClose': 'Close menu',
    'lang.switch': 'Português',
    'theme.toggleLight': 'Switch to light mode',
    'theme.toggleDark': 'Switch to dark mode',

    'home.heading': 'Professional aerial cinematography',
    'home.tagline': 'Cinematic aerial footage, anywhere.',
    'home.empty': 'No projects published in this category yet.',

    'about.heading': 'Creator of impossible flights',
    'about.intro': "FPV drone pilot and content creator based in the Algarve, Portugal. I fly cinematic FPV through tight spaces, buildings, and landscapes to capture perspectives a normal camera never could — fast, precise, one-take flights through places that shouldn't be flyable.",
    'about.services.heading': 'What I do',
    'about.services.fpv': 'FPV cinematic flying through tight spaces, buildings, and landscapes',
    'about.services.realEstate': 'Real estate',
    'about.services.hotels': 'Hotels & resorts',
    'about.services.tourism': 'Tourism promotions',
    'about.services.events': 'Events',
    'about.services.automotive': 'Automotive content',
    'about.services.flythrough': 'High-speed, one-take fly-throughs that show a location from angles no other camera can reach',
    'about.equipment.heading': 'Equipment',
    'about.equipment.airUnit': 'DJI O4 / O3 Air Units',
    'about.equipment.frame': 'Custom-built 3"–5" FPV drones',
    'about.equipment.camera': 'Action cameras (GoPro) for top-quality footage',
    'about.equipment.grading': 'Colour grading in DaVinci Resolve',
    'about.social.stat': '~19,000 followers and 1,400+ posts on Instagram',
    'about.social.cta': 'Follow along',

    'work.watchHd': 'Watch in HD',
    'work.watchSd': 'Watch in SD',
    'work.play': 'Play',
    'work.pause': 'Pause',
    'work.soundOn': 'Sound: On',
    'work.soundOff': 'Sound: Off',
    'work.fullscreen': 'Full screen',
    'work.about': 'About this project',
    'work.gallery': 'Behind the scenes',
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
