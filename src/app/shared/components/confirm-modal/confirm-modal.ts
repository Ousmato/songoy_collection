import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModalComponent {
  @Input() open = false;
  @Input() title = 'Confirmer l’action';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmer';
  @Input() cancelLabel = 'Annuler';
  @Input() busyLabel = 'Traitement…';
  @Input() destructive = false;
  @Input() busy = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.cancel();
  }

  cancel(): void {
    if (this.busy) return;
    this.cancelled.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.cancel();
  }
}
