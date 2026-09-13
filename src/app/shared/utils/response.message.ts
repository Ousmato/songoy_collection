import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ReturnMessageType = 'success' | 'error';

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

    this.messageSubject.next(null);
  }

  private showMessage(message: Omit<ReturnMessageState, 'id'>): void {
    this.messageSubject.next({
      ...message,
      id: ++this.messageId,
    });
  }

  private formatMessage(value: unknown): string {
    if (typeof value === 'string') {
      return value || 'Operation terminee.';
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const knownMessage = record['message'] || record['error'] || record['detail'];

      if (typeof knownMessage === 'string') {
        return knownMessage;
      }
    }

    return value == null ? 'Operation terminee.' : String(value);
  }
}

export interface httpResponse {
  status: number;
  message: string;
}
