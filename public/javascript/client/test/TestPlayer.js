var expect = chai.expect;

describe('Player', function() {
	describe('#testCanCreateNewPlayer', function () {
		it('Should create a new player', function() {
          	var player = new Player({
	            player: {
	            	username: 'testPlayer2'
	            },
	            source: '12345',
	            time: new Date().getTime()
	        });
   		});
	});
});