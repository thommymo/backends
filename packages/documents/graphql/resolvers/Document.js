const {
  contentUrlResolver,
  metaUrlResolver
} = require('../../lib/resolve')
const {
  processMembersOnlyZonesInContent,
  processRepoImageUrlsInContent,
  processRepoImageUrlsInMeta,
  processImageUrlsInContent
} = require('../../lib/process')
const { getMeta } = require('../../lib/meta')

const { lib: { webp: {
  addSuffix: addWebpSuffix
} } } = require('@orbiting/backend-modules-assets')

const shouldDeliverWebP = (argument = 'auto', req) => {
  if (argument === 'auto') {
    return req.get('Accept').indexOf('image/webp') > -1
  }
  return !!argument
}

module.exports = {
  content (doc, { urlPrefix, searchString, webp }, context, info) {
    // we only do auto slugging when in a published documents context
    // - this is easiest detectable by _all being present from documents resolver
    // - alt check info.path for documents / document being the root
    //   https://gist.github.com/tpreusse/f79833a023706520da53647f9c61c7f6
    if (doc._all) {
      contentUrlResolver(doc, doc._all, doc._usernames, undefined, urlPrefix, searchString)

      if (shouldDeliverWebP(webp, context.req)) {
        processRepoImageUrlsInContent(doc.content, addWebpSuffix)
        processImageUrlsInContent(doc.content, addWebpSuffix)
      }

      processMembersOnlyZonesInContent(doc.content, context.user)
    }
    return doc.content
  },
  meta (doc, { urlPrefix, searchString, webp }, context, info) {
    const meta = getMeta(doc)
    if (doc._all) {
      metaUrlResolver(meta, doc._all, doc._usernames, undefined, urlPrefix, searchString)

      if (shouldDeliverWebP(webp, context.req)) {
        processRepoImageUrlsInMeta(doc.content, addWebpSuffix)
      }
    }
    return meta
  }
}
