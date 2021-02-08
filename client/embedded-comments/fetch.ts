
/// <reference path="../app-slim/model.ts" />

//------------------------------------------------------------------------------
   namespace tyns {
//------------------------------------------------------------------------------


export interface FetchPostRequest {
  url: St,
}


/// Dev friendly fetch() wrapper.  [FETCHEX]
///
/// Mode 'same-origin': Fails requests to external origins.
/// Mode 'cors': Allows requests to external origins.
///
export function sendFetchRequest(url: St, opts: {
        isCors?: Bo,
        body: Ay | Nl,
        onOk: (response) => Vo,
        onError: ErrorStatusHandler,
        }): AbortController | U {

  // To learn how Fetch works, see:
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#supplying_request_options

  const onOk = opts.onOk;
  const onError = opts.onError;

  const anyAbortController = ('AbortController' in self) ?
          new AbortController() : undefined;

  const reqInit: RequestInit = {
    credentials: 'same-origin',  // | 'include' | 'omit'
    mode: opts.isCors ? 'cors' : 'same-origin',
    referrer: 'no-referrer',
    redirect: 'error',
    signal: anyAbortController ? anyAbortController.signal : undefined,
    headers: {
      'Content-Type': 'application/json',  // don't forget, if POSTing.
    },
  }

  if (opts.body) {
    reqInit.body = JSON.stringify(opts.body);
    reqInit.method = 'POST';
    reqInit.headers = {
      'Content-Type': 'application/json',
    };
  }

  fetch(url, reqInit).then(function(response) {
    // This means the response http headers have arrived — we also need to wait
    // for the response body.
    if (response.status === 200) {
      console.trace(`Request response headers, status 200 OK`);
      response.json().then(function(json) {
        console.debug(`Response json [TyMFETRSP]: ` + JSON.stringify(json));
        onOk(json);
      }).catch(function(reasonMsg) {
        console.warn(`Request failed: Got headers, status 200, but no json [TyEFET0JSON]`,
              reasonMsg);
        onError(200, 'TyEFET0JSON');
      });
    }
    else if (response.status === 408) {
      console.debug(`Request status 408 Timeout [TyEFETTIMT]`);
      onError(response.status, 'TyEFETTIMT');
    }
    else {
      console.warn(`Request error response, status ${response.status} [TyEFETSTS]`);
      onError(response.status, 'TyEFETSTS');
    }
  }).catch(function(error) {
    console.warn(`Request failed, no response [TyEFET0RSP]`, error);
    onError(0, 'TyEFET0RSP');
  });

  return anyAbortController;
}


//------------------------------------------------------------------------------
   }
//------------------------------------------------------------------------------