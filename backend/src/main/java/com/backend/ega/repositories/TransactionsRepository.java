package com.backend.ega.repositories;

import com.backend.ega.entities.Account;
import com.backend.ega.entities.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionsRepository extends JpaRepository<Transaction, Long> {
    
    /**
     * Find all transactions for a specific account (as source or destination)
     */
    @Query("SELECT t FROM Transaction t WHERE t.sourceAccount = :account OR t.destinationAccount = :account ORDER BY t.transactionDate DESC")
    List<Transaction> findByAccount(@Param("account") Account account);
    
    /**
     * Find all transactions for a specific account within a date range
     */
    @Query("SELECT t FROM Transaction t WHERE (t.sourceAccount = :account OR t.destinationAccount = :account) " +
           "AND t.transactionDate BETWEEN :startDate AND :endDate ORDER BY t.transactionDate DESC")
    List<Transaction> findByAccountAndDateBetween(
            @Param("account") Account account,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Find all transactions by source account
     */
    List<Transaction> findBySourceAccount(Account account);
    
    /**
     * Find all transactions by source account within a date range
     */
    List<Transaction> findBySourceAccountAndTransactionDateBetween(
            Account account,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find all transactions for a specific client (from all their accounts)
     * This includes transactions from all accounts belonging to the client
     */
    @Query("SELECT t FROM Transaction t " +
           "LEFT JOIN t.destinationAccount da " +
           "WHERE t.sourceAccount.owner.id = :clientId OR da.owner.id = :clientId " +
           "ORDER BY t.transactionDate DESC")
    List<Transaction> findTransactionsByClientId(@Param("clientId") Long clientId);
}
