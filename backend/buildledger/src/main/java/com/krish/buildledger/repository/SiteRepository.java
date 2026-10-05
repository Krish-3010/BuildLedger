package com.krish.buildledger.repository;

import com.krish.buildledger.model.Site;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteRepository extends MongoRepository<Site, ObjectId> {
    List<Site> findByUsername(String username);
    Optional<Site> findByNameAndUsername(String name, String username);
    Optional<Site> findByIdAndUsername(ObjectId id, String username);
}