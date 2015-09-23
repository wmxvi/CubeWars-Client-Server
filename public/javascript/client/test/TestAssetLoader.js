var expect = chai.expect;

describe('AssetLoader', function() {

	describe('#testCanLoadNewAsset()', function () {
		it('Should load a new assset into our store', function() {
			assetLoader.load('texture', 'test', '../../../assets/images/logo.png');
			expect(assetLoader._queue.length).to.equal(2); // Already loaded other asset
   		});
	});
});