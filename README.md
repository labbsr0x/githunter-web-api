# GitHunter Web-API

GitHunter Web-API is a microservice to provide and filter data para o GitHunter Web.
​
## Installation

First, clone the repository.

```bash
git clone https://github.com/labbsr0x/githunter-web-api.git
```
​
Enter root directory from the project and install all dependencies from `node_modules`.
​
```bash
yarn install
```
OR
```bash
npm install
```
​

## Usage

If you want to run in a development environment, run the following command:
```bash
yarn dev
```
OR
```bash
npm run dev
```

But if you want to run in production, run the following commands:
```bash
yarn build && node dist/server.js
```
OR
```bash
npm build && node dist/server.js
```
​
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
​
Please make sure to update tests as appropriate.
​
## License
[MIT](https://choosealicense.com/licenses/mit/)
