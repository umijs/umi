
## 0.16.0 (2018.1.30)

* Fix: opts.serviceworker typo, sorrycc/roadhog#594
* Feat: compress service-worker.js by default
* Feat: Support hmr via reload with env var process.env.HRM=reload, #64
* Feat: Improve env variables, NO_COMPRESS -> COMPRESS=none, DISABLE_ESLINT => ESLINT=none, #69

## 0.15.0 (2018.1.19)

* Support env variable `DISABLE_CLEAR_CONSOLE` to disable clear console
* Support service worker by config `serviceworker`
* Update deps: react-dev-utils@5
* Update deps: babel@7-beta.38
* Set access-control-allow-origin:* for dev server
* Fix: don't set NODE_ENV to production when NO_COMPRESS is setted
