/**
 * @author Elmario Husha
 * @name CubeWars
 * @package MSc Computer Science - Project
 */

var assetLoader = {
    _assets: {},
    _queue:  [],
    _loader: new THREE.JSONLoader(),
    _progress: 0,
    _callback: null,

    onLoad: function(index) {
        console.log('AssetLoader', '[LOG]', 'Finished loading: [' + this._queue[index].type + '] ' + this._queue[index].name);
        if (index + 1 < this._queue.length) {
            this.execute(index + 1);
            return;
        }
        this._callback();
        console.log('AssetLoader', '[LOG]', 'Finished loading world assets');
    },
    
    execute: function(index) {
        var _this = this;
        switch(this._queue[index].type) {
            case 'texture':
                this._assets[this._queue[index].name] = THREE.ImageUtils.loadTexture(this._queue[index].url, undefined, function () {
                    _this.onLoad(index);
                });
                break;
            default:
                break;
        }
    },
    
    load: function(type, name, url) {
        this._queue.push({
            type: type,
            name: name,
            url: url
        });
    },
    
    init: function(callback) {
        this._callback = callback;
        this.execute(0);
    },
    
    get: function(name) {
        return this._assets[name];
    }
};