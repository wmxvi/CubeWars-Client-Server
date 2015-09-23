/**
 * @author Elmario Husha
 * @name CubeWars
 * @package MSc Computer Science - Project
 */

var objectManager = {
    _objects: {},
    add: function(name, object, parent) {
        parent = (parent !== undefined ? parent : window.gameScene);
        this.register(name, object);
        if(object) {
            if(object.real !== object) {
                object instanceof THREE.Object3D && object.add && object.add(object.real);
            }
            console.log('Adding', name)
            parent.add(object);
        }
    },
    
    register: function(name, object) {
        if(!name) { name = this.id++ };
        if(this._objects[name]) {
            console.error('ObjectManager', '[WARNING]', 'Trying to registered an object with the same name');
        }
        this._objects[name] = object;
        console.log('ObjectManager', '[LOG]', 'Added new object to scene ' + name);
    },

    remove: function(name) {
        window.gameScene.remove(this._objects[name]);
        if(this._objects[name]) {
            delete this._objects[name];
        }
    },
    
    get: function(name) {
        return this._objects[name];
    }
};
