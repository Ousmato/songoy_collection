import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ReturnMessageType = 'success' | 'error' | 'loading';

export interface ReturnMessageState {
  id: number;
  type: ReturnMessageType;
  title: string;
  message: string;
  autoClose: boolean;
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ResponseMessageService {
  private readonly messageSubject = new BehaviorSubject<ReturnMessageState | null>(null);
  readonly message$ = this.messageSubject.asObservable();
  private messageId = 0;
  private closeTimer?: ReturnType<typeof setTimeout>;

  showLoading(message = 'Chargement en cours…'): void {
    this.cancelAutoClose();
    this.showMessage({
      type: 'loading',
      title: 'Chargement',
      message,
      autoClose: false,
      duration: 0,
    });
  }

  showSuccessToast(message: unknown): void {
    this.showMessage({
      type: 'success',
      title: 'Succes',
      message: this.formatMessage(message),
      autoClose: true,
      duration: 1800,
    });
  }

  showErrorToast(erreur: unknown): void {
    this.showMessage({
      type: 'error',
      title: 'Erreur',
      message: this.formatMessage(erreur),
      autoClose: false,
      duration: 0,
    });
  }

  closeMessage(id?: number): void {
    const current = this.messageSubject.value;

    if (!current || (id && current.id !== id)) {
      return;
    }

    this.cancelAutoClose();
    this.messageSubject.next(null);
  }

  /** Ferme uniquement l'état de chargement, sans masquer un succès ou une erreur. */
  closeLoading(): void {
    if (this.messageSubject.value?.type === 'loading') {
      this.closeMessage(this.messageSubject.value.id);
    }
  }

  private showMessage(message: Omit<ReturnMessageState, 'id'>): void {
    const state = {
      ...message,
      id: ++this.messageId,
    };
    this.messageSubject.next(state);

    if (state.autoClose && state.duration > 0) {
      this.closeTimer = setTimeout(() => this.closeMessage(state.id), state.duration);
    }
  }

  private cancelAutoClose(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = undefined;
    }
  }

  private formatMessage(value: unknown): string {
    if (typeof value === 'string') {
      return value || 'Operation terminee.';
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const nestedError = record['error'];
      const knownMessage = record['message'] || record['detail']
        || (nestedError && typeof nestedError === 'object'
          ? (nestedError as Record<string, unknown>)['message']
          : nestedError);

      if (typeof knownMessage === 'string') {
        return knownMessage;
      }
    }

    return value == null ? 'Une erreur est survenue.' : String(value);
  }
}

export interface httpResponse {
  status: number;
  message: string;
}
