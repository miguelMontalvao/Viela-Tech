import { Link } from 'react-router-dom';
import { Signpost } from 'lucide-react';
import { EmptyState } from '../components/ui/Feedback';

export default function NotFoundPage() {
  return (
    <div className="container-app py-10">
      <EmptyState
        icone={Signpost}
        titulo="Essa viela não tem saída"
        acao={
          <Link
            to="/"
            className="inline-flex min-h-toque items-center rounded-xl bg-sky-700 px-5 font-semibold text-white hover:bg-sky-800 dark:bg-sky-600 dark:text-slate-950"
          >
            Voltar ao início
          </Link>
        }
      >
        A página que você procurou não existe ou mudou de endereço.
      </EmptyState>
    </div>
  );
}
