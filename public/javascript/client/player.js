'use strict';

/**
 * @author Elmario Husha
 * @name CubeWars
 * @package MSc Computer Science - Project
 */

var Player = function(data) {
    this.data   = data.player;
    this.source = data.source;
    this.hasMoved = false;

    this.lastServerConfirmation = data.time;
    this.lastServerTime = data.time;

    var characterGeometry = new THREE.CubeGeometry(250, 250, 250);
    var characterMaterial = Physijs.createMaterial(
        new THREE.MeshLambertMaterial(),
        1,
        0
    );

    var characterMesh = new Physijs.BoxMesh(
        characterGeometry,
        characterMaterial,
        1
    );

    // characterMesh.material.color.setRGB( Math.random() * 100 / 100, Math.random() * 100 / 100, Math.random() * 100 / 100 );
    
    // characterMesh.setAngularFactor(new THREE.Vector3( 0, 0, 0 ));
    // characterMesh.setLinearFactor(new THREE.Vector3( 0, 0, 0 ));

    // characterMesh.setCcdMotionThreshold(1);
    // characterMesh.setCcdSweptSphereRadius(0.2);

    characterMesh.position.x = this.data.positionX;
    characterMesh.position.y = this.data.positionY;
    characterMesh.position.z = this.data.positionZ;

    // characterMesh.quaternion.x = this.data.rotationX;
    // characterMesh.quaternion.y = this.data.rotationY;
    // characterMesh.quaternion.z = this.data.rotationZ;
    // characterMesh.quaternion.w = this.data.rotationW;


    // characterMesh.scale.set(this.data.level / 3, this.data.level / 3, this.data.level / 3);
    characterMesh.material.color.setRGB(0, 1, 0.2, 1);

    characterMesh.receiveShadow = true;
    characterMesh.castShadow = true;

    characterMesh.__dirtyRotation = true;
    characterMesh.__dirtyPosition = true;

    characterMesh.data = this.data;
    characterMesh.source = this.source;
    characterMesh.add(this.nameBuilder(this.data.username));

    characterMesh.getHealthPercentage = function() {
        return (this.data.attributes.health / this.data.attributes.maxHealth) * 100;
    };

    characterMesh.getEnergyPercentage = function() {
        return this.data.attributes.energy;
    };

    characterMesh.getAdrenalinePercentage = function() {
        return this.data.attributes.adrenaline;
    };
    
    characterMesh.updateScale = function() {
        this.scale.set(
            this.data.level / 1.5, 
            this.data.level / 1.5, 
            this.data.level / 1.5
        );
    };

    characterMesh.drawLabels = function() {
        if(this.attributes){
            $('.label-health').html(this.attributes.health);
            $('.label-max-health').html(this.attributes.maxHealth);
            $('.label-energy').html(this.attributes.energy);
        }

        $('.label-level').html(this.data.level);

        $('.label-position-x').html(Math.round(this.position.x), 0);
        $('.label-position-y').html(Math.round(this.position.y), 0);
        $('.label-position-z').html(Math.round(this.position.z), 0);
    };

    return characterMesh;
};

Player.prototype.nameBuilder = function(text) {
    text = text.toUpperCase();
    var canvas = document.createElement('canvas');
    canvas.width  = 240;
    canvas.height = 128;

    var name2d = canvas.getContext('2d');

    name2d.translate( canvas.width/2, canvas.height/2 );
    var fontSize    = 25;
    name2d.font = fontSize + "px Arial";

    var fontH = fontSize;
    var fontW = name2d.measureText(text).width;
    name2d.fillStyle = "rgba(255, 255, 255, 0)";
    var scale  = 2.2;
    name2d.fillRect(-fontW*scale/2,-fontH*scale/1.3,fontW*scale,fontH*scale)
    name2d.fillStyle = "rgba(255, 255, 255, 1)";
    name2d.fillText(text, -fontW/2, 0);

    var nameMaterial = new THREE.MeshBasicMaterial({
        overdraw: true,
        transparent: true,
        map: new THREE.Texture(canvas)
    });

    nameMaterial.map.needsUpdate = true;

    var nameMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(300, 180, 2, 2),
        nameMaterial
    );

    // nameMesh.position.x = 100;
    nameMesh.position.y = 250;
    nameMesh.overdraw = true;
    nameMesh.updateMatrix();

    return nameMesh;
};
