import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select2, Select2Data, Select2Option } from 'ng-select2-component';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { ModePaiement, MotifDepenseAtelier } from '../../../shared/model/util.enum';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { RequestDepenseAtelier } from '../../model/depense.model';

@Component({
  selector: 'app-add-depense',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Select2],
  templateUrl: './add-depense.html',
  styleUrl: './add-depense.css',
})
export class AddDepense implements OnInit {
  @Output() submitDepense = new EventEmitter<RequestDepenseAtelier>();
  @Output() close = new EventEmitter<void>();

  user = getUserFromSessionStorage();
  dependenceService = inject(DependencyService);
  motifDepenseOptions = EnumMethodes.getEnumeratedKeyValue(MotifDepenseAtelier);
  modePaiementOptions = EnumMethodes.getEnumeratedKeyValue(ModePaiement);
  form!: FormGroup;
  personnelListOptionsData: Select2Data = [];
  submitted = signal(false);

  ngOnInit(): void {
    this.loadForm();
    this.loadPersonnel();
    this.watchMotif();
  }

  loadForm(): void {
    this.form = this.dependenceService.fb.group({
      date: ['', Validators.required],
      motif: ['AUTRE', Validators.required],
      montant: ['', [Validators.required, Validators.min(100)]],
      modePaiement: ['CASH', Validators.required],
      idPersonnel: [''],
      fournisseurNom: ['', Validators.required],
    });
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

  isSalaire(): boolean {
    return this.form?.value?.motif === 'SALAIRE';
  }

  requiresPersonnel(): boolean {
    return ['SALAIRE', 'TRANSPORT'].includes(this.form?.value?.motif);
  }

  submit(): void {
    this.submitted.set(true);
    this.applyConditionalValidators();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const request: RequestDepenseAtelier = {
      date: formValue.date,
      motif: formValue.motif,
      montant: Number(formValue.montant),
      modePaiement: formValue.modePaiement,
      idPersonnel: this.requiresPersonnel() ? Number(formValue.idPersonnel) : undefined,
      fournisseurNom: this.requiresPersonnel() ? undefined : formValue.fournisseurNom,
    };

    this.submitDepense.emit(request);
    console.log('RequestDepenseAtelier simulation', request);
  }

  private watchMotif(): void {
    this.form.get('motif')?.valueChanges.subscribe(() => this.applyConditionalValidators());
    this.applyConditionalValidators();
  }

  private applyConditionalValidators(): void {
    const personnelCtrl = this.form.get('idPersonnel');
    const fournisseurCtrl = this.form.get('fournisseurNom');

    if (this.requiresPersonnel()) {
      personnelCtrl?.setValidators([Validators.required]);
      fournisseurCtrl?.clearValidators();
      fournisseurCtrl?.setValue('', { emitEvent: false });
    } else {
      personnelCtrl?.clearValidators();
      personnelCtrl?.setValue('', { emitEvent: false });
      fournisseurCtrl?.setValidators([Validators.required]);
    }

    personnelCtrl?.updateValueAndValidity({ emitEvent: false });
    fournisseurCtrl?.updateValueAndValidity({ emitEvent: false });
  }
}
