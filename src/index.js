const http = require('http');
const routes = require('./routes');
const bodyParser = require('./helpers/bodyParser');

const server = http.createServer((request, response) => {
  // const parsedUrl = url.parse(request.url, true); DEPRECIADO
  const parsedUrl = new URL(`http://localhost:3000${request.url}`);

  console.log(`Request ${request.method} | Endpoint: ${parsedUrl.pathname}`);

  let { pathname } = parsedUrl;
  let id = null;
  
  //const splitEndpoint = pathname.split('/').filter((item) => Boolean(item));
  const splitEndpoint = pathname.split('/').filter(Boolean);

  if (splitEndpoint.length > 1) {
    pathname = `/${splitEndpoint[0]}/:id`;
    id = splitEndpoint[1];
  }

  const router = routes.find( (route) => (
    route.endpoint === pathname && route.method === request.method
  ));

  if (router) {
    
    request.query = Object.fromEntries(parsedUrl.searchParams);
    request.params = { id };

    response.send = ((statusCode, body) => {
      response.writeHead(statusCode, { 'Content-type': 'application/json' });
      response.end(JSON.stringify(body));
    })

    //if (request.method === 'POST' || request.method === 'PUT') {
    if (['POST', 'PUT'].includes(request.method)) {
      bodyParser(request, () => router.handler(request, response));
    } else {
      router.handler(request, response);
    }
  } else {
    response.writeHead(404, { 'Content-type': 'text/html' });
    response.end(`Cannot ${request.method} ${parsedUrl.pathname}`);
  }

});

server.listen(3000, () => console.log('🚀 Server started at http://localhost:3000'));