function extractPathnameSegments(path) {
  const splitUrl = path.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
    action: splitUrl[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.action === 'add') {
    pathname = pathname.concat('/add');
  } else if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/';
}

export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}

export function parseActiveUrlWithCombiner() {
  const url = window.location.hash.slice(1).toLowerCase() || '/';
  const splitedUrl = url.split('/');
  const combinedUrl = splitedUrl[1] ? `/${splitedUrl[1]}` : '/';
  
  if (splitedUrl[2] === 'add') {
    return `${combinedUrl}/add`;
  }
  
  const combinedUrlWithId = splitedUrl[2] ? `${combinedUrl}/:id` : combinedUrl;
  return combinedUrlWithId;
}
