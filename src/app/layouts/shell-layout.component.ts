import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BottomNavigationBar } from '../shared/components/bottom-navigation-bar/bottom-navigation-bar';
import { ActivitySpace, ActivitySpaceService } from '../shared/service/activity-space.service';
import { getUserFromSessionStorage } from '../admin/shared/auth.util';
import { LoginResponseDto } from '../admin/model/admin.model';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [RouterOutlet, BottomNavigationBar],
  templateUrl: './shell-layout.component.html',
  styleUrl: './shell-layout.component.css',
})
export class ShellLayoutComponent implements OnInit {
  private router = inject(Router);
  readonly activity = inject(ActivitySpaceService);
  readonly connectedUser: LoginResponseDto | null = getUserFromSessionStorage();

  get userName(): string {
    if (!this.connectedUser) return 'Utilisateur';
    return `${this.connectedUser.prenom ?? ''} ${this.connectedUser.nom ?? ''}`.trim() || 'Utilisateur';
  }

  get userRole(): string {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super administrateur',
      ADMIN: 'Administrateur',
      RESPONSABLE: 'Responsable',
      CAISSIER: 'Caissier',
      COUTURIER: 'Couturier',
    };
    return labels[this.connectedUser?.role ?? ''] ?? this.connectedUser?.role ?? 'Personnel';
  }

  changeSpace(event: Event): void {
    const space = (event.target as HTMLSelectElement).value as ActivitySpace;
    if (!this.activity.canSwitch || space === this.activity.space()) return;
    this.router.navigateByUrl(space === 'ATELIER' ? '/admin/list-commandes' : '/admin/dashboard')
      .then((navigated) => { if (navigated) this.activity.select(space); });
  }

  title = 'Songhoi Collection';
  currentTitle = signal<string>('Dashboard');

  private deepestTitle(snapshot: any): string | null {
    if (!snapshot) return null;
    if (snapshot.data?.title) return snapshot.data.title as string;

    for (const child of snapshot.children ?? []) {
      const title = this.deepestTitle(child);
      if (title) return title;
    }

    return null;
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateCurrentTitle();
      }
    });

    this.updateCurrentTitle();
  }

  private updateCurrentTitle(): void {
    const title = this.deepestTitle(this.router.routerState.root.snapshot);
    if (title) this.currentTitle.set(title);
  }
}
