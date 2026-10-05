package com.krish.buildledger.service;

import com.krish.buildledger.model.Site;
import com.krish.buildledger.model.Transaction;
import com.krish.buildledger.repository.SiteRepository;
import com.krish.buildledger.repository.TransactionRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private SiteRepository siteRepository;

    public List<Transaction> getAllTransactions(String username) {
        return transactionRepository.findByUserName(username);
    }

    public Transaction getTransactionById(String id, String username) {
        ObjectId objId = parseObjectId(id);
        return transactionRepository.findByIdAndUserName(objId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    public Transaction addTransaction(Transaction transaction, String username) {
        transaction.setUserName(username);

        // Normalize type / amount
        if (transaction.getType() == null || transaction.getType().isBlank()) {
            if (transaction.getAmount() != null && transaction.getAmount().compareTo(BigDecimal.ZERO) < 0) {
                transaction.setType("SPENT");
            } else {
                transaction.setType("RECEIVED");
            }
        }

        Transaction saved = transactionRepository.save(transaction);
        updateSiteTotals(transaction.getSiteId(), username);
        return saved;
    }

    public Transaction updateTransaction(String id, Transaction updatedTransaction, String username) {
        ObjectId objId = parseObjectId(id);
        Transaction existing = transactionRepository
                .findByIdAndUserName(objId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        String oldSiteId = existing.getSiteId();

        existing.setSiteId(updatedTransaction.getSiteId());
        existing.setAmount(updatedTransaction.getAmount());
        existing.setDescription(updatedTransaction.getDescription());
        if (updatedTransaction.getType() != null) {
            existing.setType(updatedTransaction.getType());
        }

        Transaction saved = transactionRepository.save(existing);

        // Update site totals for new site and old site if site changed
        updateSiteTotals(existing.getSiteId(), username);
        if (oldSiteId != null && !oldSiteId.equals(existing.getSiteId())) {
            updateSiteTotals(oldSiteId, username);
        }

        return saved;
    }

    public void deleteTransaction(String id, String username) {
        ObjectId objId = parseObjectId(id);
        Transaction transaction = transactionRepository
                .findByIdAndUserName(objId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));

        String siteId = transaction.getSiteId();
        transactionRepository.delete(transaction);
        updateSiteTotals(siteId, username);
    }

    /**
     * Recalculates total curSpent and curReceived for a site based on its transactions.
     */
    private void updateSiteTotals(String siteId, String username) {
        if (siteId == null || siteId.isBlank()) {
            return;
        }

        try {
            ObjectId objId = new ObjectId(siteId);
            Site site = siteRepository.findByIdAndUsername(objId, username).orElse(null);
            if (site == null) {
                return;
            }

            List<Transaction> siteTxs = transactionRepository.findBySiteIdAndUserName(siteId, username);

            BigDecimal totalSpent = BigDecimal.ZERO;
            BigDecimal totalReceived = BigDecimal.ZERO;

            for (Transaction tx : siteTxs) {
                if (tx.getAmount() == null) continue;

                BigDecimal val = tx.getAmount().abs();
                String t = tx.getType();

                if ("SPENT".equalsIgnoreCase(t) || (t == null && tx.getAmount().compareTo(BigDecimal.ZERO) < 0)) {
                    totalSpent = totalSpent.add(val);
                } else if ("RECEIVED".equalsIgnoreCase(t) || (t == null && tx.getAmount().compareTo(BigDecimal.ZERO) >= 0)) {
                    totalReceived = totalReceived.add(val);
                }
            }

            site.setCurSpent(totalSpent);
            site.setCurReceived(totalReceived);
            siteRepository.save(site);
        } catch (Exception e) {
            // Invalid ObjectId format or site not found - ignore silently
        }
    }

    private ObjectId parseObjectId(String id) {
        try {
            return new ObjectId(id);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Transaction ID format: " + id);
        }
    }
}