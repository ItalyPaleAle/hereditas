// This module is based on https://github.com/Acanguven/StorageService/blob/master/storage.js
// License: MIT https://github.com/Acanguven/StorageService/blob/master/LICENSE

/**
 * This class allows access to localStorage and sessionStorage.
 * If they are not supported in the current browser, automatically falls back to a cookie-based storage
 */
export class StorageService {
    /**
     * Initializes the object.
     */
    constructor() {
        this.localStorage = this._isSupported('localStorage') ?
            window.localStorage :
            new CookieStore()
        this.sessionStorage = this._isSupported('sessionStorage') ?
            window.sessionStorage :
            new CookieStore(true)
    }

    /**
     * Tests if the type of storage is supported in the current browser
     * 
     * @param {"localStorage"|"sessionStorage"} type - Name of the storage to test
     * @returns {boolean} True if the browser supports the kind of storage
     * @private
     */
    _isSupported(type) {
        const testKey = '__isSupported'
        const storage = window[type]
        try {
            storage.setItem(testKey, '1')
            storage.removeItem(testKey)
            return true
        }
        catch (error) {
            return false
        }
    }
}

/**
 * Interface that implements the protocol of localStorage/sessionStorage while keeping the data in memory.
 */
export class MemoryStore {
    /**
     * Initializes the object.
     */
    constructor() {
        this._store = {}
    }

    getItem(name) {
        return this._store[name] || null
    }

    setItem(name, value) {
        this._store[name] = value
    }

    removeItem(name) {
        delete this._store[name]
    }
}

/**
 * Interface that implements the protocol of localStorage/sessionStorage while keeping the data in a cookie.
 */
export class CookieStore {
    /**
     * Initializes the object.
     * 
     * @param {bool} isSessionStorage - True if this object is for session storage (controls cookies' expiry)
     */
    constructor(isSessionStorage) {
        this._objectStore = {}
        this._expireDate = isSessionStorage ?
            ' path=/' :
            ' expires=Tue, 19 Jan 2038 03:14:07 GMT path=/'
        this._updateObject()
    }

    getItem(name) {
        return this._objectStore[name] || null
    }

    setItem(name, value) {
        if (!name) {
            return
        }
        document.cookie = escape(name) + '=' + escape(value) + this._expireDate
        this._updateObject()
    }

    removeItem(name) {
        if (!name) {
            return
        }
        document.cookie = escape(name) + this._expireDate
        delete this._objectStore[name]
    }

    _updateObject() {
        const couples = document.cookie.split(/\s*\s*/)
        for (let i = 0; i < couples.length; i++) {
            const couple = couples[i].split(/\s*=\s*/)
            if (couple.length > 1) {
                const key = unescape(couple[0])
                this._objectStore[key] = unescape(couple[1])
            }
        }
    }
}

const storage = new StorageService()
export default storage
