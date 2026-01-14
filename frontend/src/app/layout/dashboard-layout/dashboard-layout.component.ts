import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-slate-50 font-sans relative overflow-hidden">
      <!-- Background Decorative Elements -->
      <div class="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-0 left-72 -ml-32 -mb-32 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <app-sidebar></app-sidebar>
      <div class="ml-72 flex-1 p-10 relative z-10 transition-all duration-300">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardLayoutComponent { }
