package com.krish.buildledger.repository;

import com.krish.buildledger.model.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, ObjectId> {

    Optional<User> findFirstByUsername(String username);

    Optional<User> findFirstByGoogleSubject(String sub);

    Optional<User> findFirstByEmail(String email);

    Optional<User> findFirstByUsernameOrEmail(String username, String email);
}
