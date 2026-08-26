package com.securetransact.dto;

import com.securetransact.model.Account;
import com.securetransact.model.AccountStatus;
import com.securetransact.model.AccountType;
import lombok.Data;

@Data
public class AccountLookupResponse {
    private Long id;
    private String accountNumber;
    private AccountType accountType;
    private AccountStatus status;
    private String holderFirstName;
    private String holderLastName;

    public static AccountLookupResponse from(Account account) {
        AccountLookupResponse response = new AccountLookupResponse();
        response.setId(account.getId());
        response.setAccountNumber(account.getAccountNumber());
        response.setAccountType(account.getAccountType());
        response.setStatus(account.getStatus());
        response.setHolderFirstName(account.getUser().getFirstName());
        response.setHolderLastName(account.getUser().getLastName());
        return response;
    }
}
