
/// <reference path="fetch.ts" />
/// <reference path="../../tests/e2e/pub-api.ts" />

//------------------------------------------------------------------------------
   namespace tyns {
//------------------------------------------------------------------------------


export function fetchAndFillInCommentCounts(talkyardServerUrl: St) {
  const urls: St[] = [];
  const countElms: Element[] = [];
  const countElmsColl: NodeListOf<Element> =
          //document.getElementsByClassName('ty_NumCmts') —> HTMLCollectionOf
          document.querySelectorAll('.ty_NumCmts'); // '.ty_NumLikeVotes');

  for (let i = 0; i < countElmsColl.length; ++i) {
    const elm = countElmsColl[i];
    const enclosingLink: HTMLElement | Nl = elm.closest('a[href]')
    if (!enclosingLink) continue;
    let url: St = enclosingLink.getAttribute('href');
    // Don't send URL hash fragment to server.
    // Also skip urls without any '/' — Talkyard wants embedding page paths
    // to either be an origin + full url path, or full url path (incl leading slash).
    url = url.replace(/#.*$/, '');
    if (!url || url.indexOf('/') === -1) {
      console.debug(`Skipping: "${url}", not a complete URL or path`);
      continue;
    }

    console.debug(elm);
    console.debug(enclosingLink);
    console.debug(`URL: ${url}`);

    urls.push(url);
    countElms.push(elm);
  }

  if (urls.length) {
    const pageRefs = urls.map(u => 'emburl:' + u);
    sendFetchRequest(talkyardServerUrl + '/-/v0/get', {
      isCors: true,
      body: {
        getQuery: {
          getPages: pageRefs,
        }
      },
      onOk: (response: GetQueryApiResponse<PageOptFields>) => {
        fillInCounts(response);
      },
      onError: (httpStatusCode: Nr, tyFailCode: St) => {
        fillInCounts({ error: { httpStatusCode, tyFailCode }});
      },
    });
  }

  function fillInCounts(response: GetQueryApiResponse<PageOptFields>) {
    const apiFailInfo: ApiFailInfo | U = (response as ApiErrorResponse).error;

    const anyResult = !apiFailInfo && response as GetQueryResults<PageOptFields>;
    const pagesOrErrs: (PageOptFields | ErrCodeMsg | Z)[] =
            anyResult?.thingsOrErrs || [];

    for (let i = 0; i < countElms.length; ++i) {
      const countElm = countElms[i];
      const pageOrErr = pagesOrErrs[i];

      let numComments: Nr | St = '?';
      let newClasses: St[] | U;

      if (!pageOrErr) {
        newClasses = ['ty_NumCmts-Err', 'ty_NumCmts-Err-' + apiFailInfo?.tyFailCode];
      }
      else {
        const errCode: St | U = (pageOrErr as ErrCodeMsg).errCode;
        if (errCode) {
          // Not Found is returned as error TyEPGNF — and happens also if the embedded
          // discussion just hasn't been created yet, because no comment posted.
          // So, then show 0. (For simplicity, do for all error codes.)
          numComments = 0;
          newClasses = ['ty_NumCmts-Err', 'ty_NumCmts-Err-' + errCode];
        }
        else {
          const page = pageOrErr as PageOptFields;
          numComments = page.numRepliesVisible;
          newClasses = ['ty_NumCmts-Ok'];
        }
      }

      // Not "N comments" — just "N"; then, no need to translate, or pluralis.
      // Almost all? blogs show a comments icon anyway: "N (icon)" not "N comments".
      countElm.innerHTML = '' + numComments;
      countElm.classList.add(...newClasses)
    }
  }
}


//------------------------------------------------------------------------------
   }
//------------------------------------------------------------------------------