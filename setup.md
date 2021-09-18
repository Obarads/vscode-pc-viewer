# setup
## Create a container on docker.
```bash
docker run -dit --name node14 node
```

## Download packages.
```bash
npm install
```

## Compile codes.
```bash
npm run compile
```

# Option
## update package-lock.json
```bash
npm install -g npm-check-updates # install a package
ncu # check update packages
ncu -u
npm install
```

## npm audit fix
https://fantastech.net/npm-audit-fix-not-working

## local package
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

```
vsce package
```

## vsce publish 401 error
lisz-works.com/entry/vscode-ext-vsce-create-publisher-401error
