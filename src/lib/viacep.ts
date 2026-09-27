export interface ViaCepResponse {
  bairro?: string;
  cep?: string;
  complemento?: string;
  erro?: boolean;
  localidade?: string;
  logradouro?: string;
  uf?: string;
}

export async function lookupCep(cep: string): Promise<ViaCepResponse | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) {
    return null;
  }
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as ViaCepResponse;
    if (data.erro) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}
