package com.krish.buildledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
public class BuildledgerApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(BuildledgerApplication.class, args);
    }

    private static void loadDotEnv() {
        File dir = new File(System.getProperty("user.dir"));
        while (dir != null) {
            File envFile = new File(dir, ".env");
            if (envFile.exists()) {
                try {
                    List<String> lines = Files.readAllLines(envFile.toPath(), StandardCharsets.UTF_8);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    System.out.println("[BuildLedger] Successfully loaded .env from: " + envFile.getAbsolutePath());
                } catch (Exception e) {
                    System.err.println("[BuildLedger] Error reading .env file: " + e.getMessage());
                }
                break;
            }
            dir = dir.getParentFile();
        }
    }
}
