package com.securetransact.config;

import com.securetransact.model.FraudRuleConfig;
import com.securetransact.repository.FraudRuleConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FraudRuleConfigSeeder implements CommandLineRunner {

    private final FraudRuleConfigRepository ruleConfigRepository;

    @Override
    public void run(String... args) {
        if (ruleConfigRepository.count() > 0) return;

        List<FraudRuleConfig> defaults = List.of(
                FraudRuleConfig.builder()
                        .ruleName("LARGE_AMOUNT")
                        .description("Transaction amount exceeds configured threshold")
                        .enabled(true)
                        .scoreWeight(30)
                        .priority(1)
                        .thresholdNumeric(new BigDecimal("50000"))
                        .build(),
                FraudRuleConfig.builder()
                        .ruleName("NEW_ACCOUNT_LARGE_TXN")
                        .description("Large transaction from account created within threshold days")
                        .enabled(true)
                        .scoreWeight(20)
                        .priority(2)
                        .thresholdNumeric(new BigDecimal("10000"))
                        .thresholdInteger(7)
                        .build(),
                FraudRuleConfig.builder()
                        .ruleName("HIGH_VELOCITY")
                        .description("Too many transactions from account within time window")
                        .enabled(true)
                        .scoreWeight(25)
                        .priority(3)
                        .thresholdInteger(1)
                        .thresholdNumeric(new BigDecimal("5"))
                        .build(),
                FraudRuleConfig.builder()
                        .ruleName("RAPID_TRANSFER")
                        .description("Multiple transfers to same destination in short window")
                        .enabled(true)
                        .scoreWeight(20)
                        .priority(4)
                        .thresholdInteger(10)
                        .thresholdNumeric(new BigDecimal("3"))
                        .build(),
                FraudRuleConfig.builder()
                        .ruleName("ODD_HOURS")
                        .description("Transaction during high-risk time window (1-5 AM)")
                        .enabled(true)
                        .scoreWeight(15)
                        .priority(5)
                        .thresholdInteger(1)
                        .thresholdNumeric(new BigDecimal("5"))
                        .build()
        );

        ruleConfigRepository.saveAll(defaults);
        log.info("Seeded {} fraud rule configurations", defaults.size());
    }
}
