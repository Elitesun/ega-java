import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BankService, Client, Account, Transaction } from '../../../core/services/bank.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-clients-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6" *ngIf="clients$ | async as allClients">
      <div class="flex flex-col gap-4">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold text-slate-800">Gestion des Clients</h2>
          <span
            class="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
          >
            {{ getFilteredClients(allClients).length }}/{{ allClients.length }} Clients
          </span>
        </div>
        <input type="text" 
          [(ngModel)]="searchQuery" 
          placeholder="Rechercher par nom ou email..." 
          class="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"/>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse" *ngIf="getFilteredClients(allClients).length > 0">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Comptes
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nationalité
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr *ngFor="let client of getFilteredClients(allClients)" class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <div
                      class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 uppercase"
                    >
                      {{ (client.firstName || '?')[0] }}{{ (client.lastName || '?')[0] }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">
                        {{ client.firstName }} {{ client.lastName }}
                      </div>
                      <div class="text-xs text-slate-500 italic">ID: #{{ client.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-700 font-medium">{{ client.email }}</div>
                  <div class="text-xs text-slate-500">{{ client.phoneNumber }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-800">
                      {{ client.accounts?.length || 0 }} Compte(s)
                    </span>
                    <span
                      class="text-xs text-slate-500"
                      *ngIf="client.accounts && client.accounts.length > 0"
                    >
                      Total: {{ getTotalBalance(client) | number: '1.2-2' }} FCFA
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-700">{{ client.address || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {{ client.nationality || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      (click)="openDepositModal(client)"
                      class="text-slate-400 hover:text-green-600 transition-colors p-2 rounded-lg hover:bg-green-50"
                      title="Dépôt"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                    <button
                      (click)="openWithdrawalModal(client)"
                      class="text-slate-400 hover:text-orange-600 transition-colors p-2 rounded-lg hover:bg-orange-50"
                      title="Retrait"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                      </svg>
                    </button>
                    <button
                      [routerLink]="['/dashboard/admin/edit-client', client.id]"
                      class="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title="Modifier"
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      (click)="onDeleteClient(client.id)"
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
                          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="getFilteredClients(allClients).length === 0" class="p-16 text-center">
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <p class="text-slate-500 font-medium">{{ searchQuery ? 'Aucun résultat trouvé.' : 'Aucun client trouvé.' }}</p>
        </div>
      </div>
    </div>

    <!-- Deposit Modal -->
    <div *ngIf="showDepositModal" class="fixed inset-0 flex items-center justify-center z-50" (click)="closeModals()">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
        <h3 class="text-xl font-bold text-slate-900 mb-6">Effectuer un Dépôt</h3>
        <div *ngIf="selectedClient" class="space-y-4">
          <p class="text-sm text-slate-600"><strong>Client:</strong> {{ selectedClient.firstName }} {{ selectedClient.lastName }}</p>
          
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-2">Compte</label>
            <select [(ngModel)]="transactionForm.accountId" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sélectionner un compte</option>
              <option *ngFor="let acc of selectedClient.accounts" [value]="acc.id">
                {{ acc.accountNumber }} - {{ acc.accountType }} ({{ acc.balance | number:'1.2-2' }} FCFA)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-2">Montant</label>
            <input type="number" [(ngModel)]="transactionForm.amount" placeholder="0.00" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-2">Description</label>
            <input type="text" [(ngModel)]="transactionForm.description" placeholder="Dépôt physique..." class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div class="flex gap-3 pt-4">
            <button (click)="closeModals()" class="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Annuler</button>
            <button (click)="submitDeposit()" [disabled]="depositLoading" class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {{ depositLoading ? 'En cours...' : 'Valider' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Withdrawal Modal -->
    <div *ngIf="showWithdrawalModal" class="fixed inset-0 flex items-center justify-center z-50" (click)="closeModals()">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4" (click)="$event.stopPropagation()">
        <h3 class="text-xl font-bold text-slate-900 mb-6">Effectuer un Retrait</h3>
        <div *ngIf="selectedClient" class="space-y-4">
          <p class="text-sm text-slate-600"><strong>Client:</strong> {{ selectedClient.firstName }} {{ selectedClient.lastName }}</p>
          
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-2">Compte</label>
            <select [(ngModel)]="transactionForm.accountId" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Sélectionner un compte</option>
              <option *ngFor="let acc of selectedClient.accounts" [value]="acc.id">
                {{ acc.accountNumber }} - {{ acc.accountType }} ({{ acc.balance | number:'1.2-2' }} FCFA)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-2">Montant</label>
            <input type="number" [(ngModel)]="transactionForm.amount" placeholder="0.00" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-2">Description</label>
            <input type="text" [(ngModel)]="transactionForm.description" placeholder="Retrait physique..." class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
          </div>

          <div class="flex gap-3 pt-4">
            <button (click)="closeModals()" class="flex-1 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">Annuler</button>
            <button (click)="submitWithdrawal()" [disabled]="withdrawalLoading" class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {{ withdrawalLoading ? 'En cours...' : 'Valider' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AdminClientsListComponent implements OnInit {
  private bankService = inject(BankService);
  private notificationService = inject(NotificationService);
  clients$: Observable<Client[]> = of([]);
  searchQuery = '';

  // Modal states
  showDepositModal = false;
  showWithdrawalModal = false;
  selectedClient: Client | null = null;
  
  // Form data
  transactionForm = { accountId: '', amount: 0, description: '' };
  depositLoading = false;
  withdrawalLoading = false;

  ngOnInit(): void {
    this.fetchClients();
  }

  fetchClients(): void {
    this.clients$ = this.bankService.getAllClients().pipe(
      catchError((err) => {
        console.error('Error loading clients', err);
        return of([]);
      }),
    );
  }

  openDepositModal(client: Client): void {
    this.selectedClient = client;
    this.transactionForm = { accountId: '', amount: 0, description: 'Dépôt physique' };
    this.showDepositModal = true;
  }

  openWithdrawalModal(client: Client): void {
    this.selectedClient = client;
    this.transactionForm = { accountId: '', amount: 0, description: 'Retrait physique' };
    this.showWithdrawalModal = true;
  }

  submitDeposit(): void {
    if (!this.transactionForm.accountId || !this.transactionForm.amount || this.transactionForm.amount <= 0) {
      this.notificationService.error('Veuillez remplir tous les champs correctement');
      return;
    }

    this.depositLoading = true;
    const payload = {
      amount: this.transactionForm.amount,
      transactionType: 'DEPOSIT',
      description: this.transactionForm.description,
      sourceAccount: { id: parseInt(this.transactionForm.accountId as any) }
    };

    this.bankService.createTransaction(payload).subscribe({
      next: () => {
        this.notificationService.success('Dépôt effectué avec succès');
        this.closeModals();
        this.depositLoading = false;
        this.fetchClients();
      },
      error: (err) => {
        console.error('Deposit error', err);
        this.notificationService.error('Erreur lors du dépôt');
        this.depositLoading = false;
      }
    });
  }

  submitWithdrawal(): void {
    if (!this.transactionForm.accountId || !this.transactionForm.amount || this.transactionForm.amount <= 0) {
      this.notificationService.error('Veuillez remplir tous les champs correctement');
      return;
    }

    const account = this.selectedClient?.accounts?.find(a => a.id === parseInt(this.transactionForm.accountId as any));
    if (account && account.balance < this.transactionForm.amount) {
      this.notificationService.error('Solde insuffisant');
      return;
    }

    this.withdrawalLoading = true;
    const payload = {
      amount: this.transactionForm.amount,
      transactionType: 'WITHDRAWAL',
      description: this.transactionForm.description,
      sourceAccount: { id: parseInt(this.transactionForm.accountId as any) }
    };

    this.bankService.createTransaction(payload).subscribe({
      next: () => {
        this.notificationService.success('Retrait effectué avec succès');
        this.closeModals();
        this.withdrawalLoading = false;
        this.fetchClients();
      },
      error: (err) => {
        console.error('Withdrawal error', err);
        this.notificationService.error('Erreur lors du retrait');
        this.withdrawalLoading = false;
      }
    });
  }

  closeModals(): void {
    this.showDepositModal = false;
    this.showWithdrawalModal = false;
    this.selectedClient = null;
    this.transactionForm = { accountId: '', amount: 0, description: '' };
  }

  onDeleteClient(clientId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      this.bankService.deleteClient(clientId).subscribe({
        next: () => {
          this.notificationService.success('Client supprimé avec succès.');
          this.fetchClients();
        },
        error: (err) => {
          console.error('Error deleting client', err);
          this.notificationService.error('Erreur lors de la suppression du client.');
        }
      });
    }
  }

  getTotalBalance(client: Client): number {
    if (!client.accounts) return 0;
    return client.accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  }

  getFilteredClients(clients: Client[]): Client[] {
    if (!this.searchQuery.trim()) return clients;
    const q = this.searchQuery.toLowerCase();
    return clients.filter(c => 
      c.firstName?.toLowerCase().includes(q) || 
      c.lastName?.toLowerCase().includes(q) || 
      c.email?.toLowerCase().includes(q)
    );
  }
}
