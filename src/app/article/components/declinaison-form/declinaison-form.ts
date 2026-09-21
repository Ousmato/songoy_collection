import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ArticleAttributeDto, DeclinaisonDto, DeclinaisonRequestDto } from '../../models/article.model';
import { HeicConvertService } from '../../../shared/service/heic-covert.service';

export interface DeclinaisonSubmission {
  request: DeclinaisonRequestDto;
  image: File | null;
}

@Component({
  selector: 'app-declinaison-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './declinaison-form.html',
  styleUrl: './declinaison-form.css',
})
export class DeclinaisonFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly imageProcessor = inject(HeicConvertService);

  @Input() attributes: ArticleAttributeDto[] = [];
  @Input() entityLabel = 'déclinaison';
  @Input() declinaison: DeclinaisonDto | null = null;
  @Input() characteristicsEditable = true;
  @Input() currentImageUrl: string | null = null;
  @Input() saving = false;
  @Input() blocked = false;
  @Input() resetKey = 0;
  @Output() save = new EventEmitter<DeclinaisonSubmission>();
  @Output() cancel = new EventEmitter<void>();
  @Output() imageProcessingChange = new EventEmitter<boolean>();

  readonly form: FormGroup = this.fb.group({ attributs: this.fb.group({}) });
  readonly processingImage = signal(false);
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attributes'] || changes['declinaison']) this.buildAttributeControls();
    if (changes['resetKey'] && !changes['resetKey'].firstChange) this.resetDraft();
  }

  control(attributeId: number) {
    return this.form.get(`attributs.${attributeId}`);
  }

  inputType(type: string): 'text' | 'number' | 'date' {
    if (type === 'NUMBER') return 'number';
    if (type === 'DATE') return 'date';
    return 'text';
  }

  submit(): void {
    const validateCharacteristics = !this.declinaison || this.characteristicsEditable;
    if (validateCharacteristics) this.form.markAllAsTouched();
    if (
      (validateCharacteristics && this.form.invalid)
      || this.saving
      || this.blocked
      || this.processingImage()
    ) return;

    const rawValues = this.form.get('attributs')?.getRawValue() as Record<string, unknown>;
    const attributs: Record<number, string> = {};
    Object.entries(rawValues ?? {}).forEach(([attributeId, value]) => {
      const normalized = String(value ?? '').trim();
      if (normalized) attributs[Number(attributeId)] = normalized;
    });

    this.save.emit({ request: { attributs }, image: this.imageFile });
  }

  async onImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.clearImage();
    const isImage = file.type.startsWith('image/') || this.imageProcessor.isHeic(file);
    if (!isImage) {
      this.imageError = 'Sélectionnez un fichier image valide.';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.imageError = 'L’image ne doit pas dépasser 5 Mo.';
      input.value = '';
      return;
    }

    this.processingImage.set(true);
    this.imageProcessingChange.emit(true);
    try {
      const prepared = await this.imageProcessor.processFileForPreview(file, {
        toType: 'image/jpeg', quality: 0.82, maxWidth: 1600, maxHeight: 1600,
      });
      this.imageFile = prepared.file;
      this.imagePreview = prepared.url;
    } catch {
      this.imageError = 'Impossible de préparer cette image.';
      input.value = '';
    } finally {
      this.processingImage.set(false);
      this.imageProcessingChange.emit(false);
      input.value = '';
    }
  }

  removeImage(input?: HTMLInputElement): void {
    this.clearImage();
    if (input) input.value = '';
  }

  private buildAttributeControls(): void {
    const controls: Record<string, FormControl<string | null>> = {};
    const initialValues = this.declinaison?.attributs ?? {};
    for (const attribute of this.attributes ?? []) {
      controls[String(attribute.id)] = new FormControl(
        initialValues[attribute.id] ?? '', attribute.obligatoire ? Validators.required : []
      );
    }
    this.form.setControl('attributs', new FormGroup(controls));
  }

  private resetDraft(): void {
    this.form.reset();
    this.clearImage();
  }

  private clearImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.imageError = null;
  }
}
