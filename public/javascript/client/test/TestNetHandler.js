var expect = chai.expect;

describe('NetHandler', function() {

	describe('#testCanConnectToWorldServer', function () {
		it('Should connect to world server', function() {
			var net = new NetHandler();
			net.connect(function() {
				expect(typeof net.connection !== 'undefined').to.equal(true);
			});
   		});
	});
});