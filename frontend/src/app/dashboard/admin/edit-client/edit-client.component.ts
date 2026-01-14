import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BankService } from '../../../core/services/bank.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-admin-edit-client',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="max-w-2xl mx-auto space-y-8">
      <div class="space-y-2">
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Modifier le Client</h2>
        <p class="text-slate-500">Mettez à jour les informations personnelles du client.</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div class="p-8">
          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- First Name -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Prénom</label>
              <input type="text" formControlName="firstName" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
            </div>

            <!-- Last Name -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Nom</label>
              <input type="text" formControlName="lastName" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
            </div>

            <!-- Email -->
            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-semibold text-slate-700">Email</label>
              <input type="email" formControlName="email" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
            </div>

            <!-- Phone -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Téléphone</label>
              <input type="text" formControlName="phoneNumber" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
            </div>

             <!-- Nationality -->
             <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Nationalité</label>
              <input type="text" formControlName="nationality" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all" />
            </div>

            <!-- Address -->
            <div class="space-y-2 md:col-span-2">
              <label class="block text-sm font-semibold text-slate-700">Adresse</label>
              <textarea formControlName="address" rows="3" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none transition-all"></textarea>
            </div>

            <div class="md:col-span-2 flex gap-4 pt-4">
              <button
                type="button"
                (click)="onCancel()"
                class="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="clientForm.invalid || submitting"
                class="flex-auto px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl"
              >
                {{ submitting ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
    styles: []
})
export class AdminEditClientComponent implements OnInit {
    private fb = inject(FormBuilder);
    private bankService = inject(BankService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    clientForm: FormGroup;
    submitting = false;
    clientId!: number;

    constructor() {
        this.clientForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required],
            address: ['', Validators.required],
            nationality: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.clientId = +id;
            this.loadClient();
        }
    }

    loadClient(): void {
        this.bankService.getClientProfile(this.clientId).subscribe({
            next: (client) => {
                this.clientForm.patchValue({
                    firstName: client.firstName,
                    lastName: client.lastName,
                    email: client.email,
                    phoneNumber: client.phoneNumber,
                    address: client.address,
                    nationality: client.nationality
                });
            },
            error: (err) => {
                console.error('Error loading client', err);
                this.notificationService.error('Erreur lors du chargement du client.');
                this.router.navigate(['/dashboard/admin/clients']);
            }
        });
    }

    onSubmit(): void {
        if (this.clientForm.invalid) return;

        this.submitting = true;
        this.bankService.updateClientProfile(this.clientId, this.clientForm.value).pipe(
            finalize(() => this.submitting = false)
        ).subscribe({
            next: () => {
                this.notificationService.success('Client mis à jour avec succès.');
                this.router.navigate(['/dashboard/admin/clients']);
            },
            error: (err) => {
                console.error('Error updating client', err);
                this.notificationService.error('Erreur lors de la mise à jour.');
            }
        });
    }

    onCancel(): void {
        this.router.navigate(['/dashboard/admin/clients']);
    }
}
