/// <reference path='../../../../../typings/XRM/dg.xrmquery.web.d.ts'/>
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
    "simple filter with special characters"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .filter(x => Filter.equals(x.accountnumber, "*._-~'!()/+@?=:#;,$& %^[]{}<>\"\\|`"))
            .getQueryString();

        expect(qs).to.equal("accounts?$filter=accountnumber eq '*._-~''!()%2F%2B@%3F=:%23;,$%26%20%25%5E%5B%5D%7B%7D%3C%3E%22%5C%7C%60'");
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

        expect(qs).to.equal("accounts?fetchXml=%3Cfetch%20mapping%3D'logical'%3E%3Centity%20name%3D'account'%3E%3Cattribute%20name%3D'accountid'%2F%3E%3Cattribute%20name%3D'name'%2F%3E%3C%2Fentity%3E%3C%2Ffetch%3E");
    }

    @test
    "fetchXml with special characters"() {
        const qs = XrmQuery.retrieveMultiple(x => x.accounts)
            .useFetchXml(`<fetch mapping='logical'><entity name='account'><attribute name='accountid'/><attribute name='name'/><filter><condition attribute="name" operator="eq" value="*._-~&apos;!()/+@?=:#;,$&amp; %^[]{}&lt;&gt;&quot;\\|\`" /></filter></entity></fetch>`)
            .getQueryString();

        expect(qs).to.equal("accounts?fetchXml=%3Cfetch%20mapping%3D'logical'%3E%3Centity%20name%3D'account'%3E%3Cattribute%20name%3D'accountid'%2F%3E%3Cattribute%20name%3D'name'%2F%3E%3Cfilter%3E%3Ccondition%20attribute%3D%22name%22%20operator%3D%22eq%22%20value%3D%22*._-~%26apos%3B!()%2F%2B%40%3F%3D%3A%23%3B%2C%24%26amp%3B%20%25%5E%5B%5D%7B%7D%26lt%3B%26gt%3B%26quot%3B%5C%7C%60%22%20%2F%3E%3C%2Ffilter%3E%3C%2Fentity%3E%3C%2Ffetch%3E");
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