package com.backend.ega.controllers;

import com.backend.ega.entities.Account;
import com.backend.ega.services.AccountsService;
import com.backend.ega.services.AccountStatementService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountsController {

    private final AccountsService accountsService;
    private final AccountStatementService accountStatementService;

    public AccountsController(AccountsService accountsService, 
        AccountStatementService accountStatementService) {
        this.accountsService = accountsService;
        this.accountStatementService = accountStatementService;
    }

    @GetMapping
    public List<Account> getAllAccounts() {
        return accountsService.getAllAccounts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        return accountsService.getAccountById(id);
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@Valid @RequestBody Account account) {
        return accountsService.createAccount(account);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable Long id,
            @Valid @RequestBody Account account) {
        return accountsService.updateAccount(id, account);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id) {
        return accountsService.deleteAccount(id);
    }

    @GetMapping("/client/{clientId}")
    public List<Account> getAccountsByClient(@PathVariable Long clientId) {
        return accountsService.getAccountsByClient(clientId);
    }
    
    /**
     * Génère et télécharge le relevé de compte complet au format PDF
     * @param id ID du compte
     * @return PDF du relevé de compte
     */
    @GetMapping("/{id}/statement")
    public ResponseEntity<byte[]> downloadAccountStatement(@PathVariable Long id) {
        try {
            byte[] pdfBytes = accountStatementService.generateAccountStatement(id);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "releve_compte_" + id + ".pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    /**
     * Génère et télécharge le relevé de compte pour une période donnée au format PDF
     * @param id ID du compte
     * @param startDate Date de début (format ISO: 2024-01-01T00:00:00)
     * @param endDate Date de fin (format ISO: 2024-12-31T23:59:59)
     * @return PDF du relevé de compte pour la période
     */
    @GetMapping("/{id}/statement/period")
    public ResponseEntity<byte[]> downloadAccountStatementForPeriod(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            byte[] pdfBytes = accountStatementService.generateAccountStatementForPeriod(id, startDate, endDate);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", 
                    "releve_compte_" + id + "_periode.pdf");
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
