import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankService, Account, Client } from '../../../core/services/bank.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-accounts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Gestion des Comptes</h2>
        <span
          class="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
        >
          {{ accounts.length }} Comptes
        </span>
      </div>

      <!-- Client Search -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <label class="block text-sm font-bold text-slate-700 mb-3">Sélectionner un client</label>
        <div class="relative">
          <input 
            type="text"
            [(ngModel)]="clientSearchQuery"
            (input)="onClientSearch()"
            placeholder="Rechercher par nom ou email..."
            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div *ngIf="clientSearchQuery" class="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-72 overflow-y-auto">
            <div *ngIf="getFilteredClients().length > 0" class="divide-y divide-slate-200">
              <button 
                *ngFor="let client of getFilteredClients()"
                (click)="selectClient(client)"
                class="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors focus:outline-none focus:bg-indigo-50">
                <div class="font-semibold text-slate-800">{{ client.firstName }} {{ client.lastName }}</div>
                <div class="text-xs text-slate-500">{{ client.email }}</div>
              </button>
            </div>
            <div *ngIf="getFilteredClients().length === 0" class="px-4 py-4 text-center text-slate-500 text-sm">
              Aucun client trouvé
            </div>
          </div>
        </div>
        <div *ngIf="selectedClientId && selectedClient" class="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p class="text-sm text-indigo-700">
            <strong>Sélectionné:</strong> {{ selectedClient.firstName }} {{ selectedClient.lastName }}
            <button (click)="clearSelection()" class="ml-2 text-indigo-600 hover:text-indigo-800 text-xs font-semibold">✕</button>
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex justify-center items-center py-12">
        <div class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>

      <div *ngIf="!loading" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse" *ngIf="accounts.length > 0">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Compte
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                >
                  Solde
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                *ngFor="let account of accounts"
                class="hover:bg-slate-50 transition-colors group"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <div
                      class="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold border border-slate-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M2.25 18.75a60.07 10.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 5.25v.75m0 5.25v.75m15-12.75V4.5m0 5.25v.75m0 5.25v.75m-15 0h.008v.008H3.75V16.5zm15 0h.008v.008h-.008V16.5zm-15-5.25h.008v.008H3.75v-.008zm15 0h.008v.008h-.008v-.008zm-15-5.25h.008v.008H3.75V6zm15 0h.008v.008h-.008V6zm-12.25 0h11.5c.663 0 1.25.537 1.25 1.25v11.5c0 .663-.537 1.25-1.25 1.25h-11.5c-.663 0-1.25-.537-1.25-1.25V7.25c0-.663.537-1.25 1.25-1.25z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ account.accountNumber }}</div>
                      <div class="text-xs text-slate-500 italic">ID: #{{ account.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-900">
                    {{ account.owner?.firstName }} {{ account.owner?.lastName }}
                  </div>
                  <div class="text-xs text-slate-500">{{ account.owner?.email }}</div>
                </td>
                <td class="px-6 py-4">
                  <div
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="
                      account.accountType === 'EPARGNE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    "
                  >
                    {{ account.accountType === 'EPARGNE' ? 'Epargne' : 'Courant' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="font-bold text-slate-900">
                    {{ account.balance | number: '1.2-2' }} FCFA
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  {{ account.creationDate || account.createdAt | date: 'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      class="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider hover:underline"
                    >
                      Détails
                    </button>
                    <button
                      (click)="onDeleteAccount(account.id)"
                      class="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                      title="Supprimer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="w-5 h-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 10.07 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 10.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="accounts.length === 0 && selectedClientId" class="p-16 text-center">
          <div
            class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8 text-slate-300"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          </div>
          <p class="text-slate-500 font-medium">Aucun compte trouvé pour ce client.</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AdminAccountsListComponent implements OnInit {
  private bankService = inject(BankService);
  private notificationService = inject(NotificationService);
  
  clients: Client[] = [];
  accounts: Account[] = [];
  selectedClientId: string = '';
  selectedClient: Client | null = null;
  clientSearchQuery: string = '';
  loading = false;

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.bankService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (err) => {
        console.error('Error loading clients', err);
      }
    });
  }

  onClientChange(): void {
    if (this.selectedClientId) {
      this.loadAccounts();
    } else {
      this.accounts = [];
    }
  }

  getFilteredClients(): Client[] {
    if (!this.clientSearchQuery.trim()) {
      return [];
    }
    const query = this.clientSearchQuery.toLowerCase();
    return this.clients.filter(client => 
      client.firstName.toLowerCase().includes(query) ||
      client.lastName.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query)
    );
  }

  onClientSearch(): void {
    // Search happens automatically via getFilteredClients()
  }

  selectClient(client: Client): void {
    this.selectedClientId = client.id.toString();
    this.selectedClient = client;
    this.clientSearchQuery = '';
    this.loadAccounts();
  }

  clearSelection(): void {
    this.selectedClientId = '';
    this.selectedClient = null;
    this.clientSearchQuery = '';
    this.accounts = [];
  }

  loadAccounts(): void {
    if (!this.selectedClientId) return;
    
    this.loading = true;
    this.bankService.getAccountsByClient(+this.selectedClientId).subscribe({
      next: (accounts) => {
        console.log('Loaded accounts:', accounts);
        this.accounts = accounts;
        setTimeout(() => {
          this.loading = false;
        });
      },
      error: (err) => {
        console.error('Error loading accounts', err);
        this.accounts = [];
        setTimeout(() => {
          this.loading = false;
        });
      }
    });
  }

  onDeleteAccount(accountId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.')) {
      this.bankService.deleteAccount(accountId).subscribe({
        next: () => {
          this.notificationService.success('Compte supprimé avec succès.');
          this.loadAccounts();
        },
        error: (err) => {
          console.error('Error deleting account', err);
          this.notificationService.error('Erreur lors de la suppression du compte.');
        }
      });
    }
  }
}
