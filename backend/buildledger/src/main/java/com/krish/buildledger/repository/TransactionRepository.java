package com.krish.buildledger.repository;

import com.krish.buildledger.model.Transaction;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, ObjectId> {
    List<Transaction> findByUserName(String userName);
    Optional<Transaction> findByIdAndUserName(ObjectId id, String userName);
    List<Transaction> findBySiteIdAndUserName(String siteId, String userName);
}