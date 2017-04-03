
## Introduction

This is a proof of concept that demonstrates the ability to build a realtime app with an [Angular](https://angular.io) web client (powered by a [Ngrx](http://ngrx.github.io) data architecture) and a [Vert.x](http://vertx.io) server.

Please check the Medium article [Building a realtime web app with Angular/Ngrx and Vert.x](https://medium.com/@benorama/building-a-realtime-web-app-with-angular-ngrx-and-vert-x-a5381c0397a1) for more info.

**Goals**

* share and synchronize a common (Ngrx-based) state between multiple connected clients,
* distribute in realtime (Ngrx-based) actions across multiple connected clients (which impact local states/reducers).

Note: [@ngrx/store](https://github.com/ngrx/store) is a RxJS powered state management inspired by Redux for Angular apps.
It's currently the most popular way to structure complex business logic in Angular apps.

**Demo**

For the demo, the app uses a simple counter example, with increment, decrement and reset actions.

![Demo](https://cloud.githubusercontent.com/assets/394356/24591119/6be5fa04-17fa-11e7-9635-d0ab1de11e70.png)

## Running the apps locally

```
# Clone the repo
git clone https://github.com/benorama/ngrx-realtime-app.git
```

Prerequisites:
* [Typescript 2.0+](https://www.typescriptlang.org/index.html#download-links)
* [Angular CLI](https://cli.angular.io)
* [Java](https://java.com)

### Vertx server app

First, compile and run Vertx app locally.

```
# Go into core module directory
cd ngrx-realtime-app/server

# Build project
./gradlew shadowJar
# Or gradle shadowJar if you have Gradle installed locally

# Run the server app locally
java -jar build/libs/server-1.0.0-fat.jar
```

### Angular client app

```
# Go into Angular app directory
cd ../client

# Install dependencies (you can get a burger...)
npm install
# Or yarn

# Run the client app locally
ng serve
```

To test the app:
* open the client app in two separate browser windows,
* login with 2 different user names,
* increment/decrement/reset counter

## Bugs and feedback

If you have any questions or suggestions to improve the demo app, don't hesitate to submit an issue or a pull request!
