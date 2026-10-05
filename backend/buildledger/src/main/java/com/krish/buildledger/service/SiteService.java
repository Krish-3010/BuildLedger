package com.krish.buildledger.service;

import com.krish.buildledger.model.Site;
import com.krish.buildledger.repository.SiteRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SiteService {

    @Autowired
    private SiteRepository siteRepository;

    public List<Site> getAllSites(String username) {
        return siteRepository.findByUsername(username);
    }

    public Site getSiteByName(String username, String siteName) {
        return siteRepository.findByNameAndUsername(siteName, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found"));
    }

    public Site addSite(Site site, String username) {
        site.setUsername(username);
        if (site.getCurSpent() == null) site.setCurSpent(BigDecimal.ZERO);
        if (site.getCurReceived() == null) site.setCurReceived(BigDecimal.ZERO);
        return siteRepository.save(site);
    }

    public Site updateSite(String id, Site updatedSite, String username) {
        ObjectId objId = parseObjectId(id);
        Site existing = siteRepository.findByIdAndUsername(objId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found"));

        existing.setName(updatedSite.getName());
        existing.setAddress(updatedSite.getAddress());
        existing.setActive(updatedSite.isActive());
        if (updatedSite.getBudget() != null) existing.setBudget(updatedSite.getBudget());
        if (updatedSite.getCurSpent() != null) existing.setCurSpent(updatedSite.getCurSpent());
        if (updatedSite.getCurReceived() != null) existing.setCurReceived(updatedSite.getCurReceived());
        if (updatedSite.getDimension() != null) existing.setDimension(updatedSite.getDimension());

        return siteRepository.save(existing);
    }

    public void deleteSite(String id, String username) {
        ObjectId objId = parseObjectId(id);
        Site site = siteRepository.findByIdAndUsername(objId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Site not found"));
        siteRepository.delete(site);
    }

    private ObjectId parseObjectId(String id) {
        try {
            return new ObjectId(id);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Site ID format: " + id);
        }
    }
}