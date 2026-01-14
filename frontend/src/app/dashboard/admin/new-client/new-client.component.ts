import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankService } from '../../../core/services/bank.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize } from 'rxjs/operators';
import countriesData from '../../../../assets/data/countries.json';

@Component({
  selector: 'app-admin-new-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Nouveau Client</h2>
          <p class="text-slate-500">Créez un profil client et attribuez-lui des identifiants provisoires.</p>
        </div>
      </div>

      <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div class="p-8">
          <form [formGroup]="form" (ngSubmit)="createClient()" class="space-y-8">
            
            <!-- Identity Section -->
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </span>
                Identité
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Nom</label>
                  <input formControlName="lastName" type="text" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Nom du client" />
                  <p *ngIf="form.get('lastName')?.touched && form.get('lastName')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Prénom</label>
                  <input formControlName="firstName" type="text" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Prénom du client" />
                  <p *ngIf="form.get('firstName')?.touched && form.get('firstName')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Date de naissance</label>
                  <input formControlName="birthDate" type="date" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
                  <p *ngIf="form.get('birthDate')?.touched && form.get('birthDate')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Sexe</label>
                  <div class="flex gap-4">
                    <label class="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-slate-50 py-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                      <input formControlName="sex" type="radio" value="M" class="text-blue-600 focus:ring-blue-500" /> <span class="text-sm font-medium">Masculin</span>
                    </label>
                    <label class="flex-1 flex items-center justify-center gap-2 cursor-pointer bg-slate-50 py-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                      <input formControlName="sex" type="radio" value="F" class="text-blue-600 focus:ring-blue-500" /> <span class="text-sm font-medium">Féminin</span>
                    </label>
                  </div>
                  <p *ngIf="form.get('sex')?.touched && form.get('sex')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                </div>
              </div>
            </div>

            <!-- Contact Section -->
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </span>
                Coordonnées
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2 md:col-span-2">
                  <label class="text-sm font-semibold text-slate-700">Adresse Complète</label>
                  <input formControlName="address" type="text" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="Numéro, Rue, Ville" />
                  <p *ngIf="form.get('address')?.touched && form.get('address')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Téléphone</label>
                  <input formControlName="phone" type="tel" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="+XXX XX XX XX XX" />
                  <p *ngIf="form.get('phone')?.touched && form.get('phone')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Nationalité</label>
                  <select formControlName="nationality" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all">
                    <option value="" disabled>Sélectionner...</option>
                    <option *ngFor="let c of countries" [value]="c">{{ c }}</option>
                  </select>
                  <p *ngIf="form.get('nationality')?.touched && form.get('nationality')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                </div>
              </div>
            </div>

            <!-- Credentials Section -->
            <div class="space-y-6">
              <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <span class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                Identifiants de Connexion
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2 md:col-span-2">
                  <label class="text-sm font-semibold text-slate-700">Email</label>
                  <input formControlName="email" type="email" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" placeholder="client@exemple.com" />
                  <p *ngIf="form.get('email')?.touched && form.get('email')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                  <p *ngIf="form.get('email')?.touched && form.get('email')?.hasError('email')" class="text-xs text-red-500 font-medium ml-1">Email invalide</p>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Mot de passe provisoire</label>
                  <input formControlName="password" type="text" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono" placeholder="Minimum 8 caractères" />
                  <p *ngIf="form.get('password')?.touched && form.get('password')?.hasError('required')" class="text-xs text-red-500 font-medium ml-1">Requis</p>
                  <p *ngIf="form.get('password')?.touched && form.get('password')?.hasError('minlength')" class="text-xs text-red-500 font-medium ml-1">Min. 8 caractères</p>
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-semibold text-slate-700">Confirmer le mot de passe</label>
                  <input formControlName="confirmPassword" type="text" class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono" />
                  <p *ngIf="form.hasError('passwordsMismatch') && form.get('confirmPassword')?.touched" class="text-xs text-red-500 font-medium ml-1">Les mots de passe ne correspondent pas</p>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
              <button type="button" (click)="resetForm()" class="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                Réinitialiser
              </button>
              <button type="submit" [disabled]="submitting || form.invalid" class="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:shadow-none min-w-[160px] flex justify-center">
                <span *ngIf="!submitting">Créer le Client</span>
                <span *ngIf="submitting" class="animate-pulse">Création...</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AdminNewClientComponent {
  countries = countriesData;
  form: FormGroup;
  submitting = false;

  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.form = this.fb.group(
      {
        lastName: ['', Validators.required],
        firstName: ['', Validators.required],
        birthDate: ['', Validators.required],
        sex: ['', Validators.required],
        address: ['', Validators.required],
        phone: ['', Validators.required],
        nationality: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordsMatch },
    );
  }

  private passwordsMatch(group: FormGroup) {
    const p = group.get('password')?.value;
    const cp = group.get('confirmPassword')?.value;
    return p === cp ? null : { passwordsMismatch: true };
  }

  createClient() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.cdr.detectChanges();

    const payload = {
      email: this.form.value.email,
      password: this.form.value.password,
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      phoneNumber: this.form.value.phone,
      address: this.form.value.address,
      gender: this.form.value.sex,
      birthDate: this.form.value.birthDate,
      nationality: this.form.value.nationality,
    };

    this.bankService.createClient(payload).pipe(
      finalize(() => {
        this.submitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.notificationService.success('Client créé avec succès !');
        this.resetForm();
      },
      error: (err) => {
        console.error('Create client error', err);
        const msg = err.error?.message || 'Erreur lors de la création du client';
        this.notificationService.error(msg);
      },
    });
  }

  resetForm() {
    this.form.reset();
  }
}
