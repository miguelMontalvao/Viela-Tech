/* Ícones da Liquid Navbar (Nimbus UI), separados para o cabeçalho não carregar o WebGL no celular. */
const ICONE = (d) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {d}
  </svg>
);

export const NimbusIcons = {
  home: ICONE(
    <>
      <path d="M3.5 11.2 12 4l8.5 7.2" />
      <path d="M6 9.6V20h12V9.6" />
      <path className="nv-door" d="M10 20v-5h4v5Z" />
    </>,
  ),
  globe: ICONE(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 2.6 14.6 0 17M12 3.5c-2.6 2.4-2.6 14.6 0 17" />
    </>,
  ),
  drop: ICONE(<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5Z" />),
  user: ICONE(
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20c1.2-3.4 4-5 7.2-5s6 1.6 7.2 5" />
    </>,
  ),
  clipboard: ICONE(
    <>
      <rect x="6" y="4.5" width="12" height="16" rx="2" />
      <path d="M9.5 4.5h5v2.5h-5zM9 12h6M9 15.5h4" />
    </>,
  ),
  list: ICONE(<path d="M8.5 7h11M8.5 12h11M8.5 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01" />),
  chart: ICONE(<path d="M4 20V10M10 20V4M16 20v-7M21 20H3" />),
};
