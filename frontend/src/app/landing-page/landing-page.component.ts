import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Feature {
  title: string;
  description: string;
  icon: SafeHtml;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrls: []
})
export class LandingPageComponent implements OnInit {
  rawFeatures = [
    {
      title: 'Sécurité Maximale',
      description: 'Vos transactions sont protégées par les protocoles de sécurité les plus avancés du marché.',
      iconStr: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.745 3.745 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
             </svg>`
    },
    {
      title: 'Gestion Simplifiée',
      description: 'Gérez vos comptes, cartes et virements en quelques clics depuis notre interface intuitive.',
      iconStr: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
             </svg>`
    },
    {
      title: 'Support 24/7',
      description: 'Une équipe dédiée disponible à tout moment pour répondre à vos questions et vous accompagner.',
      iconStr: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>`
    }
  ];

  features: Feature[] = [];

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.features = this.rawFeatures.map(f => ({
      ...f,
      icon: this.sanitizer.bypassSecurityTrustHtml(f.iconStr)
    }));
  }

  stats = [
    { label: 'Clients Satisfaits', value: '50k+' },
    { label: 'Transactions', value: '2M+' },
    { label: 'Pays couverts', value: '15+' },
    { label: 'Support', value: '24/7' }
  ];

  steps = [
    { number: '01', title: 'Inscription', description: 'Créez votre compte en moins de 2 minutes' },
    { number: '02', title: 'Vérification', description: 'Validez votre identité en toute sécurité' },
    { number: '03', title: 'Profitez', description: 'Accédez à tous nos services immédiatement' }
  ];

  testimonials = [
    { name: 'Sophie Martin', role: 'Entrepreneur', quote: "L'application est incroyablement fluide. Je gère ma trésorerie sans stress.", image: 'https://i.pravatar.cc/150?img=5' },
    { name: 'Thomas Dubois', role: 'Developpeur', quote: "Une API bancaire robuste et une interface utilisateur au top. Bravo !", image: 'https://i.pravatar.cc/150?img=11' },
    { name: 'Marie Laurent', role: 'Etudiante', quote: "Les frais sont transparents et l'épargne est simple à mettre en place.", image: 'https://i.pravatar.cc/150?img=9' }
  ];
}
