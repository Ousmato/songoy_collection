export interface ArticleType {
  id?: number;
  nom: string;
  description: string;
}

export interface ArticleTypeResponse {
  id: number;
  nom: string;
  description: string;
  quantity?: number;
}
