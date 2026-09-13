import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryMesure } from '../../models/categorie.enum';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';

type CategorieVM = {
  id: number;
  nom: string;
  mesure: CategoryMesure;
  description: string;
  productCount: number;
  accent: string;
  icon: string;
  color: string;
};

@Component({
  selector: 'app-list-categorie',
  standalone: true,
  imports: [CommonModule, RouterModule, FloatingBackButton],
  templateUrl: './list-categorie.component.html',
  styleUrl: './list-categorie.component.css'
})
export class ListCategorieComponent {
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  categories = signal<CategorieVM[]>([
    {
      id: 1, nom: 'Tissu Gezlux', mesure: CategoryMesure.METER,
      description: 'Tissu Gezlux haut de gamme pour tenues de luxe et c&eacute;r&eacute;monies',
      productCount: 38, icon: 'fa-vest', color: '#A8892F', accent: 'gold'
    },
    {
      id: 2, nom: 'Tissu Casse', mesure: CategoryMesure.METER,
      description: 'Tissus Casse premium, finition soyeuse pour confections nobles',
      productCount: 45, icon: 'fa-scroll', color: '#6B4C2F', accent: 'gold'
    },
    {
      id: 3, nom: 'Bazin Getzner', mesure: CategoryMesure.METER,
      description: 'Bazin Getzner authentique &eacute;cru, la r&eacute;f&eacute;rence des bazins tiss&eacute;s',
      productCount: 62, icon: 'fa-gem', color: '#7A4FA8', accent: 'purple'
    },
    {
      id: 4, nom: 'Bazin Riche 1', mesure: CategoryMesure.METER,
      description: 'Bazin Riche niveau 1 — Qualit&eacute; sup&eacute;rieure broderie pr&eacute;cieuse',
      productCount: 28, icon: 'fa-sparkles', color: '#C9A24A', accent: 'gold'
    },
    {
      id: 5, nom: 'Bazin Riche 2', mesure: CategoryMesure.METER,
      description: 'Bazin Riche niveau 2 — Grande qualit&eacute; &agrave; prix accessible',
      productCount: 51, icon: 'fa-star', color: '#C97A2B', accent: 'orange'
    },
    {
      id: 6, nom: 'Bazin Riche 3', mesure: CategoryMesure.METER,
      description: 'Bazin Riche niveau 3 — Entr&eacute;e de gamme brod&eacute;e bon rapport qualit&eacute;/prix',
      productCount: 73, icon: 'fa-certificate', color: '#B5833A', accent: 'orange'
    },
    {
      id: 7, nom: 'Pagne Bogolan', mesure: CategoryMesure.METER,
      description: 'Pagnes Bogolan traditionnels motifs cisel&eacute;s, tissage artisanal',
      productCount: 33, icon: 'fa-shapes', color: '#4A7C59', accent: 'success'
    },
    {
      id: 8, nom: 'Pagne Tiss&eacute;', mesure: CategoryMesure.METER,
      description: 'Pagnes tiss&eacute;s main, collection patrimoine et mariage',
      productCount: 24, icon: 'fa-palette', color: '#2E7B7B', accent: 'teal'
    },
    {
      id: 9, nom: 'Tissu Pr&ecirc;t-&agrave;-porter', mesure: CategoryMesure.METER,
      description: 'Tissus pr&eacute;par&eacute;s pour confection prêt-à-porter rapide',
      productCount: 56, icon: 'fa-shirt', color: '#3B5C7A', accent: 'info'
    },
    {
      id: 10, nom: 'Robe', mesure: CategoryMesure.UNIT,
      description: 'Robes pr&ecirc;tes &agrave; porter, styles africains modernes & occasion (taille S→XL)',
      productCount: 89, icon: 'fa-person-dress', color: '#A84F7A', accent: 'purple'
    },
    {
      id: 11, nom: 'Abaya', mesure: CategoryMesure.UNIT,
      description: 'Abayas traditionnelles et modernes, qualit&eacute; premium (taille S→XL)',
      productCount: 41, icon: 'fa-person-hijab', color: '#7A4F2E', accent: 'teal'
    },
    {
      id: 12, nom: 'Sacs &agrave; main', mesure: CategoryMesure.UNIT,
      description: 'Sacs &agrave; main, pochettes et cabas assortis tenues c&eacute;r&eacute;monie',
      productCount: 67, icon: 'fa-bag-shopping', color: '#B85B3A', accent: 'info'
    },
    {
      id: 13, nom: 'Montres', mesure: CategoryMesure.UNIT,
      description: 'Montres femme &amp; homme, collections classiques et dor&eacute;es',
      productCount: 22, icon: 'fa-clock', color: '#5E534A', accent: 'info'
    },
    {
      id: 14, nom: 'Chaussures', mesure: CategoryMesure.UNIT,
      description: 'Babouches, sandales, escarpins assortis tenues (pointures 36→44)',
      productCount: 54, icon: 'fa-shoe-prints', color: '#3B5C7A', accent: 'info'
    },
    {
      id: 15, nom: 'Parfums', mesure: CategoryMesure.UNIT,
      description: 'Parfums et fragrances orientales &amp; occidentales pour femmes &amp; hommes',
      productCount: 71, icon: 'fa-spray-can-sparkles', color: '#7A4FA8', accent: 'purple'
    },
  ]).asReadonly();

}
