
import { createRefreshToken, type GoogleServiceAccount } from '@william-pack/oauth2'

type CacheToken = {
    onGetToken: () => string | null | Promise< string | null >
    onSetToken: ( token: string ) => void | Promise< void >
}

type CreateOptions = {
    parents: string[]
    mimeType: string
    name: string
}

export class GoogleDrive {

    private cache
    private credential
    private localCache = {
        storage: new Map< 'token' | 'expire', string | number >()
    }

    constructor( credential: GoogleServiceAccount, cacheToken?: CacheToken ) {
        this.credential = credential
        this.cache = cacheToken
    }

    private async getRefreshToken() {
        if ( this.cache && typeof this.cache.onGetToken == "function" ) {
            const token = await this.cache.onGetToken()
            if ( token ) return token
        } else {
            const token = this.localCache.storage.get('token')
            const expire = this.localCache.storage.get('expire')
            if ( token && expire && +expire > Date.now() ) return token
        }
        const token = await createRefreshToken( this.credential, ['https://www.googleapis.com/auth/drive.file'] )
        if ( token ) {
            if ( this.cache && typeof this.cache.onSetToken == "function" ) {
                await this.cache.onSetToken( token )
            } else {
                this.localCache.storage.set( 'token', token )
                this.localCache.storage.set( 'expire', Date.now() + 35e5 )
            }
            return token
        }
        throw new Error("Invalid credential")
    }

    async create( file: File, options: CreateOptions ) {
        const body = new FormData()
        body.append( "metadata", new Blob([ JSON.stringify( options ) ], { type: "application/json" } ))
        body.append( "file", file )
        const token = await this.getRefreshToken()
        const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
            body, method: "POST", headers: { "Authorization": `Bearer ${ token }` }
        })
        const { id } = await response.json() as { id: string }
        return id
    }

    async delete( fileId: string ) {
        const token = await this.getRefreshToken();
        try {
            await fetch( `https://www.googleapis.com/drive/v3/files/${ fileId }`, {
                method: "DELETE", headers: { "Authorization": `Bearer ${ token }` }
            });
            return true
        } catch {
            return false
        }
    }

    async findAll() {
        const token = await this.getRefreshToken();
        try {
            const response = await fetch( `https://www.googleapis.com/drive/v3/files?q='me' in owners&fields=files(id, name)`, {
                method: "GET", headers: { "Authorization": `Bearer ${ token }` }
            });
            const data = await response.json() as { files: { id: string, name: string }[] };
            return data.files
        } catch {
            return []
        }
    }

}
