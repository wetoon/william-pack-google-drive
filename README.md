# @william-pack/google-drive

Google library for handle google drive files

## Installation

Install via npm
```bash
npm install @william-pack/google-drive
```

or using bun
```bash
bun add @william-pack/google-drive
```

## Usage

ESM
```ts
import { GoogleDrive } from '@william-pack/google-drive'
```

CommonJS
```ts
const { GoogleDrive } = require('@william-pack/google-drive')
```

## How to use
### Require
- Google Service Account
### Example
```ts

const credentials = {
    client_email: 'your-service-account@project-id.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n'
}

// Initialize GoogleDrive
const drive = new GoogleDrive(credentials)

// Create a new file
async function uploadFile() {
    const file = new File(['Hello World'], 'test.txt', { type: 'text/plain' })
    const options = {
        parents: ['root'], // Folder ID or 'root' for root directory
        mimeType: 'text/plain',
        name: 'test.txt'
    }
    
    try {
        const fileId = await drive.create(file, options)
        console.log('File uploaded with ID:', fileId)
        
        // List all files
        const files = await drive.findAll()
        console.log('My files:', files)
        
        // Delete the file
        const deleted = await drive.delete(fileId)
        console.log('File deleted:', deleted)
    } catch (error) {
        console.error('Error:', error)
    }
}

uploadFile()
```

## Linked

- [GitHub Repository](https://github.com/wetoon/william-pack-google-drive)
- [NPM Package](https://www.npmjs.com/package/@william-pack/google-drive)

## License

This project is licensed under the [MIT License](LICENSE).