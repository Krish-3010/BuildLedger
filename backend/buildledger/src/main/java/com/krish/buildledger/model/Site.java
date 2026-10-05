package com.krish.buildledger.model;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;

@Document(collection = "sites")
public class Site {

    @Id
    private ObjectId id;

    private String name;
    private String username;
    private String address;
    private boolean active;
    private BigDecimal budget;
    private BigDecimal curSpent;
    private BigDecimal curReceived;
    private Dimension dimension;

    /**
     * Returns id as a plain hex string for JSON serialization.
     * Spring Boot uses this getter → frontend receives a plain string id.
     */
    public String getId() {
        return id != null ? id.toHexString() : null;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    // Internal method to get the raw ObjectId for repository operations
    public ObjectId getObjectId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public BigDecimal getCurSpent() {
        return curSpent;
    }

    public void setCurSpent(BigDecimal curSpent) {
        this.curSpent = curSpent;
    }

    public BigDecimal getCurReceived() {
        return curReceived;
    }

    public void setCurReceived(BigDecimal curReceived) {
        this.curReceived = curReceived;
    }

    public Dimension getDimension() {
        return dimension;
    }

    public void setDimension(Dimension dimension) {
        this.dimension = dimension;
    }
}