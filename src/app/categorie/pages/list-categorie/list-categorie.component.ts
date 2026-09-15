import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryMesure, CategoryType } from '../../models/categorie.enum';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { DependencyService } from '../../../shared/utils/dependency';
import { CategoryDto } from '../../models/categorie.dto';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { Entite } from '../../../admin/model/admin.enum';


@Component({
  selector: 'app-list-categorie',
  standalone: true,
  imports: [CommonModule, RouterModule, FloatingBackButton],
  templateUrl: './list-categorie.component.html',
  styleUrl: './list-categorie.component.css'
})
export class ListCategorieComponent implements OnInit{

  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });


  user = getUserFromSessionStorage()

  dependency = inject(DependencyService)
  categories = signal<CategoryDto[]>([])
  search = signal('');
  filteredCategories = computed(() => {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.categories();
    return this.categories().filter(category =>
      `${category.nom} ${category.description} ${category.entite} ${category.type}`
        .toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(){
    if(this.user){
      this.dependency.categoryService.loadCategories(this.user.id).subscribe({
        next: (result) => {
          this.categories.set(result)
        },
        error: (err) => this.dependency.responseService.showErrorToast(err.error.message)
      })
    }
  }

  getUniteLabel(cat: CategoryDto): string {
    return EnumMethodes.getEnumValueByKey(CategoryMesure, cat.mesureCategory) as string;
  }
  getEntiteLabel(cat: CategoryDto): string{
   return EnumMethodes.getEnumValueByKey(Entite, cat.entite) as string
  }
  getTypeLabel(cat: CategoryDto): string{
   return EnumMethodes.getEnumValueByKey(CategoryType, cat.type) as string
  }

}

