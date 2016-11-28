import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

@suite 
class Web_RetrieveRelated_QueryString {
    
    accountId: string;

    before() {
        this.accountId = "ACCOUNT_ID";
    }

    @test 
    "retrieve accounts"() {
        const qs = XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/primarycontactid`);
    }


    @test 
    "simple select"() {
        const qs = XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .select(x => [x.fullname, x.parentcustomerid_guid])
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/primarycontactid?$select=fullname,_parentcustomerid_value`);
    }



    @test 
    "simple expand"() {
        const qs = XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .expand(x => x.dg_TestAccount)
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/primarycontactid?$select=dg_TestAccount&$expand=dg_TestAccount`);
    }

    @test 
    "expand with selects"() {
        const qs = XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .expand(x => x.dg_TestAccount, x => [x.accountnumber])
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/primarycontactid?$select=dg_TestAccount&$expand=dg_TestAccount($select=accountnumber)`);
    }

    @test 
    "expand with selects and extra options"() {
        const qs = XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .expand(x => x.contact_customer_contacts, x => [x.fullname], { top: 2, sortOrder: SortOrder.Descending, orderBy: x => x.firstname })
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/primarycontactid?$select=contact_customer_contacts&$expand=contact_customer_contacts($select=fullname;$top=2;$orderby=firstname desc)`);
    }

        @test 
        "expand with selects and filters"() {
        const contactId = "CONTACT_ID";
        const contactFirstName = "CONTACT_NAME";

        const qs = XrmQuery.retrieveRelated(x => x.accounts, this.accountId, x => x.primarycontactid)
            .expand(x => x.contact_customer_contacts, x => [x.fullname], 
                { filter: x => 
                    Filter.and(
                        Filter.equals(x.firstname, contactFirstName),
                        Filter.equals(x.contactid, Filter.makeGuid(contactId))
                    )
                }
            )
            .getQueryString();

        expect(qs).to.equal(`accounts(${this.accountId})/primarycontactid?$select=contact_customer_contacts&$expand=contact_customer_contacts($select=fullname;$filter=(firstname eq '${contactFirstName}' and contactid eq ${contactId}))`);
    }

}