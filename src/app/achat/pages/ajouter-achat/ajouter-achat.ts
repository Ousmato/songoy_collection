import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { ReceptionRequest } from '../../models/reception.model';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { ArticleVariantDto, SimpleArticleResponse } from '../../../article/models/article.model';
import { CategoryMesure } from '../../../categorie/models/categorie.enum';
import { FournisseurResponse } from '../../../fournisseur/models/fournisseur.model';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { Entite, ModePaiement } from '../../../shared/model/util.enum';
import { Select2, Select2Data, Select2Option } from 'ng-select2-component';

interface ReceptionLine {
  variantId: number;
  article: string;
  reference: string;
  quantite: number;
  prixAchat: number;
  unite: CategoryMesure;
}

@Component({
  selector: 'app-ajouter-achat',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Select2, FloatingBackButton],
  templateUrl: './ajouter-achat.html',
  styleUrl: './ajouter-achat.css'
})
export class AjouterAchat implements OnInit {
  private readonly dependencies = inject(DependencyService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly user = getUserFromSessionStorage();
  readonly articles = signal<SimpleArticleResponse[]>([]);
  readonly fournisseurs = signal<FournisseurResponse[]>([]);
  readonly variants = signal<ArticleVariantDto[]>([]);
  articlesOptions: Select2Data = [];
  fournisseursOptions: Select2Data = [];
  variantsOptions: Select2Data = [];
  readonly lines = signal<ReceptionLine[]>([]);
  readonly loadingArticles = signal(false);
  readonly loadingFournisseurs = signal(false);
  readonly loading = computed(() => this.loadingArticles() || this.loadingFournisseurs());
  readonly loadingVariants = signal(false);
  readonly error = signal('');
  readonly lastRequest = signal<ReceptionRequest | null>(null);
  readonly submitting = signal(false);
  readonly total = computed(() => this.lines().reduce((sum, line) => sum + this.lineTotal(line), 0));
  paiementOptions = EnumMethodes.getEnumeratedKeyValue(ModePaiement)
  form!: FormGroup
  private variantsRequest?: Subscription;
  private idempotencyKey = '';
  articleId = 0;
  variantId = 0;
  quantity = 1;
  purchasePrice = 0;
  purchaseTotal = 0;
  priceMode: 'unitaire' | 'total' = 'unitaire';
  unit!: CategoryMesure
  

  ngOnInit(): void {
    this.loadForm()
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.lastRequest.set(null));
    this.loadCatalogue();
  }

  loadForm(): void {
    this.form = this.dependencies.fb.nonNullable.group({
    date: [this.localDate(), Validators.required],
    fournisseurMode: ['existant'],
    fournisseurId: [0, Validators.min(1)],
    nomFournisseur: [''],
    numeroFacture: [''],
    montantPaye: [0, [Validators.min(0), Validators.pattern(/^\d+$/)]],
    modePaiement: ['CASH', Validators.required]
  });
  }

  changeFournisseurMode(): void {
    const existing = this.form.controls['fournisseurMode'].value === 'existant';
    const id = this.form.controls['fournisseurId'];
    const name = this.form.controls['nomFournisseur'];

    id.setValidators(existing ? [Validators.required, Validators.min(1)] : []);
    name.setValidators(existing ? [] : [Validators.required, Validators.pattern(/\S/)]);
    id.reset(0);
    name.reset('');
    id.updateValueAndValidity();
    name.updateValueAndValidity();
    this.lastRequest.set(null);
  }

  loadCatalogue(): void {
    if (!this.user?.id) {
      this.error.set('Reconnectez-vous pour charger le catalogue.');
      return;
    }
    this.error.set('');
    this.loadArticles();
    this.loadFournisseurs();
  }

  loadArticles(): void {
    if (!this.user?.id) return;
    this.loadingArticles.set(true);
    this.dependencies.articleService.loadArticles(this.user.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingArticles.set(false))
    ).subscribe({
      next: articles => {
        this.articles.set(articles);
        this.articlesOptions = articles.map<Select2Option>((article, index) => ({
          id: `article-${article.id ?? index}-${index}`,
          value: article.id,
          label: this.articleLabel(article),
        })) as Select2Data;
      },
      error: () => this.error.set('Impossible de charger les articles. R?essayez.')
    });
  }

  loadFournisseurs(): void {
    if (!this.user?.id) return;
    this.loadingFournisseurs.set(true);
    this.dependencies.fournisseurService.loadFournisseurs(this.user.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingFournisseurs.set(false))
    ).subscribe({
      next: fournisseurs => {
        this.fournisseurs.set(fournisseurs);
        this.fournisseursOptions = fournisseurs.map<Select2Option>((supplier, index) => ({
          id: `supplier-${supplier.id ?? index}-${index}`,
          value: supplier.id,
          label: [supplier.nom, supplier.prenom].filter(Boolean).join(' ') || 'Fournisseur non défini',
        })) as Select2Data;
      },
      error: () => this.error.set('Impossible de charger les fournisseurs. R?essayez.')
    });
  }

  selectArticle(value: number): void {
    this.variantsRequest?.unsubscribe();
    this.articleId = Number(value);
    this.variantId = 0;
    this.variants.set([]);
    this.variantsOptions = [];
    this.lastRequest.set(null);

    const article = this.articles().find(item => item.id === this.articleId);

    if (article) {
      this.unit = EnumMethodes.getEnumValueByKey(CategoryMesure, article.categoryMesure)
        ?? article.categoryMesure;
      this.loadVariants(article.id);
    }
  }

  loadVariants(articleId: number): void {
    if (!this.user?.id) return;
    this.loadingVariants.set(true);
    this.error.set('');
    this.variantsRequest = this.dependencies.articleService.loadArticleVariants(articleId, this.user.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loadingVariants.set(false))
    ).subscribe({
      next: variants => {
        this.variants.set(variants);
        this.variantsOptions = variants.map<Select2Option>((variant, index) => ({
          id: `variant-${variant.id ?? index}-${index}`,
          value: variant.id,
          label: variant.reference || 'Variante non définie',
        })) as Select2Data;
      },
      error: () => this.error.set('Impossible de charger les variantes. S?lectionnez ? nouveau cet article.')
    });
  }

  articleLabel(article: SimpleArticleResponse): string {
    return [article.categoryNom || article.nom, article.typeNom].filter(Boolean).join(' — ');
  }

  addLine(): void {
    const variant = this.variants().find(item => item.id === Number(this.variantId));
    const article = this.articles().find(item => item.id === this.articleId);
    if (!variant || !article || this.loadingVariants()) {
      this.error.set('Choisissez un article et une variante.');
      return;
    }
    if (this.lines().some(line => line.variantId === variant.id)) {
      this.error.set('Cette variante est déjà présente. Modifiez sa quantité dans la liste.');
      return;
    }
    const line: ReceptionLine = {
      variantId: variant.id,
      article: this.articleLabel(article),
      reference: variant.reference,
      quantite: Number(this.quantity),
      prixAchat: this.finalUnitPrice,
      unite: this.unit,
    };

    if (!this.validLine(line)) {
      this.error.set('Vérifiez la quantité et le prix d\'achat.');
      return;
    }
    this.lines.update(lines => [...lines, line]);
    this.lastRequest.set(null);
    this.error.set('');
    this.variantId = 0;
    this.quantity = 1;
    this.purchasePrice = 0;
    this.purchaseTotal = 0;
  }

  get finalUnitPrice(): number {
    if (this.priceMode === 'unitaire') {
      return this.roundPrice(Number(this.purchasePrice));
    }
    const quantity = Number(this.quantity);
    return Number.isFinite(quantity) && quantity > 0
      ? this.roundPrice(Number(this.purchaseTotal) / quantity) : 0;
  }

  private roundPrice(value: number): number {
    return Number.isFinite(value) ? Math.round((value + Number.EPSILON) * 100) / 100 : 0;
  }

  updateLine(id: number, field: 'quantite' | 'prixAchat', value: number): void {
    const nextValue = field === 'prixAchat'
      ? this.roundPrice(Number(value))
      : Number(value);
    this.lines.update(lines => lines.map(line => line.variantId === id
      ? { ...line, [field]: nextValue } : line));
    this.lastRequest.set(null);
  }

  removeLine(id: number): void {
    this.lines.update(lines => lines.filter(line => line.variantId !== id));
    this.lastRequest.set(null);
  }



  validLine(line: ReceptionLine): boolean {
    return Number.isFinite(line.quantite) && line.quantite > 0
      && Number.isFinite(line.prixAchat) && line.prixAchat > 0
      && Number.isSafeInteger(Math.round(line.quantite * line.prixAchat));
  }

  lineTotal(line: ReceptionLine): number {
    return this.validLine(line) ? Math.round(line.quantite * line.prixAchat) : 0;
  }

  get remaining(): number {
    return this.total() - Number(this.form.controls['montantPaye'].value || 0);
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.lastRequest.set(null);
    const value = this.form.getRawValue();
    if (this.form.invalid || !this.lines().length 
      || this.lines().some(line => !this.validLine(line))
      || this.remaining < 0 || !Number.isSafeInteger(this.total())) {
      this.error.set('Vérifiez le fournisseur, la date, les lignes et le paiement : il ne doit pas dépasser le total.');
      return;
    }
    this.lastRequest.set({
      date: value.date,
      entite: EnumMethodes.getEnumKeyByValue(Entite, Entite.BOUTIQUE) as Entite,
      fournisseurId: value.fournisseurMode === 'existant' ? Number(value.fournisseurId) : null,
      nomFournisseur: value.fournisseurMode === 'libre' ? value.nomFournisseur.trim() : null,
      numeroFacture: value.numeroFacture.trim() || null,
      lignes: this.lines().map(({ variantId, quantite, prixAchat }) => ({ variantId, quantite, prixAchat })),
      paiement: value.montantPaye > 0
        ? { montant: Number(value.montantPaye), modePaiement: value.modePaiement as 'CASH' | 'MOBILE' | 'CHECKING' } : null
    });
    this.idempotencyKey = crypto.randomUUID();
    this.error.set('');
  }

  validateReception(): void {
    const request = this.lastRequest();
    if (!request || !this.user?.id || this.submitting()) {
      return;
    }

    this.submitting.set(true);
    this.error.set('');
    this.dependencies.responseService.showLoading('Enregistrement de la réception...');
    this.dependencies.receptionService.create(this.user.id, request, this.idempotencyKey).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.submitting.set(false);
        this.dependencies.responseService.closeLoading();
      })
    ).subscribe({
      next: response => {
        this.dependencies.responseService.showSuccessToast(response.message || 'Réception enregistrée.');
        // this.router.navigateByUrl('/admin/list-stock');
        this.form.reset()
        this.loadForm()
      },
      error: error => {
        this.dependencies.responseService.showErrorToast(error);
        this.error.set('La réception n’a pas pu être enregistrée. Corrigez les données puis réessayez.');
      }
    });
  }

  preparedSupplier(request: ReceptionRequest): string {
    if (request.nomFournisseur) return request.nomFournisseur;
    const supplier = this.fournisseurs().find(item => item.id === request.fournisseurId);
    return supplier ? [supplier.nom, supplier.prenom].filter(Boolean).join(' ') : 'Fournisseur enregistré';
  }

  preparedPaymentLabel(request: ReceptionRequest): string {
    const mode = request.paiement?.modePaiement;
    return mode ? EnumMethodes.getEnumValueByKey(ModePaiement, mode) ?? mode : 'Aucun paiement';
  }

  private localDate(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
