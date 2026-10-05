package com.krish.buildledger.controller;

import com.krish.buildledger.model.Site;
import com.krish.buildledger.service.SiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sites")
public class SiteController {

    @Autowired
    private SiteService siteService;

    @GetMapping
    public ResponseEntity<List<Site>> getAllSites(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(siteService.getAllSites(username));
    }

    @GetMapping("/name/{siteName}")
    public ResponseEntity<Site> getSiteByName(
            @PathVariable String siteName,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(siteService.getSiteByName(username, siteName));
    }

    @PostMapping
    public ResponseEntity<Site> addSite(
            @RequestBody Site site,
            Authentication authentication
    ) {
        String username = authentication.getName();
        Site savedSite = siteService.addSite(site, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedSite);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Site> updateSite(
            @PathVariable String id,
            @RequestBody Site site,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(siteService.updateSite(id, site, username));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(
            @PathVariable String id,
            Authentication authentication
    ) {
        String username = authentication.getName();
        siteService.deleteSite(id, username);
        return ResponseEntity.noContent().build();
    }
}