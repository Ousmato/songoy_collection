import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select2, Select2Data, Select2Option } from 'ng-select2-component';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { ModePaiement, MotifDepense } from '../../../shared/model/util.enum';
import { Entite } from '../../../admin/model/admin.enum';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { DepenseRequest } from '../../model/depense.model';

@Component({
  selector: 'app-add-depense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, Select2, FloatingBackButton],
  templateUrl: './add-depense.html',
  styleUrl: './add-depense.css',
})
export class AddDepense implements OnInit {
  user = getUserFromSessionStorage();
  dependenceService = inject(DependencyService);
  private readonly router = inject(Router);
  motifDepenseOptions = EnumMethodes.getEnumeratedKeyValue(MotifDepense);
  modePaiementOptions = EnumMethodes.getEnumeratedKeyValue(ModePaiement);
  entiteOptions = EnumMethodes.getEnumeratedKeyValue(Entite).filter(e => e.key != 'GLOBAL');
  form!: FormGroup;
  personnelListOptionsData: Select2Data = [];
  fournisseurListOptionsData: Select2Data = [];
  submitted = signal(false);
  submitting = signal(false);
  error = signal('');

  ngOnInit(): void {
    this.loadForm();
    this.loadPersonnel();
    this.loadFournisseurs();
    this.watchMotif();
  }

  loadForm(): void {
    this.form = this.dependenceService.fb.group({
      date: [this.todayInput(), Validators.required],
      motif: ['', Validators.required],
      entite: ['', Validators.required],
      libelle: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      modePaiement: ['CASH', Validators.required],
      idPersonnel: [''],
      fournisseurMode: ['existant', Validators.required],
      fournisseurId: [0],
      fournisseurNom: [''],
    });
  }

  private todayInput(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }

  loadPersonnel(): void {
    if (!this.user) return;

    this.dependenceService.adminService.loadPersonnel(this.user.id).subscribe({
      next: (response) => {
        this.personnelListOptionsData = response.map<Select2Option>((person, index) => ({
          id: `person-${person.id ?? index}-${index}`,
          value: person.id ?? '',
          label: `${person.nom ?? ''} ${person.prenom ?? ''}`.trim() || 'Personnel non definit',
        })) as Select2Data;
      },
    });
  }

  loadFournisseurs(): void {
    if (!this.user?.id) return;

    this.dependenceService.fournisseurService.loadFournisseurs(this.user.id).subscribe({
      next: (fournisseurs) => {
        this.fournisseurListOptionsData = fournisseurs.map<Select2Option>((fournisseur, index) => ({
          id: `fournisseur-${fournisseur.id ?? index}-${index}`,
          value: fournisseur.id ?? '',
          label: `${fournisseur.nom ?? ''} ${fournisseur.prenom ?? ''}`.trim()
            || 'Fournisseur sans nom',
        })) as Select2Data;
      },
    });
  }

  requiresPersonnel(): boolean {
    return ['SALAIRE'].includes(this.form?.value?.motif);
  }

  control(name: string) {
    return this.form?.get(name);
  }

  changeFournisseurMode(): void {
    this.applyConditionalValidators();
  }

  submit(): void {
    this.error.set('');
    this.submitted.set(true);
    this.applyConditionalValidators();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.user?.id) {
      this.error.set('Reconnectez-vous pour enregistrer la dépense.');
      return;
    }

    const value = this.form.getRawValue();
    const request: DepenseRequest = {
      date: value.date,
      motif: value.motif,
      entite: value.entite,
      libelle: String(value.libelle ?? '').trim(),
      montant: Number(value.montant),
      modePaiement: value.modePaiement,
      personnelBeneficiaireId: this.requiresPersonnel()
        ? Number(value.idPersonnel)
        : undefined,
      fournisseurId: !this.requiresPersonnel() && value.fournisseurMode === 'existant'
        ? Number(value.fournisseurId)
        : undefined,
      nomFournisseur: !this.requiresPersonnel() && value.fournisseurMode === 'libre'
        ? value.fournisseurNom.trim()
        : undefined,
    };

    this.submitting.set(true);
    this.dependenceService.depenseService.addDepense(this.user.id, request).subscribe({
      next: response => {
        this.submitting.set(false);
        this.dependenceService.responseService.showSuccessToast(
          response?.message ?? 'Dépense enregistrée avec succès.',
        );
        // this.router.navigate(['/admin/list-depenses-atelier']);
      },
      error: error => {
        this.submitting.set(false);
        const message = this.errorMessage(error);
        this.error.set(message);
        this.dependenceService.responseService.showErrorToast(message);
      },
    });

  }

  private errorMessage(error: any): string {
    const body = error?.error;
    if (typeof body?.message === 'string' && body.message.trim()) {
      return body.message;
    }

    if (body && typeof body === 'object') {
      const fieldMessage = Object.values(body).find(
        value => typeof value === 'string' && value.trim(),
      );
      if (typeof fieldMessage === 'string') {
        return fieldMessage;
      }
    }

    return 'Impossible d?enregistrer la d?pense.';
  }

  private watchMotif(): void {
    this.form.get('motif')?.valueChanges.subscribe(() => this.applyConditionalValidators());
    this.applyConditionalValidators();
  }

  private applyConditionalValidators(): void {
    const personnelCtrl = this.form.get('idPersonnel');
    const fournisseurModeCtrl = this.form.get('fournisseurMode');
    const fournisseurIdCtrl = this.form.get('fournisseurId');
    const fournisseurCtrl = this.form.get('fournisseurNom');

    if (this.requiresPersonnel()) {
      personnelCtrl?.setValidators([Validators.required]);
      fournisseurModeCtrl?.clearValidators();
      fournisseurIdCtrl?.clearValidators();
      fournisseurCtrl?.clearValidators();
      fournisseurCtrl?.setValue('', { emitEvent: false });
      fournisseurIdCtrl?.setValue(0, { emitEvent: false });
    } else {
      personnelCtrl?.clearValidators();
      personnelCtrl?.setValue('', { emitEvent: false });
      fournisseurModeCtrl?.setValidators([Validators.required]);

      if (fournisseurModeCtrl?.value === 'existant') {
        fournisseurIdCtrl?.setValidators([Validators.required, Validators.min(1)]);
        fournisseurCtrl?.clearValidators();
        fournisseurCtrl?.setValue('', { emitEvent: false });
      } else {
        fournisseurIdCtrl?.clearValidators();
        fournisseurIdCtrl?.setValue(0, { emitEvent: false });
        fournisseurCtrl?.setValidators([Validators.required, Validators.pattern(/\S/)]);
      }
    }

    personnelCtrl?.updateValueAndValidity({ emitEvent: false });
    fournisseurModeCtrl?.updateValueAndValidity({ emitEvent: false });
    fournisseurIdCtrl?.updateValueAndValidity({ emitEvent: false });
    fournisseurCtrl?.updateValueAndValidity({ emitEvent: false });
  }
}
