// Cardápio estruturado conforme PDFs do Espaço Teixeira Machado.
// Os preços por pessoa são estimativas iniciais — a dona pode ajustar
// no dashboard admin (futura implementação) ou direto neste arquivo.

export type CardapioItem = {
  id: string;
  nome: string;
  descricao?: string;
  precoPorPessoa: number;
  categoria: string;
  obrigatorio?: boolean;
};

export type CardapioCategoria = {
  id: string;
  titulo: string;
  descricao: string;
  itens: CardapioItem[];
  multiplaEscolha: boolean; // se true, cliente pode marcar vários
};

export const CARDAPIO: CardapioCategoria[] = [
  {
    id: "mesa-mineira",
    titulo: "Mesa Mineira",
    descricao: "Entradas e petiscos típicos de Minas",
    multiplaEscolha: true,
    itens: [
      { id: "mandioca", nome: "Mandioca", precoPorPessoa: 4, categoria: "mesa-mineira" },
      { id: "torresmo", nome: "Torresmo", precoPorPessoa: 5, categoria: "mesa-mineira" },
      { id: "linguica", nome: "Linguiça", precoPorPessoa: 5, categoria: "mesa-mineira" },
      { id: "pastel-angu", nome: "Pastel de angu", precoPorPessoa: 4, categoria: "mesa-mineira" },
      { id: "croquete-milho", nome: "Croquete de milho", precoPorPessoa: 4, categoria: "mesa-mineira" },
      { id: "coxinha", nome: "Coxinha", precoPorPessoa: 4, categoria: "mesa-mineira" },
      { id: "quibe", nome: "Quibe", precoPorPessoa: 4, categoria: "mesa-mineira" },
      { id: "jilo", nome: "Jiló", precoPorPessoa: 3, categoria: "mesa-mineira" },
      { id: "cachaca-limao", nome: "Cachaça e limão", precoPorPessoa: 5, categoria: "mesa-mineira" },
    ],
  },
  {
    id: "churrasco",
    titulo: "Churrasco",
    descricao: "Carnes nobres preparadas pelos churrasqueiros da casa",
    multiplaEscolha: true,
    itens: [
      { id: "picanha", nome: "Picanha", precoPorPessoa: 18, categoria: "churrasco" },
      { id: "alcatra", nome: "Alcatra", precoPorPessoa: 14, categoria: "churrasco" },
      { id: "contrafile", nome: "Contrafilé", precoPorPessoa: 14, categoria: "churrasco" },
      { id: "fraldinha", nome: "Fraldinha", precoPorPessoa: 13, categoria: "churrasco" },
      { id: "copalombo", nome: "Copa lombo", precoPorPessoa: 12, categoria: "churrasco" },
      { id: "asa-coxinha", nome: "Meio e coxinha da asa", precoPorPessoa: 8, categoria: "churrasco" },
      { id: "pao-alho", nome: "Pão de alho", precoPorPessoa: 4, categoria: "churrasco" },
      { id: "coracao", nome: "Coração", precoPorPessoa: 7, categoria: "churrasco" },
    ],
  },
  {
    id: "acompanhamentos",
    titulo: "Acompanhamentos",
    descricao: "Itens do cardápio principal — recomendamos marcar todos",
    multiplaEscolha: true,
    itens: [
      { id: "arroz", nome: "Arroz branco", precoPorPessoa: 3, categoria: "acompanhamentos" },
      { id: "farofa", nome: "Farofa especial", precoPorPessoa: 3, categoria: "acompanhamentos" },
      { id: "salpicao", nome: "Salpicão", precoPorPessoa: 4, categoria: "acompanhamentos" },
      { id: "vinagrete", nome: "Vinagrete", precoPorPessoa: 3, categoria: "acompanhamentos" },
      {
        id: "salada-verde",
        nome: "Salada verde",
        descricao: "Alface, rúcula, tomate cereja e frutas",
        precoPorPessoa: 5,
        categoria: "acompanhamentos",
      },
    ],
  },
  {
    id: "bebidas",
    titulo: "Bebidas",
    descricao: "Refrigerante, água, sucos e chopp",
    multiplaEscolha: true,
    itens: [
      { id: "refri", nome: "Refrigerante Guaraná e Coca-Cola (Zero e Light)", precoPorPessoa: 8, categoria: "bebidas" },
      { id: "agua", nome: "Água, água com gás e aromatizada", precoPorPessoa: 4, categoria: "bebidas" },
      { id: "chopp", nome: "Chopp Minas Beer — 7 barris de 50L", precoPorPessoa: 25, categoria: "bebidas" },
      { id: "sucos", nome: "Sucos de laranja e abacaxi com hortelã", precoPorPessoa: 6, categoria: "bebidas" },
    ],
  },
  {
    id: "drinks-alcool",
    titulo: "JP Drinks — Com álcool",
    descricao: "Serviço de barman (somente no Espaço Teixeira Machado)",
    multiplaEscolha: true,
    itens: [
      { id: "caipirinha", nome: "Caipirinha", precoPorPessoa: 7, categoria: "drinks-alcool" },
      { id: "caipvodka-limao", nome: "Caipivodka de limão", precoPorPessoa: 8, categoria: "drinks-alcool" },
      { id: "caipvodka-maracuja", nome: "Caipivodka de maracujá", precoPorPessoa: 8, categoria: "drinks-alcool" },
      { id: "caipvodka-morango", nome: "Caipivodka de morango", precoPorPessoa: 9, categoria: "drinks-alcool" },
      { id: "caipvodka-abacaxi", nome: "Caipivodka de abacaxi", precoPorPessoa: 8, categoria: "drinks-alcool" },
      { id: "mojito", nome: "Mojito", precoPorPessoa: 10, categoria: "drinks-alcool" },
      { id: "gin-tonica", nome: "Gin tônica", precoPorPessoa: 14, categoria: "drinks-alcool" },
      { id: "moscow-mule", nome: "Moscow Mule", precoPorPessoa: 12, categoria: "drinks-alcool" },
      { id: "pina-colada", nome: "Piña colada", precoPorPessoa: 11, categoria: "drinks-alcool" },
    ],
  },
  {
    id: "drinks-sem-alcool",
    titulo: "JP Drinks — Sem álcool",
    descricao: "Opções alcoólicas-free para todas as idades",
    multiplaEscolha: true,
    itens: [
      { id: "caipirinha-sem", nome: "Caipirinha sem álcool", precoPorPessoa: 5, categoria: "drinks-sem-alcool" },
      { id: "morango-sem", nome: "Morango sem álcool", precoPorPessoa: 6, categoria: "drinks-sem-alcool" },
      { id: "espanhola", nome: "Espanhola", precoPorPessoa: 7, categoria: "drinks-sem-alcool" },
      { id: "lagoa-azul", nome: "Lagoa azul", precoPorPessoa: 7, categoria: "drinks-sem-alcool" },
      { id: "mojito-sem", nome: "Mojito sem álcool", precoPorPessoa: 7, categoria: "drinks-sem-alcool" },
      { id: "fusca-azul", nome: "Fusca azul", precoPorPessoa: 7, categoria: "drinks-sem-alcool" },
    ],
  },
];

// Procura um item por id em todas as categorias
export function findItem(id: string): CardapioItem | undefined {
  for (const cat of CARDAPIO) {
    const found = cat.itens.find((i) => i.id === id);
    if (found) return found;
  }
  return undefined;
}

// Calcula orçamento estimado
export function calcularOrcamento(itemIds: string[], guests: number) {
  const itens = itemIds.map(findItem).filter(Boolean) as CardapioItem[];
  const porPessoa = itens.reduce((acc, i) => acc + i.precoPorPessoa, 0);
  const total = porPessoa * guests;

  return {
    itens,
    porPessoa,
    total,
    // Política do PDF: criança até 7 não paga, 8-12 paga meia.
    // Nosso cálculo aqui é estimativa — a dona ajusta o valor final.
    obs: "Crianças até 7 anos não pagam. De 8 a 12 anos pagam meia. Valor final confirmado pela equipe.",
  };
}

export const RECURSOS_HUMANOS = [
  "Garçom",
  "Salgadeira",
  "Repositor",
  "Segurança",
  "Auxiliar de cozinha",
  "Copeiro",
  "Cozinheira",
  "Churrasqueiro (2)",
];

export const RECURSOS_HUMANOS_GRANDES = ["Banheirista", "Manobrista"]; // > 250 pessoas

export const MATERIAL_INCLUSO = [
  "Mesas",
  "Pratos",
  "Talheres",
  "Réchaud de inox",
  "Mesas e cadeiras (plástico ou ferro)",
  "Tampão de mesa",
  "Toalha grande",
  "Guardanapos",
  "Cobre mancha",
  "Bandeja para garçom",
  "Taças",
];
