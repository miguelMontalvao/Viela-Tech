import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Foto } from './Foto';

/*
 * Tela de login em duas colunas, adaptada do componente "sign-in" (21st.dev) para
 * JavaScript + Tailwind 3: campos de vidro, entrada com desfoque e foto com cartões.
 * Diferenças intencionais: sem login com Google nem depoimentos inventados.
 * Os cartões trazem informação real de saúde, e tudo funciona no teclado.
 */

/** Campo com efeito de vidro, rótulo e mensagem de erro ligados por aria. */
export function CampoVidro({ label, erro, dica, type = 'text', className = '', ...props }) {
  const id = useId();
  const [mostrar, setMostrar] = useState(false);
  const senha = type === 'password';
  const descricao = [dica && `${id}-dica`, erro && `${id}-erro`].filter(Boolean).join(' ') || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </label>
      {dica && (
        <p id={`${id}-dica`} className="mt-0.5 text-xs texto-suave">
          {dica}
        </p>
      )}
      <div
        className={`mt-1.5 rounded-xl border bg-white transition-colors focus-within:border-sky-600 focus-within:ring-4 focus-within:ring-sky-600/10
          dark:bg-slate-900 dark:focus-within:border-sky-400
          ${erro ? 'border-red-600 dark:border-red-400' : 'border-slate-300 dark:border-slate-600'}`}
      >
        <div className="relative">
          <input
            id={id}
            type={senha && mostrar ? 'text' : type}
            aria-invalid={erro ? true : undefined}
            aria-describedby={descricao}
            className={`min-h-12 w-full rounded-xl bg-transparent px-4 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none dark:text-slate-50 dark:placeholder:text-slate-400 ${senha ? 'pr-14' : ''}`}
            {...props}
          />
          {senha && (
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              aria-label={mostrar ? 'Esconder senha' : 'Mostrar senha'}
              aria-pressed={mostrar}
              className="absolute inset-y-0 right-1 flex min-w-toque items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {mostrar ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
      {erro && (
        <p id={`${id}-erro`} className="mt-1.5 text-sm font-medium text-red-700 dark:text-red-300">
          {erro}
        </p>
      )}
    </div>
  );
}

function CartaoInfo({ cartao, atraso }) {
  const { icone: Icone, titulo, texto, tom = 'bg-white dark:bg-slate-900' } = cartao;
  return (
    <div className={`animate-testimonial ${atraso} flex w-64 items-start gap-3 rounded-2xl p-4 ${tom}`}>
      {Icone && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          <Icone className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <div className="text-sm leading-snug">
        <p className="font-display font-semibold text-slate-900 dark:text-white">{titulo}</p>
        <p className="mt-1 text-slate-700 dark:text-slate-300">{texto}</p>
      </div>
    </div>
  );
}

/**
 * Moldura da tela de login.
 * @param {{ titulo: React.ReactNode, descricao?: React.ReactNode, foto?: string, fotoAlt?: string,
 *   legendaFoto?: React.ReactNode, cartoes?: Array, children: React.ReactNode }} props
 */
export function SignInPage({ titulo, descricao, foto = 'rocinha-por-do-sol', fotoAlt = '', legendaFoto, cartoes = [], children }) {
  const atrasos = ['animate-delay-1000', 'animate-delay-1200', 'animate-delay-1400'];
  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col md:flex-row">
      {/* Faixa da foto no celular */}
      <div className="relative h-36 overflow-hidden md:hidden">
        <Foto nome={foto} alt="" sizes="100vw" prioridade imgClassName="h-full w-full object-cover object-[50%_30%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/10 to-transparent dark:from-noite" />
      </div>

      {/* Coluna do formulário */}
      <section className="flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:px-8 md:items-center md:py-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-3xl font-semibold tracking-tight md:text-4xl">{titulo}</h1>
            {descricao && <p className="animate-element animate-delay-200 text-lg texto-suave">{descricao}</p>}
            {children}
          </div>
        </div>
      </section>

      {/* Coluna da foto com cartões (tablet e desktop) */}
      <section className="relative hidden flex-1 p-4 md:block" aria-label={legendaFoto ? undefined : 'Imagem ilustrativa'}>
        <div className="animate-slide-right animate-delay-300 absolute inset-4 overflow-hidden rounded-3xl bg-noite">
          <Foto nome={foto} alt={fotoAlt} sizes="50vw" prioridade imgClassName="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {legendaFoto && <p className="absolute left-6 top-6 max-w-xs text-sm font-medium text-white/90">{legendaFoto}</p>}
        </div>
        {cartoes.length > 0 && (
          <div className="absolute bottom-10 left-1/2 flex w-full -translate-x-1/2 justify-center gap-4 px-8">
            <CartaoInfo cartao={cartoes[0]} atraso={atrasos[0]} />
            {cartoes[1] && (
              <div className="hidden xl:flex">
                <CartaoInfo cartao={cartoes[1]} atraso={atrasos[1]} />
              </div>
            )}
            {cartoes[2] && (
              <div className="hidden 2xl:flex">
                <CartaoInfo cartao={cartoes[2]} atraso={atrasos[2]} />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

/** Botão principal do login (mesmo estilo do componente original, com contraste AA). */
export function BotaoLogin({ children, carregando, className = '', ...props }) {
  return (
    <button
      type="submit"
      disabled={carregando}
      aria-busy={carregando || undefined}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-700 font-semibold text-white transition-colors hover:bg-sky-800 disabled:cursor-wait disabled:opacity-70 dark:bg-sky-500 dark:text-slate-950 dark:hover:bg-sky-400 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
