export interface ArticleType {
  id?: number;
  nom: string;
  description: string;
}

export interface ArticleTypeResponse {
  id: number;
  nom: string;
  description: string;
  quantity: number;
}

export const articleTypes: ArticleTypeResponse[] = [
    {
      id: 1,
      nom: 'GezLux',
      description: 'GezLux est un type d\'article',
      quantity: 10,

    },
    {
      id: 2,
      nom: 'Getzner',
      description: 'Getzner est un type d\'article',
      quantity: 5,
    },
    {
      id: 3,
      nom: 'Casse',
      description: 'Casse est un type d\'article',
      quantity: 8,
    },
    {
      id: 4,
      nom: 'Robe pour femme',
      description: 'Robe pour femme est un type d\'article',
      quantity: 12,
    },
    {
      id: 5,
      nom: 'Riche premiere',
      description: 'Riche premiere est un type d\'article',
      quantity: 7,
    },
    {
      id: 6,
      nom: 'Riche deuxieme',
      description: 'Riche deuxieme est un type d\'article',
      quantity: 3,
    },
  ];
