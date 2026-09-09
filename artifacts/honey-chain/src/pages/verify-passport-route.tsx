import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Copy, ShieldCheck } from 'lucide-react';
import { VerifyPassportContent } from './product-pages';

type Proof = {
  status?: string;
  message?: string;
  blockchainTxHash?: string;
  blockchainBlockNumber?: number;
  blockchainNetwork?: string;
  blockchainContractAddress?: string;
};

function useBlockchainProof(batchId: string) {
  return useQuery<Proof>({
    queryKey: ['/api/verify', batchId, 'blockchain'],
    queryFn: async () => {
      const response = await fetch(`/api/verify/${encodeURIComponent(batchId)}/blockchain`);
      if (!response.ok) throw new Error('Blockchain proof unavailable');
      return response.json() as Promise<Proof>;
    },
    enabled: !!batchId,
  });
}

function BlockchainProofCard({ proof, loading }: { proof?: Proof; loading: boolean }) {
  const verified = proof?.status === 'VERIFIED';
  const copyHash = () => {
    if (proof?.blockchainTxHash) void navigator.clipboard?.writeText(proof.blockchainTxHash);
  };

  return (
    <section className="mx-auto max-w-5xl px-5 pt-8 sm:px-8" data-testid="card-blockchain-proof">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Blockchain verification
            </div>
            <p className="mt-2 font-semibold">
              {loading ? 'Checking blockchain proof...' : verified ? 'Blockchain verified' : proof?.message ?? 'Blockchain verification unavailable'}
            </p>
          </div>
          <span className="font-mono-ui text-[10px] uppercase tracking-wide text-muted-foreground">
            {loading ? 'Checking' : proof?.status ?? 'Unavailable'}
          </span>
        </div>
        {verified && (
          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Transaction hash</p>
              <button type="button" onClick={copyHash} className="mt-1 flex max-w-full items-center gap-2 font-mono-ui text-xs text-primary" title="Copy transaction hash">
                <span className="truncate">{proof.blockchainTxHash}</span>
                <Copy className="size-3.5 shrink-0" />
              </button>
            </div>
            <div><p className="text-xs text-muted-foreground">Block</p><p className="mt-1 font-mono-ui text-xs">{proof.blockchainBlockNumber ?? '-'}</p></div>
            <div><p className="text-xs text-muted-foreground">Network</p><p className="mt-1 font-mono-ui text-xs">{proof.blockchainNetwork ?? '-'}</p></div>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">Contract address</p><p className="mt-1 truncate font-mono-ui text-xs" title={proof.blockchainContractAddress}>{proof.blockchainContractAddress ?? '-'}</p></div>
          </div>
        )}
      </div>
    </section>
  );
}

export function VerifyPage() {
  const { batchId = '' } = useParams<{ batchId: string }>();
  const proof = useBlockchainProof(batchId);
  return <><BlockchainProofCard proof={proof.data} loading={proof.isLoading} /><VerifyPassportContent /></>;
}
