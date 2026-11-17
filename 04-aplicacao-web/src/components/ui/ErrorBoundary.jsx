import { Component } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';

/**
 * Evita a tela em branco quando uma página não carrega (por exemplo, sem internet
 * ou logo depois de uma nova publicação) ou quando um componente falha.
 * Error boundaries ainda precisam ser componentes de classe no React 18.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('Falha ao exibir a página.', erro, info?.componentStack);
  }

  componentDidUpdate(anteriores) {
    // Ao trocar de rota, tenta exibir a nova página normalmente.
    if (this.state.erro && anteriores.chave !== this.props.chave) this.setState({ erro: null });
  }

  render() {
    if (!this.state.erro) return this.props.children;
    const semRede = typeof navigator !== 'undefined' && navigator.onLine === false;
    return (
      <div role="alert" className="container-app flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <WifiOff className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-semibold">Não deu para abrir esta página</h1>
        <p className="mt-2 max-w-md texto-suave">
          {semRede
            ? 'Parece que o aparelho está sem internet. Triagens já enviadas ou guardadas no aparelho não foram perdidas.'
            : 'Algo deu errado ao carregar. Recarregar costuma resolver.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex min-h-toque items-center gap-2 rounded-xl bg-sky-700 px-5 font-semibold text-white hover:bg-sky-800 dark:bg-sky-600 dark:text-slate-950 dark:hover:bg-sky-500"
        >
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
          Recarregar
        </button>
      </div>
    );
  }
}
