'use strict';

/**
 * @author Elmario Husha
 * @name CubeWars
 * @package MSc Computer Science - Project
 */

Physijs.scripts.worker = '/javascript/client/lib/physijs/physijs_worker.js';
Physijs.scripts.ammo   = '../physijs/ammo.js';

/**
 * Game Client Module
 * @module GameClient
 */

var Client = function() {
	var _this = this;

    this.checkCompatibility();
    this._net  = new NetHandler();
    this._time = new Date();
    this._inputs = [];
    this._net.connect(function(connection) {
        if(!connection) {
            alert('Failed to connect to world server');
            return;
        }
    });
};

/**
 * Our game client
 * @type {Object}
 */
Client.prototype = {
    /**
     * Initialise objects and connect to world server
     * @param  {Object} Server Paramms
     */
	init: function() {
	   var _this = this;
        this._clock = new THREE.Clock();
        this._input = new THREEx.KeyboardState();
        this._remote   = {}; 
        this._settings = {
            movementSpeed: 2000,
            rotationSpeed: 2,
            previousState: {px: 0, py: 0, pz: 0}
        };

        this._net.connection.emit('CMSG-PLAYER-JOINED', $('#client').attr('data-token'));
        this._net.connection.on('disconnect', function() {
            window.location = '/login';
            alert('Disconnected from world server');
        });

        this.initCamera();
        this.initRenderer();
        this.initLight();
	},

    /**
     * Check that game client supports WebGL
     */
    checkCompatibility: function() {
        if(typeof io === 'undefined') {
            alert('The CubeWars world is down for maintenance, please try again later');
            return;
        }

        if(!window.WebGLRenderingContext) { 
            alert('Your device does not support WebGL, please update your browser or check device compatibility');
            return;
        }
    },

    /**
     * Initialise the game camera
     */
    initCamera: function() {
        var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100000);
        camera.position.set(Math.cos(Math.PI/4) * 3, 1, Math.sin(Math.PI/4 ) * 3);

        this._scene.add(camera);
        this._camera = camera;
    },

    /**
     * Initialise game lights
     */
    initLight: function() {
        var color = 0xffffff;
        var light = new THREE.DirectionalLight(color, 1.5);

        light.position.set(-10000, 10000, 10000);
        objectManager.add('directional-light-2', light);

        light = new THREE.DirectionalLight(color, 1);
        light.position.set(10000, 5000, -2000);
        objectManager.add('directional-light-3', light);
        light.castShadow = true;

        light.shadowCameraNear = 500;
        light.shadowCameraFar  = 20000;

        light.shadowCameraVisible = false;
        light.shadowCameraLeft  = -10000;
        light.shadowCameraRight = 10000;
        light.shadowCameraTop = 10000;
        light.shadowCameraBottom = -10000;
        light.shadowBias = -0.001;
        light.shadowDarkness = 0.3;
    },

    /**
     * Initialise the renderer
     */
    initRenderer: function() {
        var renderer  = new THREE.WebGLRenderer();
        var container = document.getElementById('client');

        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;

        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        this._container = container;
        this._renderer  = renderer;
    },


    /**
     * Process movement inputs
     */
    initControls: function() {
        var delta = this._clock.getDelta();
        var movementSpeed = (delta * this._settings.movementSpeed);
        var rotationSpeed = this._settings.rotationSpeed;

        var rotateAngle = Math.PI / 2 * (delta * rotationSpeed);
        var relativeCameraOffset = new THREE.Vector3(0, 550, 1300);
        var cameraOffset = relativeCameraOffset.applyMatrix4(this.player.matrixWorld);

        if(this._input.pressed('up') || this._input.pressed('w')) {
            this.player.translateZ(-(movementSpeed));
            this._inputs.push(['mu', -(movementSpeed)]);
            if(this._settings.movementSpeed < 7000){
               this._settings.movementSpeed *= 1.02;
            }

        }

        if(this._input.pressed('down') || this._input.pressed('s')) {
            this.player.translateZ((movementSpeed));
            this._inputs.push(['md', movementSpeed]);
            if(this._settings.movementSpeed < 7000){
               this._settings.movementSpeed *= 1.02;
            }

        }

        if(this._input.pressed('left') || this._input.pressed('a')) {
            this._inputs.push('rl', rotateAngle);
            this.player.rotateOnAxis(
                new THREE.Vector3(0,1,0), rotateAngle
            );
        }

        if(this._input.pressed('right') || this._input.pressed('d')) {
            this._inputs.push(['rr', rotateAngle]);
            this.player.rotateOnAxis(
                new THREE.Vector3(0,1,0), -rotateAngle
            );
        }


        this._camera.position = new THREE.Vector3(
            cameraOffset.x,
            cameraOffset.y,
            cameraOffset.z
        );

        this._camera.lookAt(this.player.position);
    },

    /**
     * Event Handlers for Socket.io
     */
   initOpcodes: function() {
        var _this = this;
        this._net.connection.on('SMSG-INIT-PLAYER', function(data) {
            if(data[0] !== this.socket.sessionid) {
                return;
            }

            _this.player = new Player({
                player: data[1],
                source: data[0],
                time: data[3]
            });

            _this.player.addEventListener('collision', function(object) {
                if(typeof object.data !== 'undefined') {
                    _this.attackedBy(object);
                }
                _this.sendPlayerState();
            });

            _this._remote[data[0]] = _this.player;
            objectManager.add('player_' + data[1].playerId, _this.player);

            var stateInterval = setInterval(function() {
                if(_this._inputs.length > 0) {
                    _this.sendPlayerState();
                } else {
                    _this._settings.movementSpeed = 2000;
                }
            }, 100);

            Object.keys(data[2]).forEach(function(sourceId){
                if(sourceId === _this.player.source) {
                    return;
                }

                var player = new Player({
                    player: data[2][sourceId],
                    source: sourceId,
                    time: data[3]
                });

                if(_this._remote[sourceId] === undefined) {
                    objectManager.add('player_' + data[2][sourceId].playerId, player);
                    _this._remote[sourceId] = player;
                }

		        _this.initControls();
            });

            _this.run();
        });

        this._net.connection.on('SMSG-UPDATE-OTHER-PLAYER-STATE', function(data) {
            if(data[0] == _this.player.source) {
                return;
            }

            var player = objectManager.get('player_' + data[1]);
            var currentPosition = {
                x: player.position.x,
                y: player.position.y,
                z: player.position.z,

                rx: player.rotation.x,
                ry: player.rotation.y,
                rz: player.rotation.z,
                rw: player.position.w
            };
            
            var targetPosition = {
                x: data[2],
                y: data[3],
                z: data[4],

                rx: data[5],
                ry: data[6],
                rz: data[7],
                rw: data[8]
            };

            player.__dirtyRotation = true;
            player.__dirtyPosition = true;

            var timeframe = 100 * 30; // 100ms * 30hz
            var movementTween = new TWEEN.Tween(currentPosition).to(targetPosition, timeframe);
            movementTween.onUpdate(function(){
                player.position.x = targetPosition.x;
                player.position.y = targetPosition.y;
                player.position.z = targetPosition.z;

                player.rotation.x = targetPosition.rx;
                player.rotation.y = targetPosition.ry;
                player.rotation.z = targetPosition.rz;
                player.rotation.w = targetPosition.rw;
            });
            movementTween.start();
        });

        this._net.connection.on('SMSG-UPDATE-PLAYER-STATE', function(state) {
            _this.player.attributes = state[0];
            _this.player.data.level = state[4];

            if(state.length > 2){
                _this.player.position.x = state[1];
                _this.player.position.y = state[2];
                _this.player.position.z = state[3];
                // Fix any client side errors that might be due to prediction
                _this.player.data.positionX = state[1];
                _this.player.data.positionY = state[2];
                _this.player.data.positionZ = state[3];

                // _this.player.quaternion.x = state[4];
                // _this.player.quaternion.y = state[5];
                // _this.player.quaternion.z = state[6];
                // _this.player.quaternion.w = state[7];
            }
        });

        this._net.connection.on('SMSG-DEATH', function() {
            alert('You are dead, 10 seconds until respawn');
            setTimeout(function() {
                _this._net.connection.emit('CSMSG-DEATH-TIMER-COMPLETED');
            }, 10 * 1000);
        });

        this._net.connection.on('SMSG-PLAYER-JOINED', function(data) {
            if(data[0] == _this.player.source) {
                return;
            }

            var player = new Player({
                player: data[1],
                source: data[0],
                time: data[3]
            });

            objectManager.add('player_' + player.data.playerId, player);
            _this._remote[data[0]] = player;
        });

        this._net.connection.on('SMSG-PLAYER-LEFT', function(playerId, clientId) {
            if(clientId == _this.player.source) {
                return;
            }
            var player = _this._remote[clientId];
            objectManager.remove('player_' + playerId);
            delete _this._remote[clientId];
        });

    },

    /**
     * PRocess an attack event
     */
    attackedBy: function(attacker) {
        if(attacker.data.playerId) {
            var packet = [
                attacker.data.playerId
            ];
            this._net.connection.emit('CMSG-HANDLE-ATTACK', packet);
        }
    },

    /**
     * Send current player state to world server
     */
    sendPlayerState: function() {
        var packet = [
            new Date().getTime(),
            this.player.position.x,
            this.player.position.y,
            this.player.position.z,
            this.player.quaternion.x,
            this.player.quaternion.y,
            this.player.quaternion.z,
            this.player.quaternion.w,
            this._inputs
        ];
        this._inputs = [];
        this._net.connection.emit('CMSG-PLAYER-STATE', packet);
    },

    /**
     * Load interactive elements after game has conencted to server
     */
    setupEventHandlers:function() {
        this.initScene();
        this.init();
        this.initOpcodes();
    },

    /**
     * The update loop runner
     */
    run: function() {
        requestAnimationFrame(this.run.bind(this));
        this.player.geometry.verticesNeedUpdate = true;
        this.player.geometry.__dirtyVertices = true;
        this.player.__dirtyRotation = true;
        this.player.__dirtyPosition = true;
        this.update();
    },

    /**
     * Render loop
     */
    render: function() {
        this._renderer.render(this._scene, this._camera);
    },

    /**
     * The update loop update
     */
    update: function() {
        this.player.drawLabels();
        if(typeof TWEEN !== 'undefined'){
            TWEEN.update();
        }
        this.initControls();
        this._scene.simulate();
        this.render();
    },

    /**
     * Draw the game scene and assign ti physics lib
     */
    initScene: function() {
        this._scene = window.gameScene = new Physijs.Scene();
        this._scene.setGravity(new THREE.Vector3(0, -1500, 0));
        this._scene.fog = new THREE.FogExp2(0x000000, 0.00003);
    },
};
