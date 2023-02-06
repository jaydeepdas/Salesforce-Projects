import { LightningElement, track, wire } from 'lwc';
import { updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import { createRecord, getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import Date__c from '@salesforce/schema/Expenses_Tracker__c.Date__c';
import Payment_Type__c from '@salesforce/schema/Expenses_Tracker__c.Payment_Type__c.';
import Description__c from '@salesforce/schema/Expenses_Tracker__c.Description__c.';
import Amount__c from '@salesforce/schema/Expenses_Tracker__c.Amount__c.';
import getExpenses from '@salesforce/apex/ExpenseTrackerController.getExpenses';

export default class ExpenseTracker2 extends LightningElement {
@track date;
@track paymentType;
@track description;
@track amount;
@track expenses;
@track columns = [
            { label: 'Date', fieldName: 'Name' },
            { label: 'Payment Type', fieldName: 'Payment_Type__c' },
            { label: 'Description', fieldName: 'Description__c' },
            { label: 'Amount', fieldName: 'Amount__c', type: 'currency' },
            {
                type:'action',
                typeAttributes:{
                    rowActions: [
                        {label: 'Edit',name:'edit'},
                        {label: 'Delete',name:'delete' },
                    ],
                },
                },
        ];

        @wire(getExpenses)
            wiredExpenses({ error, data }) {
                if (data) {
                this.expenses = data;
            } else if (error) {
                console.error('Error getting expenses: ', error);
            }
        }
        handleRowAction(event){
                const actionName = event.detail.action.name;
                const row = event.detail.row;
                switch(actionName){
                    case 'edit':
                    this.handleEditExpense(row, event);
                    break;
                    case 'delete':
                    this.handleDeleteExpense(row, event);
                    break;
                }
        }
        handleEditExpense(row, event){
                const expenseId = row.Id;
                const fields ={
                    'Date__c': row.Date__c,
                    'Payment_Type__c': row.Payment_Type__c,
                    'Description__c': row.Description__c,
                    'Amount__c': row.Amount__c
                };
                const recordInput ={fields,recordId:expenseId};
                updateRecord(recordInput)
                    .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                        title: 'Success',
                        message: 'Expense updated successfully',
                        variant: 'success'
                        })
                    );
                    return refreshApex(this.expenses);
                    })
                    .catch(error => {
                    console.error('Error updating expense: ', error.body.message);
                    });
                }


        handleDeleteExpense(row, event){
            const expenseId = row.Id;
            deleteRecord(expenseId)
                .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                    title: 'Success',
                    message: 'Expense deleted successfully',
                    variant: 'success'
                    })
                );
                return refreshApex(this.expenses);
                })
                .catch(error => {
                console.error('Error deleting expense: ', error.body.message);
                }); 
        }


handleDateChange(event) {
    this.date = event.target.value;
}

handlePaymentTypeChange(event) {
    this.paymentType = event.target.value;
}

handleDescriptionChange(event) {
    this.description = event.target.value;
}

handleAmountChange(event) {
    this.amount = event.target.value;
}

handleAddExpense() {
    const fields = {
    'Date__c': this.date,
    'Payment_Type__c': this.paymentType,
    'Description__c': this.description,
    'Amount__c': this.amount,
    'Name': this.date
    };
            const recordInput = { apiName: 'Expenses_Tracker__c', fields };
            createRecord(recordInput)
            .then(expense => {
            console.log('Expense created with ID: ', expense.id);
            this.dispatchEvent(
            new ShowToastEvent({
            title: 'Success',
            message: 'Expense created successfully',
            variant: 'success'
        })
    );
        this.resetForm();
        return refreshApex(this.expenses);
    })
        .catch(error => {
        console.error('Error creating expense: ', error.body.message);
        this.dispatchEvent(
                new ShowToastEvent({
                title: 'Error creating expense',
                message: error.body.message,
                variant: 'error'
            })
        );
        });
    }

    resetForm() {
        this.date = '';
        this.paymentType = '';
        this.description = '';
        this.amount = '';
        }
}