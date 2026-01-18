package com.backend.ega.services;

import com.backend.ega.dto.CreateClientRequest;
import com.backend.ega.dto.ErrorResponse;
import com.backend.ega.entities.Client;
import com.backend.ega.repositories.ClientsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ClientsService {

    private final ClientsRepository clientsRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public ClientsService(ClientsRepository clientsRepository) {
        this.clientsRepository = clientsRepository;
    }

    public List<Client> getAllClients() {
        return clientsRepository.findAll();
    }

    public ResponseEntity<Client> createClient(Client client) {
        // Prevent "detached entity passed to persist" error if accounts are provided in the request
        if (client.getAccounts() != null) {
            client.getAccounts().clear();
        }

        // Encode password if it is not already encoded (basic check or just encode)
        // Usually, for a Create operation, it's raw text.
        if (client.getPassword() != null && !client.getPassword().isEmpty()) {
            client.setPassword(passwordEncoder.encode(client.getPassword()));
        }

        // Check if email exists
        if (clientsRepository.existsByEmail(client.getEmail())) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        Client savedClient = clientsRepository.save(client);
        return new ResponseEntity<>(savedClient, HttpStatus.CREATED);
    }

    /**
     * Create a client from CreateClientRequest DTO (used by admin dashboard)
     */
    public ResponseEntity<Client> createClientFromRequest(CreateClientRequest request) {
        // Check if email exists
        if (clientsRepository.existsByEmail(request.getEmail())) {
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }

        // Create client with all fields
        Client client = new Client();
        client.setEmail(request.getEmail());
        client.setPassword(passwordEncoder.encode(request.getPassword())); // Encode password
        client.setFirstName(request.getFirstName());
        client.setLastName(request.getLastName());
        client.setPhoneNumber(request.getPhoneNumber());
        client.setAddress(request.getAddress());
        client.setGender(request.getGender());
        client.setBirthDate(request.getBirthDate());
        client.setNationality(request.getNationality());
        client.setActive(true);

        Client savedClient = clientsRepository.save(client);
        return new ResponseEntity<>(savedClient, HttpStatus.CREATED);
    }

    /**
     * Crée un nouveau client avec mot de passe hashé
     * @param email l'email du client
     * @param password le mot de passe en clair
     * @param firstName le prénom
     * @param lastName le nom
     * @return le client créé
     */
    public Client createClient(String email, String password, String firstName, String lastName) {
        // Vérifier que l'email n'existe pas
        if (clientsRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("L'email " + email + " existe déjà");
        }

        // Créer le nouvel client avec mot de passe hashé
        Client client = new Client();
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode(password)); // Hasher le mot de passe
        client.setFirstName(firstName);
        client.setLastName(lastName);
        client.setActive(true);
        // Les timestamps sont gérés automatiquement par @PrePersist

        return clientsRepository.save(client);
    }

    /**
     * Crée un nouveau client avec toutes les informations complètes
     */
    public Client createClient(String email, String password, String firstName, String lastName,
                                String phoneNumber, String address, String gender, LocalDate birthDate) {
        // Vérifier que l'email n'existe pas
        if (clientsRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("L'email " + email + " existe déjà");
        }

        // Créer le client complet
        Client client = new Client();
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode(password));
        client.setFirstName(firstName);
        client.setLastName(lastName);
        client.setPhoneNumber(phoneNumber);
        client.setAddress(address);
        client.setGender(gender);
        client.setBirthDate(birthDate);
        client.setActive(true);
        // Les timestamps sont gérés automatiquement par @PrePersist

        return clientsRepository.save(client);
    }

    /**
     * Crée un nouveau client avec TOUS les champs incluant la nationalité
     */
    public Client createClient(String email, String password, String firstName, String lastName,
                                String phoneNumber, String address, String gender, LocalDate birthDate,
                                String nationality) {
        // Vérifier que l'email n'existe pas
        if (clientsRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("L'email " + email + " existe déjà");
        }

        // Créer le client complet avec tous les champs
        Client client = new Client();
        client.setEmail(email);
        client.setPassword(passwordEncoder.encode(password));
        client.setFirstName(firstName);
        client.setLastName(lastName);
        client.setPhoneNumber(phoneNumber);
        client.setAddress(address);
        client.setGender(gender);
        client.setBirthDate(birthDate);
        client.setNationality(nationality);
        client.setActive(true);
        // Les timestamps sont gérés automatiquement par @PrePersist

        return clientsRepository.save(client);
    }

    public Optional<Client> findByEmail(String email) {
        return clientsRepository.findByEmail(email);
    }

    public boolean emailExists(String email) {
        return clientsRepository.existsByEmail(email);
    }

    /**
     * Sauvegarde un client (mise à jour)
     */
    public Client saveClient(Client client) {
        // updatedAt est géré automatiquement par @PreUpdate
        return clientsRepository.save(client);
    }

    public ResponseEntity<Client> getClientById(Long id) {
        return clientsRepository.findById(id)
                .map(client -> new ResponseEntity<>(client, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Client> updateClient(Long id, Client clientDetails) {
        return clientsRepository.findById(id)
                .map(client -> {
                    // Clear accounts from incoming request to prevent deserialization issues
                    if (clientDetails.getAccounts() != null) {
                        clientDetails.getAccounts().clear();
                    }
                    
                    client.setLastName(clientDetails.getLastName());
                    client.setFirstName(clientDetails.getFirstName());
                    client.setEmail(clientDetails.getEmail());
                    client.setPhoneNumber(clientDetails.getPhoneNumber());
                    client.setBirthDate(clientDetails.getBirthDate());
                    client.setGender(clientDetails.getGender());
                    client.setAddress(clientDetails.getAddress());
                    client.setNationality(clientDetails.getNationality());

                    Client updatedClient = clientsRepository.save(client);
                    return new ResponseEntity<>(updatedClient, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<?> deleteClient(Long id) {
        Optional<Client> clientOpt = clientsRepository.findById(id);
        
        if (clientOpt.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        
        Client client = clientOpt.get();
        
        // Check if client has any accounts with remaining balance
        if (client.getAccounts() != null && !client.getAccounts().isEmpty()) {
            double totalBalance = client.getAccounts().stream()
                    .mapToDouble(account -> account.getBalance() != null ? account.getBalance() : 0.0)
                    .sum();
            
            if (totalBalance > 0) {
                // Return conflict error - client must empty all accounts first
                String detailedMessage = "Vous devez d'abord vider tous vos comptes avant de supprimer votre compte. "
                        + "Solde total: " + String.format("%.2f", totalBalance) + " FCFA";
                
                ErrorResponse errorResponse = new ErrorResponse(
                    HttpStatus.CONFLICT.value(),
                    "Impossible de supprimer le compte",
                    "Account balance not empty",
                    "/api/clients/" + id,
                    java.util.List.of(detailedMessage)
                );
                return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
            }
        }
        
        // All checks passed, delete the client
        clientsRepository.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    public ResponseEntity<?> changePassword(Long id, String newPassword, String confirmPassword) {
        // Validate passwords match
        if (!newPassword.equals(confirmPassword)) {
            return new ResponseEntity<>(
                new ErrorResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    "Les mots de passe ne correspondent pas",
                    "Passwords do not match",
                    "/api/clients/" + id + "/password",
                    java.util.List.of("New password and confirm password must be identical")
                ),
                HttpStatus.BAD_REQUEST
            );
        }

        // Find and update client
        return clientsRepository.findById(id)
                .map(client -> {
                    client.setPassword(passwordEncoder.encode(newPassword));
                    clientsRepository.save(client);
                    return new ResponseEntity<>(
                        new ErrorResponse(
                            HttpStatus.OK.value(),
                            "Mot de passe modifié avec succès",
                            null,
                            "/api/clients/" + id + "/password",
                            null
                        ),
                        HttpStatus.OK
                    );
                })
                .orElse(new ResponseEntity<>(
                    new ErrorResponse(
                        HttpStatus.NOT_FOUND.value(),
                        "Client non trouvé",
                        "Client not found",
                        "/api/clients/" + id + "/password",
                        null
                    ),
                    HttpStatus.NOT_FOUND
                ));
    }
}
