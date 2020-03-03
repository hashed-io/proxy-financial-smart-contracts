### Compiler Setup in .env file

The COMPILER variable can either be docker or local - if you have eos-cpp installed on your local machine you can use local, if you want to use a docker container make sure docker is running and it'll do everything for you.

### Tools Setup

```
npm install
npm install -g eoslime
```

# Deploy Tools

Use the compile.js script to 

 * compile all the contracts. They will be stored in the artifacts directory

```
./scripts/compile.js
```

 * deploy and test the contracts respectively

```
npm run deploy
npm run test
```




