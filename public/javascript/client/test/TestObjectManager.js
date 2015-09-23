var expect = chai.expect;
window.gameScene = new Physijs.Scene();

describe('ObjectManager', function() {
	describe('#add()', function () {
		it('Should add new object to the scene', function() {
          	var player = new Player({
	            player: {
	            	username: 'testPlayer'
	            },
	            source: '12345',
	            time: new Date().getTime()
	        });

          	// Test
	        objectManager.add('test-object', player);
	        expect(typeof objectManager._objects['test-object'] !== 'undefined').to.equal(true);
   		});
	});

	describe('#register()', function () {
		it('Should assign a name to loaded object', function() {
          	var player = new Player({
	            player: {
	            	username: 'OtherPlayer'
	            },
	            source: '123455',
	            time: new Date().getTime()
	        });
          	objectManager.register('testObject', player);
          	expect(typeof objectManager._objects['testObject'] !== 'undefined').to.equal(true);
   		});
	});

	describe('#remove()', function () {
		it('Should remove a loaded object', function() {
          	var player = new Player({
	            player: {
	            	username: 'OtherPlayerRemove'
	            },
	            source: '45354',
	            time: new Date().getTime()
	        });
          	objectManager.add('OtherPlayerToRemove', player);
          	objectManager.remove('OtherPlayerToRemove');
          	expect(typeof objectManager._objects['OtherPlayerToRemove'] == 'undefined').to.equal(true);
   		});
	});
});