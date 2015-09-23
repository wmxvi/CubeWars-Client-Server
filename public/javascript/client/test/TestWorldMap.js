var expect = chai.expect;

describe('WorldMap', function() {
	describe('#init()', function () {
		it('Should create a new world on the client', function() {
			var world  = new WorldMap(150000);
			expect(typeof world !== 'undefined').to.equal(true);
   		});
	});
});