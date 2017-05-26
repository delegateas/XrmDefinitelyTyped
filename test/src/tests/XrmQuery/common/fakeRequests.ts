import * as sinon from 'sinon';

declare var global: any;

abstract class FakeRequests {
    public requests: sinon.SinonFakeXMLHttpRequest[];

    before() {
        global.XMLHttpRequest = sinon.useFakeXMLHttpRequest(); 
        this.requests = [];

        global.XMLHttpRequest.onCreate = xhr => {
            this.requests.push(<sinon.SinonFakeXMLHttpRequest>xhr);
        };
    }

    after() {
        global.XMLHttpRequest.restore();
    }
}

export default FakeRequests;