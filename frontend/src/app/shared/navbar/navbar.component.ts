import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: []
})
export class NavbarComponent {
  navLinks = [
    { label: 'Nos Avantages', href: '#features' },
    { label: 'Fonctionnement', href: '#how-it-works' },
    { label: 'Témoignages', href: '#testimonials' }
  ];
}
