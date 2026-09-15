import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { ResponseMessageService } from './shared/utils/response.message';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <router-outlet />
    @if (message(); as state) {
      <div class="message-backdrop">
        <section class="message-modal" [class.message-success]="state.type === 'success'" [class.message-error]="state.type === 'error'" [class.message-loading]="state.type === 'loading'" role="alertdialog" aria-modal="true" [attr.aria-label]="state.title">
          <div class="message-icon">
            @if (state.type === 'loading') { <span class="message-spinner"></span> }
            @if (state.type === 'success') { <i class="fa-solid fa-check"></i> }
            @if (state.type === 'error') { <i class="fa-solid fa-xmark"></i> }
          </div>
          <h2>{{ state.title }}</h2><p>{{ state.message }}</p>
          @if (state.type !== 'loading') { <button type="button" class="message-close" (click)="close(state.id)">{{ state.type === 'error' ? 'Fermer' : 'OK' }}</button> }
        </section>
      </div>
    }
  `,
  styles: [`
    :host { display: block; width: 100%; min-height: 100dvh; }
    .message-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 1rem; background: rgba(31,26,22,.38); }
    .message-modal { width: min(100%, 360px); padding: 1.5rem; border: 1px solid #e6ded5; border-radius: 12px; background: #fff; box-shadow: 0 18px 50px rgba(31,26,22,.2); text-align: center; }
    .message-icon { width: 48px; height: 48px; margin: 0 auto .8rem; display: grid; place-items: center; border-radius: 50%; font-size: 1.2rem; }
    .message-success .message-icon { color: #28633e; background: #eaf6ed; }
    .message-error .message-icon { color: #9b3a2e; background: #fcedeb; }
    .message-loading .message-icon { color: #a8892f; background: #fbf7ef; }
    .message-modal h2 { margin: 0 0 .35rem; color: #1f1a16; font: 700 1.05rem Georgia,serif; }
    .message-modal p { margin: 0; color: #7d7168; font: .8rem/1.45 Arial,sans-serif; }
    .message-close { margin-top: 1.1rem; min-width: 90px; min-height: 36px; border: 0; border-radius: 6px; background: #a8892f; color: #fff; font-weight: 700; cursor: pointer; }
    .message-spinner { width: 20px; height: 20px; border: 2px solid #d8cda9; border-top-color: #a8892f; border-radius: 50%; animation: message-spin .7s linear infinite; }
    @keyframes message-spin { to { transform: rotate(360deg); } }
  `],
})
export class AppComponent {
  private readonly response = inject(ResponseMessageService);
  readonly message = toSignal(this.response.message$, { initialValue: null });

  close(id: number): void { this.response.closeMessage(id); }
}
