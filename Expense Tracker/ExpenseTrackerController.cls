public with sharing class ExpenseTrackerController {

    @AuraEnabled(cacheable=true)
    public static List<Expenses_Tracker__c> getExpenses() {
    return [SELECT Id, Name, Date__c, Payment_Type__c, Description__c, Amount__c FROM Expenses_Tracker__c];
    }
    }
    