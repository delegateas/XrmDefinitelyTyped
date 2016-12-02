import { expect } from 'chai';
import { suite, test, slow, timeout, skip, only } from "mocha-typescript";

@suite 
class Web_RetrieveMultiple_QueryString {

    viewId: string;

    before() {
        this.viewId = "SOME_VIEW_ID";
    }

    @test 
    "retrieve accounts"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .getQueryString();

        expect(qs).to.equal("accounts");
    }


    @test 
    "simple select"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .select(x => [x.name, x.accountnumber])
            .getQueryString();

        expect(qs).to.equal("accounts?$select=name,accountnumber");
    }

    @test 
    "multiple query settings"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .skip(5)
            .top(3)
            .getQueryString();

        expect(qs).to.equal("accounts?$skip=5&$top=3");
    }

    @test 
    "order by"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .orderAsc(x => x.accountnumber)
            .orderDesc(x => x.name)
            .getQueryString();

        expect(qs).to.equal("accounts?$orderby=accountnumber asc,name desc");
    }


    @test 
    "simple filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.equals(x.accountnumber, "12345"))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=accountnumber eq '12345'");
    }


    @test 
    "complex filter"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x =>
                Filter.and(
                    Filter.startsWith(x.name, "admin"),
                    Filter.equals(x.accountnumber, "12345")
                )
            )
            .orFilter(x => Filter.notEquals(x.accountid, Filter.makeGuid("SOME-GUID")))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=((startswith(name, 'admin') and accountnumber eq '12345') or accountid ne SOME-GUID)");
    }


    @test 
    "simple expand"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .expand(x => x.contact_customer_accounts)
            .getQueryString();

        expect(qs).to.equal("accounts?$select=contact_customer_accounts&$expand=contact_customer_accounts");
    }

    @test 
    "simple expand with selects"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .expand(x => x.contact_customer_accounts, x => [x.fullname, x.emailaddress1])
            .getQueryString();

        expect(qs).to.equal("accounts?$select=contact_customer_accounts&$expand=contact_customer_accounts($select=fullname,emailaddress1)");
    }

    @test 
    "fetchXml"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .useFetchXml(`<fetch mapping='logical'><entity name='account'><attribute name='accountid'/><attribute name='name'/></entity></fetch>`)
            .getQueryString();

        expect(qs).to.equal("accounts?fetchXml=%3Cfetch%20mapping='logical'%3E%3Centity%20name='account'%3E%3Cattribute%20name='accountid'/%3E%3Cattribute%20name='name'/%3E%3C/entity%3E%3C/fetch%3E");
    }


    @test 
    "userQuery"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .usePredefinedQuery("userQuery", this.viewId)
            .getQueryString();

        expect(qs).to.equal(`accounts?userQuery=${this.viewId}`);
    }

    @test 
    "savedQuery"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .usePredefinedQuery("savedQuery", this.viewId)
            .getQueryString();

        expect(qs).to.equal(`accounts?savedQuery=${this.viewId}`);
    }
}