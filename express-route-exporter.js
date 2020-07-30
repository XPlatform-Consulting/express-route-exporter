#!/usr/bin/env node
const app = require("./app");

// Top level API definition values
const baseApiDef = {
  "openapi": "3.0.2",
  "info": {
    "title": "Express API",
    "version": "1.0.0"
  }
}

// Templates applied to each route by http method to create an API definition path
const templates = {
  default: {
    // operationId: "",
    summary: "",
    tags: [],
    parameters: [],
    responses: {
      "200": {
        description: '',
        content: {

        }
      }
    }
  },
  post: {
    requestBody: {
      content: {}
    }
  }
}

// Create an array of routes
let route, routes = [];
app._router.stack.forEach(function(middleware){
  if(middleware.route){ // routes registered directly on the app
    routes.push(middleware.route);
  } else if(middleware.name === 'router'){ // router middleware
    middleware.handle.stack.forEach(function(handler){
      route = handler.route;
      route && routes.push(route);
    });
  }
});

// console.debug(JSON.stringify(routes, null, 2));
// exit(0)

// Convert routes to API spec paths
const paths = {}
// console.debug( JSON.stringify(routes, null, 2) );
routes.forEach(route => {
  const methods = {}
  Object.keys(route.methods).forEach(method => {
    const data = Object.assign({}, (templates[method] || {}), templates.default);
    data.summary = route.path
    methods[method] = data;

  });
  paths[route.path] = methods;
});

// Construct API definition object
const apiDef = baseApiDef;
apiDef.paths = paths;

// Output API definition as JSON
console.debug(JSON.stringify(apiDef, null, 2));
