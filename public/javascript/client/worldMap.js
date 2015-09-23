'use strict';

/**
 * @author Elmario Husha
 * @name CubeWars
 * @package MSc Computer Science - Project
 */

var WorldMap = function(size) {
    this.size = size;
};

WorldMap.prototype = {
    init: function(params, client) {
        this.params = params;
        assetLoader.load('texture', 'generic-ground', 'assets/client/textures/generic.png');

        var _this = this;
        assetLoader.init(function() {
            client.setupEventHandlers();
            _this.buildMap();    
        });
    },

    initSkybox: function() {
        var imagePrefix = "assets/client/textures/default_skybox";
        var directions  = ["0", "1", "2", "3", "4", "5"];
        var imageSuffix = ".jpg";
        var skyGeometry = new THREE.CubeGeometry(this.size + (this.size/10), this.size + (this.size/10), this.size + (this.size/10));   
        var materialArray = [];

        for (var i = 0; i < 6; i++) {
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
                side: THREE.BackSide
            }));
        }

        var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
        var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
        objectManager.add('skybox', skyBox);
    },

    initGround: function() {
        var groundMaterial = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'assets/client/textures/ground.png' ) }),
            0.5,
            0
        );
        groundMaterial.map.wrapS = groundMaterial.map.wrapT = THREE.RepeatWrapping;
        groundMaterial.map.repeat.set(500, 500);
        
        // Ground
        var ground = new Physijs.BoxMesh(
            new THREE.CubeGeometry(this.size, 5000, this.size),
            groundMaterial,
            0
        );

        ground.position.y = -2400;

        ground.receiveShadow = true;
        objectManager.add('ground', ground );
    },

    initLights: function() {
        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(1, 1, 1);
        dirLight.position.set(0, 5000, 0);
        dirLight.position.multiplyScalar( 50 );
        objectManager.add('dirLight', dirLight);
    },

    buildMap: function() {
        this.initSkybox();
        this.initGround();
        // this.initLights();
    }
};